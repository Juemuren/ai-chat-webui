import React, { useRef, useEffect } from 'react'
import type { ChatMessage } from '../types/chat'
import { ChatMessageItem } from './ChatMessageItem'
import './ChatMessageList.css'

interface ChatMessageListProps {
  messages: ChatMessage[]
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
}) => {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 新消息出现时自动滚动到底部
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="chat-message-list" ref={listRef}>
      {messages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}
    </div>
  )
}
