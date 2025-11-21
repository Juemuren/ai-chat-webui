import type { ChatMessage } from '../types/chat'
import type { OllamaMessage } from '../types/ollama'

// 聊天消息转 Ollama 消息
export function toOllamaMessage(msg: ChatMessage): OllamaMessage {
  return {
    role: msg.role,
    content: msg.content,
  }
}

// Ollama 消息转聊天消息
export function fromOllamaMessage(
  msg: OllamaMessage,
  id: string,
  timestamp: number,
): ChatMessage {
  return {
    id,
    role: msg.role,
    content: msg.content,
    timestamp,
  }
}

// 聊天历史转 Ollama 消息数组
export function toOllamaMessages(msgs: ChatMessage[]): OllamaMessage[] {
  return msgs.map(toOllamaMessage)
}
