export interface OllamaMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface OllamaRequest {
  model: string
  messages: OllamaMessage[]
  stream: boolean
}

export interface OllamaResponse {
  model: string
  message: OllamaMessage
  done: boolean
}

export interface OllamaModel {
  name: string
  size: number
}
