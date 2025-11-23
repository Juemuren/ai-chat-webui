import React, { memo } from 'react'
import { useCopy } from '../../hooks/useCopy'

interface MessageActionsProps {
  content: string
  onRegenerate: () => void
  isFinished: boolean
  isError: boolean
}

const MessageActions: React.FC<MessageActionsProps> = memo(
  ({ content, onRegenerate, isFinished, isError }) => {
    const { copied, handleCopy } = useCopy(content)

    return (
      <div className="ai-message-actions">
        {isFinished && (
          <button
            className="ai-copy-btn action-btn"
            onClick={handleCopy}
            type="button"
          >
            {copied ? '已复制' : '复制内容'}
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
