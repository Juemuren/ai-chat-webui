import React, { useEffect, useRef } from 'react'
import type { ChatSession } from '../types/chat'
import { useSessionSidebar } from '../hooks/useSessionSidebar'
import './SessionSidebar.css'

interface SessionSidebarProps {
  sessions: ChatSession[]
  activeSessionId: string
  onSessionClick: (sessionId: string) => void
  onCreateSession: () => void
  onDeleteSession: (sessionId: string) => void
  onUpdateSessionTitle: (sessionId: string, newTitle: string) => void
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  activeSessionId,
  onSessionClick,
  onCreateSession,
  onDeleteSession,
  onUpdateSessionTitle,
}) => {
  const {
    editingSessionId,
    editingTitle,
    formatTime,
    handleDeleteSession,
    handleStartEditing,
    handleSaveTitle,
    handleKeyDown,
    updateEditingTitle,
  } = useSessionSidebar({
    sessions,
    onDeleteSession,
    onUpdateSessionTitle,
  })

  const editInputRef = useRef<HTMLInputElement>(null)

  // 当编辑会话 ID 变化时，聚焦到输入框
  useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      setTimeout(() => {
        editInputRef.current?.focus()
        editInputRef.current?.select()
      }, 0)
    }
  }, [editingSessionId])

  return (
    <div className="session-sidebar">
      <div className="sidebar-header">
        <h3>会话</h3>
        <button
          className="new-chat-btn"
          onClick={onCreateSession}
          title="新建对话"
        >
          +
        </button>
      </div>

      <div className="session-list">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`session-item ${session.id === activeSessionId ? 'active' : ''}`}
            onClick={() => onSessionClick(session.id)}
          >
            <div className="session-content">
              {editingSessionId === session.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  className="session-title-edit"
                  value={editingTitle}
                  onChange={(e) => updateEditingTitle(e.target.value)}
                  onBlur={() => handleSaveTitle(session.id)}
                  onKeyDown={(e) => handleKeyDown(e, session.id)}
                  placeholder="输入会话标题"
                />
              ) : (
                <div
                  className="session-title"
                  onClick={(e) =>
                    handleStartEditing(e, session.id, session.title)
                  }
                  title="点击编辑会话名称"
                >
                  {session.title}
                </div>
              )}
              <div className="session-meta">
                <span className="session-time">
                  {formatTime(session.updatedAt)}
                </span>
                <span className="session-message-count">
                  {/* 简单地除以 2 */}
                  {session.messages.length / 2}
                </span>
              </div>
            </div>
            <button
              className="delete-session-btn"
              onClick={(e) => handleDeleteSession(e, session.id)}
              title="删除会话"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SessionSidebar
