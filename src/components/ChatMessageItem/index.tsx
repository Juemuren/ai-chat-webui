import React, { useCallback } from 'react'
import type { ChatMessage } from '../../types/chat'

import MessageActions from './MessageActions'
import MessageBubble from './MessageBubble'
import './index.css'

import AssistantAvatar from '../../assets/ollama.png'
import UserAvatar from '../../assets/sakiko.jpg'

interface ChatMessageItemProps {
  message: ChatMessage
}

const roleInfo = {
  user: {
    name: 'ME',
    avatar: UserAvatar,
    bubbleClass: 'chat-bubble-user',
  },
  assistant: {
    name: 'AI',
    avatar: AssistantAvatar,
    bubbleClass: 'chat-bubble-ai',
  },
} as const

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
}) => {
  const info = roleInfo[message.role]

  // 重新生成事件
  const handleRegenerate = useCallback(() => {
    const event = new CustomEvent('regenerate-ai-message', {
      detail: { message },
    })
    window.dispatchEvent(event)
  }, [message])

  return (
    <div className={`chat-message-row ${message.role}`}>
      <img className="chat-avatar" src={info.avatar} alt={info.name} />
      <div>
        <div className="chat-name">{info.name}</div>
        <div className={`chat-bubble ${info.bubbleClass}`}>
          <MessageBubble message={message} />
        </div>
        {message.role === 'assistant' && (
          <MessageActions
            content={message.content}
            onRegenerate={handleRegenerate}
          />
        )}
        <div className="chat-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
