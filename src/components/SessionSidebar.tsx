import React from 'react'
import type { ChatSession } from '../types/chat'
import './SessionSidebar.css'

interface SessionSidebarProps {
  sessions: ChatSession[]
  activeSessionId: string
  onSessionClick: (sessionId: string) => void
  onCreateSession: () => void
  onDeleteSession: (sessionId: string) => void
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  activeSessionId,
  onSessionClick,
  onCreateSession,
  onDeleteSession,
}) => {
  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

    if (diffInMinutes < 1) {
      return '刚刚'
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}分钟前`
    } else if (diffInMinutes < 60 * 24) {
      return `${Math.floor(diffInMinutes / 60)}小时前`
    } else if (diffInMinutes < 60 * 24 * 7) {
      return `${Math.floor(diffInMinutes / 60 / 24)}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
      })
    }
  }

  // 处理删除会话
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    if (window.confirm('确定要删除这个会话吗？')) {
      onDeleteSession(sessionId)
    }
  }

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
              <div className="session-title">{session.title}</div>
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
