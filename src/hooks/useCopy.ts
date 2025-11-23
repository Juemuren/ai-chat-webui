import { useCallback, useState } from 'react'

export const useCopy = (content: string) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }, [content])

  return { copied, handleCopy }
}
