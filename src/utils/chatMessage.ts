import type { ChatMessage } from '../types/chat'

export function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID)
    return crypto.randomUUID()
  return Date.now() + Math.random().toString(36).slice(2, 8)
}

export function insertAIMsg(
  ctx: ChatMessage[],
  aiMsgId: string,
): ChatMessage[] {
  return [
    ...ctx,
    {
      id: aiMsgId,
      role: 'assistant' as const,
      content: 'AI 正在思考...',
      timestamp: Date.now(),
    },
  ]
}

export function insertUserAndAIMsg(
  ctx: ChatMessage[],
  userMsg: ChatMessage,
  aiMsgId: string,
): ChatMessage[] {
  return [
    ...ctx,
    userMsg,
    {
      id: aiMsgId,
      role: 'assistant' as const,
      content: 'AI 正在思考...',
      timestamp: Date.now(),
    },
  ]
}

export function updateAIMsg(
  msgs: ChatMessage[],
  aiMsgId: string,
  content: string,
): ChatMessage[] {
  const idx = msgs.findIndex((m) => m.id === aiMsgId)
  if (idx >= 0) {
    return msgs.map((m, j) => (j === idx ? { ...m, content } : m))
  } else {
    return msgs
  }
}
