import React from 'react'
import { ChatMessageList } from './components/ChatMessageList'
import { ChatInput } from './components/ChatInput'
import { ModelSelector } from './components/ModelSelector'
import { useChat } from './hooks/useChat'
import './App.css'

const App: React.FC = () => {
  const { messages, input, setInput, send, loading, models, model, setModel } =
    useChat()

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
