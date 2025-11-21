import React, { useState } from 'react'
import type { ChatMessage } from './types/chat'
import { ChatMessageList } from './components/ChatMessageList'
import { ChatInput } from './components/ChatInput'
import './App.css'

const initialTimestamp = Date.now()

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init1',
      role: 'assistant',
      content: '你好！我是 AI 助手，你需要什么帮助？',
      timestamp: initialTimestamp,
    },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    const newMsg: ChatMessage = {
      id: Date.now() + Math.random().toString(36).slice(2, 8),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }
    setMessages((msgs) => [...msgs, newMsg])
    setInput('')
  }

  return (
    <div className="chat-app-container">
      <h2 className="chat-title">AI 对话 Demo</h2>
      <ChatMessageList messages={messages} />
      <ChatInput value={input} onChange={setInput} onSend={handleSend} />
    </div>
  )
}

export default App
