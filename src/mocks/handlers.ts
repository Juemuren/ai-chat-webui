import { http, HttpResponse } from 'msw'
import type { OllamaRequest } from '../types/ollama'

const models = [
  { name: 'llama2', size: 123 },
  { name: 'mistral', size: 456 },
]

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
      // 简单地重复用户输入，方便后续调试
      const reply = `Mock Enable: \n\n${userMsg}`
      // 模拟流式响应
      const chunks = reply.match(/[\s\S]{1,5}/g) || []

      const stream = new ReadableStream({
        start(controller) {
          chunks.forEach((chunk, i) =>
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
            ),
          )
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
