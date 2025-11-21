import { useState, useEffect, useCallback } from 'react'
import type { ChatMessage } from '../types/chat'
import { fetchModels, sendChatStream } from '../services/ollama'
import { toOllamaMessages } from '../services/chatAdapter'
import { useLocalStorage } from './useLocalStorage'
import {
  genId,
  insertAIMsg,
  insertUserAndAIMsg,
  updateAIMsg,
} from '../utils/chatMessage'

export function useChat() {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(
    'chat_messages',
    [],
  )
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
          role: 'user',
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
                role: 'user',
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
        // 回复结束，标记 isFinished
        setMessages((msgs) => updateAIMsg(msgs, aiMsgId, current, true))
      } catch (e) {
        // 回复出错，标记 isError
        console.log(e)
        setMessages((msgs) =>
          updateAIMsg(
            msgs,
            aiMsgId,
            'AI 回复失败，请稍后重试',
            undefined,
            true,
          ),
        )
      } finally {
        setLoading(false)
      }
    },
    [input, loading, model, messages, setMessages],
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
