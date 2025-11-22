export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string // 唯一标识
  role: ChatRole // 角色
  content: string // 消息内容
  timestamp: number // 时间戳
  isFinished?: boolean // 回复是否完成
  isError?: boolean // 回复是否出错
}

export interface ChatSession {
  id: string // 唯一标识
  title: string // 标题
  createdAt: number // 创建时间
  updatedAt: number // 更新时间
  messages: ChatMessage[] // 消息列表
}
