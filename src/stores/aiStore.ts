import { create } from "zustand"
import { AIMode, AIContext } from "@/types/ai"

interface AIState {
  isGenerating: boolean
  streamingText: string
  error: string | null
  abortController: AbortController | null
  generate: (prompt: string, context: AIContext, mode: AIMode) => Promise<string>
  stopGeneration: () => void
  clearResult: () => void
}

export const useAIStore = create<AIState>((set, get) => ({
  isGenerating: false,
  streamingText: "",
  error: null,
  abortController: null,

  generate: async (prompt, _context, _mode) => {
    const { settings } = await import("@/stores/settingsStore").then((m) => m.useSettingsStore.getState())
    const { ai } = settings

    const controller = new AbortController()
    set({ abortController: controller, isGenerating: true, streamingText: "", error: null })

    try {
      const response = await fetch(`${ai.endpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ai.apiKey ? { Authorization: `Bearer ${ai.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: ai.model || "unknown",
          messages: [
            { role: "system", content: ai.systemPrompt },
            { role: "user", content: prompt },
          ],
          temperature: ai.temperature,
          max_tokens: ai.maxTokens,
          stream: true,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let fullText = ""
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === "data: [DONE]" || trimmed === "[DONE]") continue
          if (!trimmed.startsWith("data: ")) continue

          const data = trimmed.slice(6)
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              fullText += content
              set({ streamingText: fullText })
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      return fullText
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return get().streamingText
      }
      const errorMessage = err instanceof Error ? err.message : "Generation failed"
      set({ error: errorMessage })
      throw err
    } finally {
      set({ isGenerating: false, abortController: null })
    }
  },

  stopGeneration: () => {
    const { abortController } = get()
    if (abortController) {
      abortController.abort()
    }
    set({ isGenerating: false })
  },

  clearResult: () => {
    set({ streamingText: "", error: null })
  },
}))