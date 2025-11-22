import React from 'react'
import type { ChatSession } from '../types/chat'
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
  // 跟踪当前正在编辑的会话ID
  const [editingSessionId, setEditingSessionId] = React.useState<string | null>(
    null,
  )
  // 存储编辑中的标题
  const [editingTitle, setEditingTitle] = React.useState<string>('')
  // 引用编辑输入框
  const editInputRef = React.useRef<HTMLInputElement>(null)
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

  // 开始编辑会话标题
  const handleStartEditing = (
    e: React.MouseEvent,
    sessionId: string,
    currentTitle: string,
  ) => {
    e.stopPropagation() // 阻止事件冒泡，避免触发会话点击
    setEditingSessionId(sessionId)
    setEditingTitle(currentTitle)
  }

  // 保存编辑后的会话标题
  const handleSaveTitle = (sessionId: string) => {
    const trimmedTitle = editingTitle.trim()
    if (
      trimmedTitle &&
      trimmedTitle !== sessions.find((s) => s.id === sessionId)?.title
    ) {
      onUpdateSessionTitle(sessionId, trimmedTitle)
    }
    setEditingSessionId(null)
  }

  // 取消编辑
  const handleCancelEditing = () => {
    setEditingSessionId(null)
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === 'Enter') {
      handleSaveTitle(sessionId)
    } else if (e.key === 'Escape') {
      handleCancelEditing()
    }
  }

  // 当编辑会话ID变化时，聚焦到输入框
  React.useEffect(() => {
    if (editingSessionId && editInputRef.current) {
      // 使用setTimeout确保DOM已更新
      setTimeout(() => {
        editInputRef.current?.focus()
        // 选中整个输入内容
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
                  onChange={(e) => setEditingTitle(e.target.value)}
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
