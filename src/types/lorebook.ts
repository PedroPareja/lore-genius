export interface LorebookEntry {
  uid: number
  key: string[]
  keysecondary: string[]
  comment: string
  content: string
  constant: boolean
  selective: boolean
  order: number
  position: number
  disable: boolean
  excludeRecursion: boolean
  probability: number
  useProbability: boolean
  depth: number
  group: string
  scanDepth: number | null
  caseSensitive: boolean
  matchWholeWords: boolean
  automationId: string
  role: number
  sticky: number
  cooldown: number
  delay: number
  vectorized: boolean
}

export interface Lorebook {
  entries: Record<string, LorebookEntry>
  name: string
  description: string
  scanDepth: number
  tokenBudget: number
  recursiveScanning: boolean
  extensions: Record<string, unknown>
}

export type EntryPosition = 0 | 1 | 2
export type EntryRole = 0 | 1 | 2