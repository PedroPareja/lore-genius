export interface LorebookEntry {
  uid: number
  key: string[]
  keysecondary: string[]
  comment: string
  content: string
  constant: boolean
  vectorized: boolean
  selective: boolean
  selectiveLogic: number
  addMemo: boolean
  order: number
  position: number
  disable: boolean
  ignoreBudget: boolean
  excludeRecursion: boolean
  preventRecursion: boolean
  matchPersonaDescription: boolean
  matchCharacterDescription: boolean
  matchCharacterPersonality: boolean
  matchCharacterDepthPrompt: boolean
  matchScenario: boolean
  matchCreatorNotes: boolean
  delayUntilRecursion: boolean
  probability: number
  useProbability: boolean
  depth: number
  outletName: string
  group: string
  groupOverride: boolean
  groupWeight: number
  scanDepth: number | null
  caseSensitive: boolean | null
  matchWholeWords: boolean | null
  useGroupScoring: boolean | null
  automationId: string
  role: number | null
  sticky: number
  cooldown: number
  delay: number
  triggers: unknown[]
  displayIndex: number
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