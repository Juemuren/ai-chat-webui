import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { ChatMessage } from '../types/chat'
import './ChatMessageItem.css'
import './markdown.css'

import AssistantAvatar from '../assets/ollama.png'
import UserAvatar from '../assets/sakiko.jpg'

interface ChatMessageItemProps {
  message: ChatMessage
}

const roleInfo = {
  user: {
    name: 'ME',
    avatar: UserAvatar,
    bubbleClass: 'chat-bubble-user',
  },
  assistant: {
    name: 'AI',
    avatar: AssistantAvatar,
    bubbleClass: 'chat-bubble-ai',
  },
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
}) => {
  const info = roleInfo[message.role]

  const CodeBlock = ({
    children,
    className,
    ...rest
  }: React.HTMLAttributes<HTMLElement>) => {
    const match = /language-(\w+)/.exec(className || '')
    const codeString = Array.isArray(children)
      ? String(children.join(''))
      : String(children)
    const [copied, setCopied] = useState(false)
    const lang = match ? match[1] : ''
    const handleCopy = () => {
      navigator.clipboard.writeText(codeString)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }
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
    } else {
      return (
        <code className={className} {...rest}>
          {codeString}
        </code>
      )
    }
  }

  // 复制 AI 消息内容
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
  const handleCopyContent = () => {
    navigator.clipboard.writeText(message.content)
    setCopyStatus('copied')
    setTimeout(() => setCopyStatus('idle'), 1200)
  }

  // 重新生成按钮点击（触发自定义事件，父组件监听）
  const handleRegenerate = () => {
    const event = new CustomEvent('regenerate-ai-message', {
      detail: { message },
    })
    window.dispatchEvent(event)
  }

  return (
    <div className={`chat-message-row ${message.role}`}>
      <img className="chat-avatar" src={info.avatar} alt={info.name} />
      <div>
        <div className="chat-name">{info.name}</div>
        <div className={`chat-bubble ${info.bubbleClass}`}>
          {message.role === 'assistant' ? (
            <div className="markdown-body">
              <Markdown
                components={{
                  code: CodeBlock,
                }}
              >
                {message.content}
              </Markdown>
            </div>
          ) : (
            message.content
          )}
        </div>
        {message.role === 'assistant' && (
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
              onClick={handleRegenerate}
              type="button"
            >
              <span className="icon-rotate">重新生成</span>
            </button>
          </div>
        )}
        <div className="chat-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
