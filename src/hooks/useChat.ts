import { useState, useEffect, useCallback } from 'react'
import type { ChatMessage } from '../types/chat'
import {
  fetchModels,
  // sendChat,
  sendChatStream,
} from '../services/ollama'
import {
  toOllamaMessages,
  // fromOllamaMessage
} from '../services/chatAdapter'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init1',
      role: 'assistant',
      content: '你好！我是 AI 助手，你需要什么帮助？',
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [models, setModels] = useState<{ name: string }[]>([])
  const [model, setModel] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchModels()
      .then((list) => {
        setModels(list)
        if (list.length > 0) setModel(list[0].name)
      })
      .catch(() => setModels([]))
  }, [])

  // 打字机流式效果
  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading || !model) return
    const userMsg: ChatMessage = {
      id: Date.now() + Math.random().toString(36).slice(2, 8),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    setMessages((msgs) => [...msgs, userMsg])
    setInput('')
    setLoading(true)
    try {
      const payload = {
        model,
        messages: toOllamaMessages([...messages, userMsg]),
      }
      const aiMsgId = Date.now() + Math.random().toString(36).slice(2, 8)
      let current = ''
      for await (const chunk of sendChatStream(payload)) {
        current += chunk
        setMessages((msgs) => {
          const idx = msgs.findIndex((m) => m.id === aiMsgId)
          if (idx >= 0) {
            return msgs.map((m, j) =>
              j === idx ? { ...m, content: current } : m,
            )
          } else {
            return [
              ...msgs,
              {
                id: aiMsgId,
                role: 'assistant',
                content: current,
                timestamp: Date.now(),
              },
            ]
          }
        })
      }
    } catch {
      setMessages((msgs) => [
        ...msgs,
        {
          id: Date.now() + Math.random().toString(36).slice(2, 8),
          role: 'assistant',
          content: 'AI 回复失败，请稍后重试',
          timestamp: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, model, messages])

  return {
    messages,
    input,
    setInput,
    send,
    loading,
    models,
    model,
    setModel,
  }
}
