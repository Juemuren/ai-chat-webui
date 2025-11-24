import React, { useState } from 'react'
import type { ChatSession } from '../types/chat'

interface UseSessionSidebarProps {
  sessions: ChatSession[]
  onDeleteSession: (sessionId: string) => void
  onUpdateSessionTitle: (sessionId: string, newTitle: string) => void
}

interface UseSessionSidebarReturn {
  editingSessionId: string | null
  editingTitle: string
  formatTime: (timestamp: number) => string
  handleDeleteSession: (e: React.MouseEvent, sessionId: string) => void
  handleStartEditing: (
    e: React.MouseEvent,
    sessionId: string,
    currentTitle: string,
  ) => void
  handleSaveTitle: (sessionId: string) => void
  handleCancelEditing: () => void
  handleKeyDown: (e: React.KeyboardEvent, sessionId: string) => void
  updateEditingTitle: (title: string) => void
}

export const useSessionSidebar = ({
  sessions,
  onDeleteSession,
  onUpdateSessionTitle,
}: UseSessionSidebarProps): UseSessionSidebarReturn => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>('')

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

  // 更新编辑中的标题
  const updateEditingTitle = (title: string) => {
    setEditingTitle(title)
  }

  return {
    editingSessionId,
    editingTitle,
    formatTime,
    handleDeleteSession,
    handleStartEditing,
    handleSaveTitle,
    handleCancelEditing,
    handleKeyDown,
    updateEditingTitle,
  }
}

export default useSessionSidebar
