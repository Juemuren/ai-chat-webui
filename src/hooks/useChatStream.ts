import { useCallback } from 'react'
import type { ChatMessage } from '../types/chat'
import type { OllamaRequest } from '../types/ollama'
import { sendChatStream } from '../services/ollama'
import { updateAIMsg } from '../utils/chatMessage'

interface UseChatStreamProps {
  updateSessionMessages: (
    messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]),
  ) => void
}

export function useChatStream({ updateSessionMessages }: UseChatStreamProps) {
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

  return {
    processStreamResponse,
    handleChatError,
  }
}
