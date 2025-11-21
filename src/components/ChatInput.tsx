import './ChatInput.css'

interface ChatInputProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="chat-input-bar">
      <textarea
        className="chat-input-textarea"
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入消息..."
      />
      <button
        className="chat-send-btn"
        onClick={onSend}
        disabled={!value.trim()}
      >
        发送
      </button>
    </div>
  )
}
