import { useState } from 'react'
import { useSession } from '../hooks/useSession'
import { useModel } from './useModel'
import { useChatStream } from './useChatStream'
import { useChatSend } from './useChatSend'

export function useChat() {
  // 组合钩子
  const { currentMessages: messages, updateSessionMessages } = useSession()
  const { models, model, setModel } = useModel()
  const { processStreamResponse, handleChatError } = useChatStream({
    updateSessionMessages,
  })
  const [loading, setLoading] = useState(false)
  const { input, setInput, send, stop, regenerateMessage } = useChatSend({
    updateSessionMessages,
    model,
    messages,
    loading,
    setLoading,
    processStreamResponse,
    handleChatError,
  })

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
    regenerateMessage,
  }
}
