import React from 'react'
import ReactMarkdown from 'react-markdown'
import type { ChatMessage } from '../types/chat'
import './ChatMessageItem.css'

import AssistantAvatar from '../assets/ollama.png'
import UserAvatar from '../assets/sakiko.jpg'

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
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
}) => {
  const info = roleInfo[message.role]
  return (
    <div className={`chat-message-row ${message.role}`}>
      <img className="chat-avatar" src={info.avatar} alt={info.name} />
      <div>
        <div className="chat-name">{info.name}</div>
        <div className={`chat-bubble ${info.bubbleClass}`}>
          {message.role === 'assistant' ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : (
            message.content
          )}
        </div>
        <div className="chat-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
