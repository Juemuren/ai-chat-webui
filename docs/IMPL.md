# 实现细节

## 核心数据结构

参阅 `src/types` 目录里的文件 [chat.ts](../src/types/chat.ts)

## 应用整体架构

<!-- TODO Mermaid 图 -->

## 具体功能实现

> [!Note] 以实际代码为准
>
> 这一部分会从源代码中摘出部分作为示例。由于文档可能无法得到及时维护，如有出入，一切请以实际代码为准。
>
> 为了突出逻辑，代码示例中擦除了类型，并对重新处理了缩进

### Markdown 渲染

使用了第三方库 [react-markdown](https://www.npmjs.com/package/react-markdown)

主要代码在 [MessageBubble.tsx](../src/components/ChatMessageItem/MessageBubble.tsx) 文件中

```jsx
import Markdown from 'react-markdown'

const MessageBubble = ({ message }) => {
  if (message.role === 'assistant') {
    return (
      <div className="markdown-body">
        <Markdown components={{ code: CodeBlock }}>{message.content}</Markdown>
      </div>
    )
  }
  return <pre>{message.content}</pre>
}
```

#### 代码高亮

使用了第三方库 [react-syntax-highlighter](https://www.npmjs.com/package/react-syntax-highlighter)

主要代码也在 [MessageBubble.tsx](../src/components/ChatMessageItem/MessageBubble.tsx) 文件中

不过此处遇到了一些奇怪的问题。尽管我几乎和[官方文档](https://www.npmjs.com/package/react-syntax-highlighter#prism)的做法完全一样，但还是遇到了类型问题的警告。因此这里出现了本项目的第一个 `// @ts-expect-error`，希望这也是最后一个 `:(`

```jsx
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeBlock = memo(
  ({ children, className, ...rest }) => {
    // ...
    if (lang) {
      return (
        <div className="codeblock-wrapper">
          <div className="codeblock-header">
            <span className="codeblock-lang">{lang}</span>
            <button
              className="codeblock-copy-btn"
              onClick={handleCopy}
              title="复制代码"
              type="button"
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <SyntaxHighlighter
            language={lang}
            PreTag="div"
            // @ts-expect-error
            style={prism}
            {...rest}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      )
    }
    return (
      <code className={className} {...rest}>
        {codeString}
      </code>
    )
  },
)
```

#### 一键复制

[MessageBubble.tsx](../src/components/ChatMessageItem/MessageBubble.tsx) 和 [MessageActions.tsx](../src/components/ChatMessageItem/MessageActions.tsx) 中都用到了复制功能，实现方法是一样的。

通过自定义 [useCopy](../src/hooks/useCopy.ts) 钩子减少代码重复。该钩子导出一个变量和一个回调函数

- `copied` 表示是否被复制
- `handleCopy` 处理实际的复制逻辑

```js
export const useCopy = (content) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }, [content])

  return { copied, handleCopy }
}
```

### 流式打字机

#### 流式接口的响应

我先使用了 Ollama 的流式接口，测试文件在 [ollama.rest](../requests/ollama.rest) 中。响应大概是这样的

```json
{"model":"自定义测试","message":{"role":"assistant","content":"这是自定义"},"done":false}
{"model":"自定义测试","message":{"role":"assistant","content":"测试，只会"},"done":false}
{"model":"自定义测试","message":{"role":"assistant","content":"简单地重复"},"done":false}
{"model":"自定义测试","message":{"role":"assistant","content":"你的输入\n"},"done":false}
{"model":"自定义测试","message":{"role":"assistant","content":"\n你好"},"done":true}

```

后来使用 *Mock* 模拟数据时自己实现了一个流式接口，代码在 [handlers.ts](../src/mocks/handlers.ts) 文件中

```js
const chunks = reply.match(/[\s\S]{1,5}/g) || []
const delay = 50

const stream = new ReadableStream({
  async start(controller) {
    for (let i = 0; i < chunks.length; i++) {
      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, delay))
      const chunk = chunks[i]
      controller.enqueue(
        new TextEncoder().encode(
          JSON.stringify({
            model,
            message: {
              role: 'assistant',
              content: chunk,
            },
            done: i === chunks.length - 1,
          }) + '\n',
        ),
      )
    }
    controller.close()
  },
})

return new HttpResponse(stream, {
  headers: {
    'Content-Type': 'application/x-ndjson',
  },
})
```

#### 对响应的处理

主要代码在 [useChatStream.ts](../src/hooks/useChatStream.ts) 和 [ollama.ts](../src/services/ollama.ts) 中。处理时没有用到响应的 `done` 字段

```js
// ollama.ts
export async function* sendChatStream(payload, signal) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...payload, stream: true }),
    signal,
  })

  if (!res.ok || !res.body) throw new Error('Stream response error')
  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    // 按行分割处理 JSON
    let idx
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim()
      buffer = buffer.slice(idx + 1)
      if (!line) continue
      try {
        const obj = JSON.parse(line)
        if (obj.message && obj.message.content) {
          yield obj.message.content
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}

// useChatStream.ts
const processStreamResponse = useCallback(
  async (payload, signal, aiMsgId) => {
    let current = ''
    for await (const chunk of sendChatStream(payload, signal)) {
      current += chunk
      updateSessionMessages((prevMessages) =>
        updateAIMsg(prevMessages, aiMsgId, current),
      )
    }
    // 回复结束，标记 isFinished
    updateSessionMessages((prevMessages) =>
      updateAIMsg(prevMessages, aiMsgId, current, true),
    )
  },
  [updateSessionMessages],
)

```

### 提示信息

#### 加载

主要代码在 [chatMessage.ts](../src/utils/chatMessage.ts) 和 [useChatSend.ts](../src/hooks/useChatSend.ts) 中

```js
// chatMessage.ts
export function insertAIMsg(ctx, aiMsgId) {
  return [
    ...ctx,
    {
      id: aiMsgId,
      role: 'assistant',
      content: 'AI 正在思考...',
      timestamp: Date.now(),
    },
  ]
}

// useChatSend.ts
const prepareChatMessages = useCallback(
  (isRegenerate, customContext, text) => {
    const aiMsgId = genId()

    if (isRegenerate && customContext) {
      updateSessionMessages(insertAIMsg(customContext, aiMsgId))
    } else if (text) {
      const userMsg = {
        id: genId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      }
      updateSessionMessages((prevMessages) =>
        insertUserAndAIMsg(prevMessages, userMsg, aiMsgId),
      )
      setInput('')
    }

    return aiMsgId
  },
  [updateSessionMessages, setInput],
)
```

#### 错误

代码主要在 [useChatStream.ts](../src/hooks/useChatStream.ts) 中

```js
// 处理错误
const handleChatError = useCallback(
  (error, signal, aiMsgId) => {
    if (signal.aborted) {
      console.log('生成已停止')
    } else {
      // 回复失败，标记 isError
      console.log(error)
      updateSessionMessages((prevMessages) =>
        updateAIMsg(
          prevMessages,
          aiMsgId,
          'AI 回复失败，请稍后重试',
          undefined,
          true,
        ),
      )
    }
  },
  [updateSessionMessages],
)
```

### 重新生成

代码主要在 [useChatSend.ts](../src/hooks/useChatSend.ts) 中

```js
// 重新生成 AI 回复
const regenerateMessage = useCallback(
  async (message: ChatMessage) => {
    if (loading || message.role !== 'assistant') return
    
    const idx = messages.findIndex((m) => m.id === message.id)
    if (idx <= 0) return
    const contextMsgs = messages.slice(0, idx)
    await send(contextMsgs, '')
  },
  [messages, loading, send]
)
```

至于复制回复内容的功能，和复制代码块的实现是一样的，可阅读[一键复制](#一键复制)部分来了解
