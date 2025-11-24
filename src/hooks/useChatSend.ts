import { useState, useCallback, useRef } from 'react'
import type { ChatMessage } from '../types/chat'
import type { OllamaRequest } from '../types/ollama'
import { toOllamaMessages } from '../services/chatAdapter'
import {
  genId,
  insertAIMsg,
  insertUserAndAIMsg,
  updateAIMsg,
} from '../utils/chatMessage'

interface UseChatSendProps {
  updateSessionMessages: (
    messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]),
  ) => void
  model: string
  messages: ChatMessage[]
  loading: boolean
  setLoading: (loading: boolean) => void
  processStreamResponse: (
    payload: OllamaRequest,
    signal: AbortSignal,
    aiMsgId: string,
  ) => Promise<void>
  handleChatError: (
    error: unknown,
    signal: AbortSignal,
    aiMsgId: string,
  ) => void
}

export function useChatSend({
  updateSessionMessages,
  model,
  messages,
  loading,
  setLoading,
  processStreamResponse,
  handleChatError,
}: UseChatSendProps) {
  const [input, setInput] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  // 准备聊天消息
  const prepareChatMessages = useCallback(
    (isRegenerate: boolean, customContext?: ChatMessage[], text?: string) => {
      const aiMsgId = genId()

      if (isRegenerate && customContext) {
        updateSessionMessages(insertAIMsg(customContext, aiMsgId))
      } else if (text) {
        const userMsg: ChatMessage = {
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

  // 构建请求 payload
  const buildRequestPayload = useCallback(
    (isRegenerate: boolean, customContext?: ChatMessage[], text?: string) => {
      if (isRegenerate && customContext) {
        return {
          model,
          messages: toOllamaMessages(customContext),
        }
      }

      return {
        model,
        messages: toOllamaMessages([
          ...(customContext ?? messages),
          {
            id: genId(),
            role: 'user',
            content: text!,
            timestamp: Date.now(),
          },
        ]),
      }
    },
    [model, messages],
  )

  // 用于停止生成回复的 stop 回调钩子
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      updateSessionMessages((prevMessages) => {
        const lastMsg = prevMessages[prevMessages.length - 1]
        if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.isFinished) {
          return updateAIMsg(prevMessages, lastMsg.id, lastMsg.content, true)
        }
        return prevMessages
      })
    }
    setLoading(false)
  }, [updateSessionMessages, setLoading])

  // 支持传递上下文和内容的 send 回调钩子
  const send = useCallback(
    async (customContext?: ChatMessage[], customUserContent?: string) => {
      const isRegenerate = (customContext &&
        (!customUserContent || customUserContent === '')) as boolean
      const text = isRegenerate ? '' : (customUserContent ?? input)

      // 验证输入
      if ((!isRegenerate && !text) || loading || !model) return

      // 创建新的 AbortController 用于控制请求
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      const aiMsgId = prepareChatMessages(isRegenerate, customContext, text)
      setLoading(true)

      try {
        const payload = buildRequestPayload(isRegenerate, customContext, text)
        await processStreamResponse(payload, signal, aiMsgId)
      } catch (error) {
        handleChatError(error, signal, aiMsgId)
      } finally {
        setLoading(false)
      }
    },
    [
      input,
      loading,
      model,
      prepareChatMessages,
      buildRequestPayload,
      processStreamResponse,
      handleChatError,
      setLoading,
    ],
  )

  // 重新生成 AI 回复
  const regenerateMessage = useCallback(
    async (message: ChatMessage) => {
      if (loading || message.role !== 'assistant') return

      const idx = messages.findIndex((m) => m.id === message.id)
      if (idx <= 0) return
      const contextMsgs = messages.slice(0, idx)
      await send(contextMsgs, '')
    },
    [messages, loading, send],
  )

  return {
    input,
    setInput,
    send,
    stop,
    regenerateMessage,
  }
}
