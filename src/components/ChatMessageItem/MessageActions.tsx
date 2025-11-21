import React, { useState, useCallback, memo } from 'react'

interface MessageActionsProps {
  content: string
  onRegenerate: () => void
  isFinished: boolean
  isError: boolean
}

const MessageActions: React.FC<MessageActionsProps> = memo(
  ({ content, onRegenerate, isFinished, isError }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

    const handleCopyContent = useCallback(() => {
      navigator.clipboard.writeText(content)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 1200)
    }, [content])

    return (
      <div className="ai-message-actions">
        {isFinished && (
          <button
            className="ai-copy-btn action-btn"
            onClick={handleCopyContent}
            type="button"
          >
            {copyStatus === 'copied' ? '已复制' : '复制内容'}
          </button>
        )}
        {(isFinished || isError) && (
          <button
            className="ai-regenerate-btn action-btn"
            onClick={onRegenerate}
            type="button"
          >
            重新生成
          </button>
        )}
      </div>
    )
  },
)

export default MessageActions
