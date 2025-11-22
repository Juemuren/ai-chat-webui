import { http, HttpResponse } from 'msw'
import type { OllamaRequest } from '../types/ollama'
import loader from './loader'

const models = [
  { name: 'Markdown 渲染测试' },
  { name: '代码块测试' },
  { name: '长文本测试' },
  { name: '自定义测试' },
]

const files = await loader()

export const handlers = [
  // 模型列表
  http.get('http://localhost:11434/api/tags', () => {
    return HttpResponse.json({ models })
  }),

  // 聊天流式接口
  http.post<never, OllamaRequest>(
    'http://localhost:11434/api/chat',
    async ({ request }) => {
      const { messages, model } = await request.json()
      const userMsg = messages[messages.length - 1]?.content || ''
      let reply = ''
      switch (model) {
        case 'Markdown 渲染测试':
          {
            const file = files.find((f) => f.filename === 'Markdown.md')
            reply = file ? file.content : '未找到 Markdown 渲染测试文件'
          }
          break
        case '代码块测试':
          {
            const file = files.find((f) => f.filename === 'CodeBlock.md')
            reply = file ? file.content : '未找到代码块测试文件'
          }
          break

        case '长文本测试':
          {
            const file = files.find((f) => f.filename === 'LongText.md')
            reply = file ? file.content : '未找到长文本测试文件'
          }
          break

        case '自定义测试':
          {
            reply = `这是自定义测试，只会简单地重复你的输入\n\n${userMsg}`
          }
          break
        default:
          break
      }
      // 模拟流式响应
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
    },
  ),
]
