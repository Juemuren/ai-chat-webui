import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      console.log(e)
    }
    return initial
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (e) {
      console.log(e)
    }
  }, [key, state])
  return [state, setState] as const
}
