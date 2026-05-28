import { create } from "zustand"
import { AIMode, AIContext } from "@/types/ai"

interface AIState {
  isGenerating: boolean
  isThinking: boolean
  streamingText: string
  error: string | null
  abortController: AbortController | null
  generate: (prompt: string, context: AIContext, mode: AIMode) => Promise<string>
  stopGeneration: () => void
  clearResult: () => void
}

export const useAIStore = create<AIState>((set, get) => ({
  isGenerating: false,
  isThinking: false,
  streamingText: "",
  error: null,
  abortController: null,

  generate: async (prompt, _context, _mode) => {
    const { settings } = await import("@/stores/settingsStore").then((m) => m.useSettingsStore.getState())
    const { ai } = settings

    const controller = new AbortController()
    set({ abortController: controller, isGenerating: true, isThinking: false, streamingText: "", error: null })

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
      let isSSE = false

      const extractString = (obj: unknown, key: string): string | null => {
        if (!obj || typeof obj !== "object") return null
        const val = (obj as Record<string, unknown>)[key]
        return typeof val === "string" ? val : null
      }

      const extractContent = (parsed: unknown): { content: string | null; thinking: string | null } => {
        if (!parsed || typeof parsed !== "object") return { content: null, thinking: null }
        const obj = parsed as Record<string, unknown>
        const choices = obj.choices
        if (Array.isArray(choices) && choices.length > 0) {
          const choice = choices[0] as Record<string, unknown>
          if (choice.delta && typeof choice.delta === "object") {
            const delta = choice.delta as Record<string, unknown>
            const thinkingParts = [
              extractString(delta, "reasoning_content"),
              extractString(delta, "reasoning"),
              extractString(delta, "thinking"),
            ].filter((s): s is string => s !== null)
            const contentParts = [
              extractString(delta, "content"),
              extractString(delta, "text"),
            ].filter((s): s is string => s !== null)
            return {
              thinking: thinkingParts.length > 0 ? thinkingParts.join("") : null,
              content: contentParts.length > 0 ? contentParts.join("") : null,
            }
          }
          if (choice.message && typeof choice.message === "object") {
            const msg = choice.message as Record<string, unknown>
            const thinkingParts = [
              extractString(msg, "reasoning_content"),
              extractString(msg, "reasoning"),
              extractString(msg, "thinking"),
            ].filter((s): s is string => s !== null)
            const contentParts = [
              extractString(msg, "content"),
            ].filter((s): s is string => s !== null)
            return {
              thinking: thinkingParts.length > 0 ? thinkingParts.join("") : null,
              content: contentParts.length > 0 ? contentParts.join("") : null,
            }
          }
          if (typeof choice.text === "string") return { content: choice.text, thinking: null }
        }
        if (typeof obj.content === "string") return { content: obj.content, thinking: null }
        if (typeof obj.response === "string") return { content: obj.response, thinking: null }
        return { content: null, thinking: null }
      }

      const processLine = (line: string) => {
        const trimmed = line.trim()
        if (!trimmed) return
        if (trimmed === "[DONE]" || trimmed === "data: [DONE]") return

        let jsonStr: string
        if (trimmed.startsWith("data:")) {
          isSSE = true
          jsonStr = trimmed.startsWith("data: ") ? trimmed.slice(6) : trimmed.slice(5)
        } else if (!isSSE) {
          jsonStr = trimmed
        } else {
          return
        }

        try {
          const parsed = JSON.parse(jsonStr)
          const { content, thinking } = extractContent(parsed)

          if (thinking) {
            set({ isThinking: true })
          }
          if (content) {
            set({ isThinking: false })
          }

          if (content) {
            fullText += content
            set({ streamingText: fullText })
          }
        } catch {
          // not JSON, skip
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          processLine(line)
        }
      }

      buffer += decoder.decode()
      for (const line of buffer.split("\n")) {
        processLine(line)
      }

      set({ isThinking: false })

      if (!fullText) {
        throw new Error("No content received from AI. Check your API endpoint and model settings.")
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
      set({ isGenerating: false, isThinking: false, abortController: null })
    }
  },

  stopGeneration: () => {
    const { abortController } = get()
    if (abortController) {
      abortController.abort()
    }
    set({ isGenerating: false, isThinking: false })
  },

  clearResult: () => {
    set({ streamingText: "", isThinking: false, error: null })
  },
}))