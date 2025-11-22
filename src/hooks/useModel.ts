import { useState, useEffect } from 'react'
import { fetchModels } from '../services/ollama'

export function useModel() {
  const [models, setModels] = useState<{ name: string }[]>([])
  const [model, setModel] = useState('')

  useEffect(() => {
    fetchModels()
      .then((list) => {
        setModels(list)
        if (list.length > 0) setModel(list[0].name)
      })
      .catch(() => setModels([]))
  }, [])

  return {
    models,
    model,
    setModel,
  }
}
