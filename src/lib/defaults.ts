import { LorebookEntry, Lorebook } from "@/types/lorebook"

export const ENTRY_DEFAULTS: LorebookEntry = {
  uid: 0,
  key: [],
  keysecondary: [],
  comment: "",
  content: "",
  constant: false,
  selective: false,
  order: 100,
  position: 0,
  disable: false,
  excludeRecursion: false,
  probability: 100,
  useProbability: false,
  depth: 4,
  group: "",
  scanDepth: null,
  caseSensitive: false,
  matchWholeWords: false,
  automationId: "",
  role: 0,
  sticky: 0,
  cooldown: 0,
  delay: 0,
  vectorized: false,
}

export const LOREBOOK_DEFAULTS: Omit<Lorebook, "entries"> = {
  name: "Untitled Lorebook",
  description: "",
  scanDepth: 4,
  tokenBudget: 512,
  recursiveScanning: true,
  extensions: {},
}