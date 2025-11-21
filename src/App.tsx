import React from 'react'
import { ChatMessageList } from './components/ChatMessageList'
import { ChatInput } from './components/ChatInput'
import { ModelSelector } from './components/ModelSelector'
import { useChat } from './hooks/useChat'
import './App.css'

const App: React.FC = () => {
  const { messages, input, setInput, send, loading, models, model, setModel } =
    useChat()

  // 重新生成 AI 消息
  React.useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent
      const msg = customEvent.detail?.message
      if (msg && msg.role === 'assistant') {
        // 以该回答前的所有消息为上下文，重新请求
        const idx = messages.findIndex((m) => m.id === msg.id)
        if (idx > 0) {
          const contextMsgs = messages.slice(0, idx)
          send(contextMsgs, '')
        }
      }
    }
    window.addEventListener('regenerate-ai-message', handler)
    return () => window.removeEventListener('regenerate-ai-message', handler)
  }, [messages, send])

  return (
    <div className="chat-app-container">
      <h2 className="chat-title">AI 对话 Demo</h2>
      <ModelSelector
        models={models}
        model={model}
        onChange={setModel}
        loading={loading}
      />
      <ChatMessageList messages={messages} />
      <ChatInput value={input} onChange={setInput} onSend={send} />
    </div>
  )
}

export default App
