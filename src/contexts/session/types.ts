import type { ChatSession, ChatMessage } from '../../types/chat'

export interface SessionContextType {
  sessions: ChatSession[]
  activeSessionId: string
  activeSession: ChatSession | undefined
  currentMessages: ChatMessage[]
  createSession: (initialTitle?: string) => string
  switchSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void
  updateSessionMessages: (
    messagesOrUpdater:
      | ChatMessage[]
      | ((prevMessages: ChatMessage[]) => ChatMessage[]),
  ) => void
}
