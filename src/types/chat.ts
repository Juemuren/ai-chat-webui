export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string // 唯一标识
  role: ChatRole // 角色
  content: string // 消息内容
  timestamp: number // 时间戳
  isFinished?: boolean // 回复是否完成
  isError?: boolean // 回复是否出错
}
