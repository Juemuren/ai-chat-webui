import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'
import './markdown.css'
import type { ChatMessage } from '../types/chat'
import './ChatMessageItem.css'
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

  // 独立代码块组件，解决 Hook 问题
  // 兼容 react-markdown 组件类型，且 Hooks 顺序固定

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
        <div className="chat-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
