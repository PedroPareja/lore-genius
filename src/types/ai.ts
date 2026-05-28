export type AIProvider =
  | "openai-compatible"
  | "lm-studio"
  | "ollama"
  | "openai"
  | "custom"

export type AIMode = "write" | "expand"

export interface AIConfig {
  provider: AIProvider
  endpoint: string
  apiKey: string
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
}

export interface AIContext {
  entryComment: string
  entryKeys: string[]
  entryKeysecondary: string[]
  entryGroup: string
  entryContent: string
}