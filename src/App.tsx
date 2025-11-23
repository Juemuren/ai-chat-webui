import React from 'react'
import { ChatMessageList } from './components/ChatMessageList'
import { ChatInput } from './components/ChatInput'
import { ModelSelector } from './components/ModelSelector'
import { SessionSidebar } from './components/SessionSidebar'
import { useChat } from './hooks/useChat'
import { useSession } from './hooks/useSession'
import './App.css'

const App: React.FC = () => {
  const {
    messages,
    models,
    model,
    input,
    loading,
    setModel,
    setInput,
    send,
    stop,
    regenerateMessage,
  } = useChat()

  const {
    sessions,
    activeSessionId,
    createSession,
    switchSession,
    deleteSession,
    updateSessionTitle,
  } = useSession()

  return (
    <div className="app-container">
      <SessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionClick={switchSession}
        onCreateSession={() => createSession()}
        onDeleteSession={deleteSession}
        onUpdateSessionTitle={updateSessionTitle}
      />
      <div className="chat-app-container">
        <h2 className="chat-title">AI 对话 Demo</h2>
        <ModelSelector
          models={models}
          model={model}
          onChange={setModel}
          loading={loading}
        />
        <ChatMessageList
          messages={messages}
          onRegenerateMessage={regenerateMessage}
        />
        <ChatInput
          value={input}
          loading={loading}
          onChange={setInput}
          onSend={send}
          onStop={stop}
        />
      </div>
    </div>
  )
}

export default App
