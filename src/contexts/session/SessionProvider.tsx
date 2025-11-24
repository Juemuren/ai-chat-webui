import React, { type ReactNode, useCallback, useEffect, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import type { ChatSession, ChatMessage } from '../../types/chat'
import { genId } from '../../utils/chatMessage'
import { SessionContext } from './SessionContext'
import type { SessionContextType } from './types'

// 创建新会话的辅助函数
const createNewSession = (): ChatSession => ({
  id: genId(),
  title: '新对话',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [],
})

// 从第一条用户消息生成会话标题
const generateSessionTitle = (messages: ChatMessage[]): string | null => {
  const firstUserMsg = messages.find((msg) => msg.role === 'user')
  if (!firstUserMsg) return null

  return (
    firstUserMsg.content.slice(0, 30) +
    (firstUserMsg.content.length > 30 ? '...' : '')
  )
}

export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>(
    'chat_sessions',
    [],
  )

  // 初始化活动会话 ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedId = localStorage.getItem('active_session_id')
    if (savedId && sessions.some((session) => session.id === savedId)) {
      return savedId
    }
    return sessions.length > 0 ? sessions[0].id : ''
  })

  // 保存活动会话 ID 到 localStorage
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('active_session_id', activeSessionId)
    }
  }, [activeSessionId])

  // 会话初始化逻辑
  useEffect(() => {
    if (sessions.length === 0) {
      // 没有会话时创建新会话
      setTimeout(() => {
        const newSession = createNewSession()
        setSessions([newSession])
        setActiveSessionId(newSession.id)
      }, 0)
    } else if (!activeSessionId) {
      // 有会话但没有活动会话时，设置第一个会话为活动会话
      setTimeout(() => {
        setActiveSessionId(sessions[0].id)
      }, 0)
    }
  }, [sessions, activeSessionId, setSessions])

  // 获取当前活动会话和消息列表
  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  )
  const currentMessages = activeSession?.messages || []

  // 创建新会话
  const createSession = useCallback(
    (initialTitle?: string) => {
      const newSession = createNewSession()

      // 如果提供了初始标题，则进行替换
      if (initialTitle) {
        newSession.title = initialTitle
      }

      // 更新会话列表并设置为活动会话
      setSessions((prev) => [...prev, newSession])
      setActiveSessionId(newSession.id)

      return newSession.id
    },
    [setSessions],
  )

  // 切换会话
  const switchSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId)
  }, [])

  // 删除会话
  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prevSessions) => {
        const newSessions = prevSessions.filter(
          (session) => session.id !== sessionId,
        )

        // 处理活动会话变更
        if (sessionId === activeSessionId) {
          if (newSessions.length > 0) {
            // 有其他会话时，切换到第一个会话
            setActiveSessionId(newSessions[0].id)
          } else {
            // 没有会话时，创建新会话
            setTimeout(() => createSession(), 0)
          }
        }

        return newSessions
      })
    },
    [activeSessionId, createSession, setSessions],
  )

  // 更新会话标题
  const updateSessionTitle = useCallback(
    (sessionId: string, title: string) => {
      // 只更新非空标题
      if (!title.trim()) return

      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                title: title.trim(),
                updatedAt: Date.now(),
              }
            : session,
        ),
      )
    },
    [setSessions],
  )

  // 更新会话消息
  const updateSessionMessages = useCallback(
    (
      messagesOrUpdater:
        | ChatMessage[]
        | ((prevMessages: ChatMessage[]) => ChatMessage[]),
    ) => {
      if (!activeSessionId) return

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === activeSessionId) {
            // 获取新的消息数组
            const messages =
              typeof messagesOrUpdater === 'function'
                ? messagesOrUpdater(session.messages)
                : messagesOrUpdater

            // 如果会话标题为默认值，尝试从第一条用户消息生成标题
            let updatedTitle = session.title
            if (session.title === '新对话' && messages.length > 0) {
              const generatedTitle = generateSessionTitle(messages)
              if (generatedTitle) {
                updatedTitle = generatedTitle
              }
            }

            // 返回更新后的会话
            return {
              ...session,
              messages,
              updatedAt: Date.now(),
              title: updatedTitle,
            }
          }
          return session
        }),
      )
    },
    [activeSessionId, setSessions],
  )

  const contextValue: SessionContextType = {
    sessions,
    activeSessionId,
    activeSession,
    currentMessages,
    createSession,
    switchSession,
    deleteSession,
    updateSessionMessages,
    updateSessionTitle,
  }

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}
