import React, { type ReactNode, useCallback, useEffect, useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import type { ChatSession, ChatMessage } from '../../types/chat'
import { genId } from '../../utils/chatMessage'
import { SessionContext } from './SessionContext'
import type { SessionContextType } from './types'

export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // 从 localStorage 加载会话列表
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>(
    'chat_sessions',
    [],
  )

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedId = localStorage.getItem('active_session_id')
    if (savedId && sessions.some((session) => session.id === savedId)) {
      return savedId
    }
    return sessions.length > 0 ? sessions[0].id : ''
  })

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('active_session_id', activeSessionId)
    }
  }, [activeSessionId])

  // 会话初始化
  useEffect(() => {
    if (sessions.length === 0) {
      setTimeout(() => {
        const newSessionId = genId()
        const newSession: ChatSession = {
          id: newSessionId,
          title: '新对话',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        }
        setSessions([newSession])
        setActiveSessionId(newSessionId)
      }, 0)
    } else if (!activeSessionId) {
      // 如果有会话但没有活动会话，设置第一个会话为活动会话
      setTimeout(() => {
        setActiveSessionId(sessions[0].id)
      }, 0)
    }
  }, [sessions, activeSessionId, setSessions])

  // 获取当前活动会话
  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  )

  // 当前活动会话的消息列表
  const currentMessages = activeSession?.messages || []

  // 创建新会话
  const createSession = useCallback(
    (initialTitle?: string) => {
      const newSession: ChatSession = {
        id: genId(),
        title: initialTitle || '新对话',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      }

      // 确保状态更新
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

        // 如果删除的是当前活动会话，切换到第一个会话或创建新会话
        if (sessionId === activeSessionId) {
          if (newSessions.length > 0) {
            setActiveSessionId(newSessions[0].id)
          } else {
            // 延迟创建新会话，避免级联渲染
            setTimeout(() => {
              createSession()
            }, 0)
          }
        }

        return newSessions
      })
    },
    [activeSessionId, createSession, setSessions],
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
            // 根据参数类型获取新的消息数组
            const messages =
              typeof messagesOrUpdater === 'function'
                ? messagesOrUpdater(session.messages)
                : messagesOrUpdater

            // 如果是第一条用户消息，用它来更新会话标题
            let updatedTitle = session.title
            if (session.title === '新对话' && messages.length >= 1) {
              const firstUserMsg = messages.find((msg) => msg.role === 'user')
              if (firstUserMsg) {
                updatedTitle =
                  firstUserMsg.content.slice(0, 30) +
                  (firstUserMsg.content.length > 30 ? '...' : '')
              }
            }

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
  }

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}
