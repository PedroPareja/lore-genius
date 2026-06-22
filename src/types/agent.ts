export interface AILorebookRequest {
  worldIdea: string
  lorebookName: string
  targetCharacterCount: number
  generateConcepts: boolean
  templateIds?: string[]
  extraInstructions?: string
  includeUserPersona: boolean
}

export type AgentStepStatus = "pending" | "running" | "done" | "aborted" | "error"

export interface AgentStep {
  id: string
  label: string
  status: AgentStepStatus
  tokensUsed?: number
}

export interface AgentPlan {
  userPersonaSummary: string
  concepts: { keyword: string; role: string }[]
  characters: { templateId: string; templateName: string; name: string; role: string }[]
}
