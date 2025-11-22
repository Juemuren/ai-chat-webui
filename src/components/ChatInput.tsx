import './ChatInput.css'

interface ChatInputProps {
  value: string
  loading: boolean
  onChange: (v: string) => void
  onSend: () => void
  onStop: () => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  loading,
  onChange,
  onSend,
  onStop,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleClick = () => {
    if (loading) {
      onStop()
    } else {
      onSend()
    }
  }

  return (
    <div className="chat-input-bar">
      <textarea
        className="chat-input-textarea"
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入消息..."
      />
      <button
        className="chat-send-btn"
        onClick={handleClick}
        disabled={!loading && !value.trim()}
      >
        {loading ? '停止' : '发送'}
      </button>
    </div>
  )
}
