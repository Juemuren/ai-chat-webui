import { useState, useEffect, useCallback, useRef } from 'react'
import type { ChatMessage } from '../types/chat'
import type { OllamaRequest } from '../types/ollama'
import { fetchModels, sendChatStream } from '../services/ollama'
import { toOllamaMessages } from '../services/chatAdapter'
import { useSession } from '../hooks/useSession'
import {
  genId,
  insertAIMsg,
  insertUserAndAIMsg,
  updateAIMsg,
} from '../utils/chatMessage'

export function useChat() {
  // 使用 SessionContext 获取会话状态和方法
  const { currentMessages: messages, updateSessionMessages } = useSession()
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

  // 处理流式响应
  const processStreamResponse = useCallback(
    async (payload: OllamaRequest, signal: AbortSignal, aiMsgId: string) => {
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

  // 处理错误
  const handleChatError = useCallback(
    (error: unknown, signal: AbortSignal, aiMsgId: string) => {
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

  const abortControllerRef = useRef<AbortController | null>(null)

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
  }, [updateSessionMessages])

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
    ],
  )

  return {
    messages,
    input,
    setInput,
    send,
    stop,
    loading,
    models,
    model,
    setModel,
  }
}
