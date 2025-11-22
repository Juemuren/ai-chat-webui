import { createContext } from 'react'
import type { SessionContextType } from './types'

export const SessionContext = createContext<SessionContextType | undefined>(
  undefined,
)
