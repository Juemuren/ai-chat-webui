import React, { useState, useCallback, memo } from 'react'
import type { ChatMessage } from '../../types/chat'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeBlock: React.FC<React.HTMLAttributes<HTMLElement>> = memo(
  ({ children, className, ...rest }) => {
    const match = /language-(\w+)/.exec(className || '')
    const codeString = Array.isArray(children)
      ? String(children.join(''))
      : String(children)
    const lang = match ? match[1] : ''
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(codeString)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }, [codeString])

    if (lang) {
      return (
        <div className="codeblock-wrapper">
          <div className="codeblock-header">
            <span className="codeblock-lang">{lang}</span>
            <button
              className="codeblock-copy-btn"
              onClick={handleCopy}
              title="复制代码"
              type="button"
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <SyntaxHighlighter
            language={lang}
            PreTag="div"
            // @ts-expect-error: prism 类型兼容性
            style={prism}
            {...rest}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      )
    }
    return (
      <code className={className} {...rest}>
        {codeString}
      </code>
    )
  },
)

const MessageBubble: React.FC<{
  message: ChatMessage
}> = memo(({ message }) => {
  if (message.role === 'assistant') {
    return (
      <div className="markdown-body">
        <Markdown components={{ code: CodeBlock }}>{message.content}</Markdown>
      </div>
    )
  }
  return <pre>{message.content}</pre>
})

export default MessageBubble
