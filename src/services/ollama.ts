import type {
  OllamaModel,
  OllamaResponse,
  OllamaRequest,
} from '../types/ollama'

const BASE_URL = 'http://localhost:11434'

export async function fetchModels(): Promise<OllamaModel[]> {
  const res = await fetch(`${BASE_URL}/api/tags`)
  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.status}`)
  }
  const data = await res.json()
  return data.models as OllamaModel[]
}

export async function checkConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/tags`)
    return res.ok
  } catch (e) {
    console.log(e)
    return false
  }
}

export async function sendChat(
  payload: OllamaRequest,
): Promise<OllamaResponse> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...payload, stream: false }),
  })

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }

  const data = await res.json()
  return data as OllamaResponse
}

// Ollama 流式回复，返回 async generator
export async function* sendChatStream(
  payload: OllamaRequest,
  signal?: AbortSignal,
): AsyncGenerator<string, void, void> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...payload, stream: true }),
    signal,
  })

  if (!res.ok || !res.body) throw new Error('Stream response error')
  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    // 按行分割处理 JSON
    let idx
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim()
      buffer = buffer.slice(idx + 1)
      if (!line) continue
      try {
        const obj = JSON.parse(line)
        if (obj.message && obj.message.content) {
          yield obj.message.content
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}
