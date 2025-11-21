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
  } catch (error) {
    console.log(error)
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
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }

  const data = await res.json()
  return data as OllamaResponse
}
