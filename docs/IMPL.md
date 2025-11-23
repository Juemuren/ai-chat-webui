# 实现细节

## 核心数据结构

参阅 `src/types` 目录里的文件 [chat.ts](../src/types/chat.ts)

## 应用整体架构

<!-- TODO Mermaid 图 -->

## 具体功能实现

> [!Note] 以实际代码为准
>
> 这一部分会从源代码中摘出部分作为示例。由于文档可能无法得到及时维护，如有出入，一切请以实际代码为准。

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

### 代码高亮

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
          {/* ... */}
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

### 内容复制

[MessageBubble.tsx](../src/components/ChatMessageItem/MessageBubble.tsx) 和 [MessageActions.tsx](../src/components/ChatMessageItem/MessageActions.tsx) 中都用到了复制功能，实现方法是一样的。

通过自定义 [useCopy](../src/hooks/useCopy.ts) 钩子减少代码重复。该钩子导出一个变量和一个回调函数

- `copied` 表示是否被复制
- `handleCopy` 处理实际的复制逻辑

```jsx
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

## 流式打字机
