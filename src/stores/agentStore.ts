import { create } from "zustand"
import { AILorebookRequest, AgentStep, AgentPlan } from "@/types/agent"
import { runAgent } from "@/lib/agent"
import { useAIStore } from "./aiStore"

type AgentPhase = "idle" | "planning" | "concepts" | "characters" | "done" | "error" | "aborted"

interface AgentState {
  request: AILorebookRequest | null
  phase: AgentPhase
  plan: AgentPlan | null
  steps: AgentStep[]
  log: string[]
  tokensUsed: number
  isRunning: boolean
  error: string | null
  abortController: AbortController | null
  start: (request: AILorebookRequest) => Promise<void>
  stop: () => void
  reset: () => void
  appendLog: (line: string) => void
  updateStep: (id: string, patch: Partial<AgentStep>) => void
  setPhase: (phase: AgentPhase) => void
  setPlan: (plan: AgentPlan | null) => void
  setSteps: (steps: AgentStep[]) => void
  setTokensUsed: (tokens: number) => void
  setError: (error: string | null) => void
}

export const useAgentStore = create<AgentState>((set, get) => ({
  request: null,
  phase: "idle",
  plan: null,
  steps: [],
  log: [],
  tokensUsed: 0,
  isRunning: false,
  error: null,
  abortController: null,

  start: async (request: AILorebookRequest) => {
    const abortController = new AbortController()
    set({
      request,
      phase: "planning",
      plan: null,
      steps: [],
      log: [],
      tokensUsed: 0,
      isRunning: true,
      error: null,
      abortController,
    })

    const hooks = {
      appendLog: (line: string) => get().appendLog(line),
      updateStep: (id: string, patch: Partial<AgentStep>) => get().updateStep(id, patch),
      setPhase: (phase: AgentPhase) => get().setPhase(phase),
      setPlan: (plan: AgentPlan | null) => get().setPlan(plan),
      setSteps: (steps: AgentStep[]) => get().setSteps(steps),
      setTokensUsed: (tokens: number) => get().setTokensUsed(tokens),
      setError: (error: string | null) => get().setError(error),
      getSignal: () => abortController.signal,
    }

    try {
      await runAgent(request, hooks)
    } catch {
      // runAgent catches and surfaces its own errors via hooks; nothing to do here.
    } finally {
      set({ isRunning: false })
    }
  },

  stop: () => {
    const { abortController } = get()
    if (abortController) {
      abortController.abort()
    }
    // Also stop any in-flight AI streaming call so the user does not have to wait
    // for the current character/concept to finish before the abort takes effect.
    useAIStore.getState().stopGeneration()
    set({ isRunning: false, phase: "aborted" })
  },

  reset: () => {
    const { abortController } = get()
    if (abortController) {
      abortController.abort()
    }
    set({
      request: null,
      phase: "idle",
      plan: null,
      steps: [],
      log: [],
      tokensUsed: 0,
      isRunning: false,
      error: null,
      abortController: null,
    })
  },

  appendLog: (line: string) => {
    set((state) => ({ log: [...state.log, line] }))
  },

  updateStep: (id: string, patch: Partial<AgentStep>) => {
    set((state) => ({
      steps: state.steps.map((step) => (step.id === id ? { ...step, ...patch } : step)),
    }))
  },

  setPhase: (phase: AgentPhase) => {
    set({ phase })
  },

  setPlan: (plan: AgentPlan | null) => {
    set({ plan })
  },

  setSteps: (steps: AgentStep[]) => {
    set({ steps })
  },

  setTokensUsed: (tokens: number) => {
    set({ tokensUsed: tokens })
  },

  setError: (error: string | null) => {
    if (error) {
      set({ error, isRunning: false, phase: "error" })
    } else {
      set({ error })
    }
  },
}))