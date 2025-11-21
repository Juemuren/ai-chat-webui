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
  const [messages, setMessages] = useState<ChatMessage[]>([])
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

  // 生成唯一 ID
  const genId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID)
      return crypto.randomUUID()
    // 保留原方法，兼容旧浏览器
    return Date.now() + Math.random().toString(36).slice(2, 8)
  }

  // 插入 AI 占位消息
  const insertAIMsg = (ctx: ChatMessage[], aiMsgId: string): ChatMessage[] => [
    ...ctx,
    {
      id: aiMsgId,
      role: 'assistant' as const,
      content: 'AI 正在思考...',
      timestamp: Date.now(),
    },
  ]

  // 插入 user+AI 占位消息
  const insertUserAndAIMsg = (
    ctx: ChatMessage[],
    userMsg: ChatMessage,
    aiMsgId: string,
  ): ChatMessage[] => [
    ...ctx,
    userMsg,
    {
      id: aiMsgId,
      role: 'assistant' as const,
      content: 'AI 正在思考...',
      timestamp: Date.now(),
    },
  ]

  // AI 流式回复
  const updateAIMsg = (
    msgs: ChatMessage[],
    aiMsgId: string,
    content: string,
  ): ChatMessage[] => {
    const idx = msgs.findIndex((m) => m.id === aiMsgId)
    if (idx >= 0) {
      return msgs.map((m, j) => (j === idx ? { ...m, content } : m))
    } else {
      return msgs
    }
  }

  // 支持传递上下文和内容的 send 方法
  const send = useCallback(
    async (customContext?: ChatMessage[], customUserContent?: string) => {
      const isRegenerate =
        customContext && (!customUserContent || customUserContent === '')
      const text = isRegenerate ? '' : (customUserContent ?? input).trim()
      if ((!isRegenerate && !text) || loading || !model) return
      const aiMsgId = genId()
      if (isRegenerate) {
        setMessages(() => insertAIMsg(customContext!, aiMsgId))
      } else {
        const userMsg: ChatMessage = {
          id: genId(),
          role: 'user' as const,
          content: text,
          timestamp: Date.now(),
        }
        setMessages((msgs) => insertUserAndAIMsg(msgs, userMsg, aiMsgId))
        setInput('')
      }
      setLoading(true)
      try {
        let payload
        if (isRegenerate) {
          payload = {
            model,
            messages: toOllamaMessages(customContext!),
          }
        } else {
          payload = {
            model,
            messages: toOllamaMessages([
              ...(customContext ?? messages),
              {
                id: genId(),
                role: 'user' as const,
                content: text,
                timestamp: Date.now(),
              },
            ]),
          }
        }
        let current = ''
        for await (const chunk of sendChatStream(payload)) {
          current += chunk
          setMessages((msgs) => updateAIMsg(msgs, aiMsgId, current))
        }
      } catch {
        setMessages((msgs) =>
          updateAIMsg(msgs, aiMsgId, 'AI 回复失败，请稍后重试'),
        )
      } finally {
        setLoading(false)
      }
    },
    [input, loading, model, messages],
  )

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
