import React, { useState, useCallback, memo } from 'react'

const MessageActions: React.FC<{
  content: string
  onRegenerate: () => void
}> = memo(({ content, onRegenerate }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  const handleCopyContent = useCallback(() => {
    navigator.clipboard.writeText(content)
    setCopyStatus('copied')
    setTimeout(() => setCopyStatus('idle'), 1200)
  }, [content])

  return (
    <div className="ai-message-actions">
      <button
        className="ai-copy-btn action-btn"
        onClick={handleCopyContent}
        type="button"
      >
        {copyStatus === 'copied' ? '已复制' : '复制内容'}
      </button>
      <button
        className="ai-regenerate-btn action-btn"
        onClick={onRegenerate}
        type="button"
      >
        重新生成
      </button>
    </div>
  )
})

export default MessageActions
