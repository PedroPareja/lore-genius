import { useState, useEffect, useCallback } from "react"
import { X, Sparkles, Square } from "lucide-react"
import { Button, Textarea } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { useAIStore, useLorebookStore, useEditorStore, useSettingsStore } from "@/stores"
import { AIPreviewDialog } from "./AIPreviewDialog"
import type { AIMode } from "@/types/ai"

interface AIPanelProps {
  open: boolean
  onClose: () => void
}

export function AIPanel({ open, onClose }: AIPanelProps) {
  const { getEntry } = useLorebookStore()
  const { selectedEntryUid, aiPanelMode } = useEditorStore()
  const isGenerating = useAIStore((s) => s.isGenerating)
  const isThinking = useAIStore((s) => s.isThinking)
  const streamingText = useAIStore((s) => s.streamingText)
  const { generate, stopGeneration } = useAIStore()
  const { settings } = useSettingsStore()

  const [customInstructions, setCustomInstructions] = useState("")
  const [mode, setMode] = useState<AIMode>(aiPanelMode)
  const [showPreview, setShowPreview] = useState(false)

  const entry = selectedEntryUid !== null ? getEntry(selectedEntryUid) : null
  const error = useAIStore((s) => s.error)

  useEffect(() => {
    setMode(aiPanelMode)
  }, [aiPanelMode])

  const buildPrompt = () => {
    if (!entry) return ""

    const baseContext = `Title/Comment: ${entry.comment}
Primary Keywords: ${entry.key.join(", ")}
Secondary Keywords: ${entry.keysecondary.join(", ")}
Group: ${entry.group}`

    switch (mode) {
      case "write":
        return `Write a lorebook entry for the following:

${baseContext}

${customInstructions ? `Additional instructions: ${customInstructions}` : ""}

Write concise, factual lore content suitable for injection into an AI roleplay prompt.
Focus on key facts, relationships, and distinctive details.
Keep it under 200 words unless the subject requires more detail.`

      case "edit":
        return `Rewrite and improve the following lorebook entry:

Title: ${entry.comment}
Keywords: ${entry.key.join(", ")}

Current content:
${entry.content}

${customInstructions ? `Additional instructions: ${customInstructions}` : ""}

Improve clarity, conciseness, and detail. Maintain the same factual content.
Return only the improved text, no explanations.`

      case "expand":
        return `Expand the following lorebook entry with additional detail:

Title: ${entry.comment}
Keywords: ${entry.key.join(", ")}

Current content:
${entry.content}

${customInstructions ? `Additional instructions: ${customInstructions}` : ""}

Add relevant details while preserving all existing information.
Return only the expanded text, no explanations.`

      case "chat":
        return customInstructions || "Continue the conversation about this lore entry."

      default:
        return ""
    }
  }

  const handleGenerate = async () => {
    if (!entry || !settings.ai.model) return

    const prompt = buildPrompt()
    setShowPreview(true)
    try {
      await generate(prompt, {
        entryComment: entry.comment,
        entryKeys: entry.key,
        entryKeysecondary: entry.keysecondary,
        entryGroup: entry.group,
        entryContent: entry.content,
      }, mode)
    } catch {
      // Error is already stored in aiStore and displayed below
    }
  }

  const handlePreviewClose = useCallback(() => {
    if (!isGenerating) {
      setShowPreview(false)
    }
  }, [isGenerating])

  if (!open) return null

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-bg-surface border-l border-border shadow-lg z-40 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-text-primary flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-ai-glow" />
          AI Assistant
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Mode</label>
          <Select value={mode} onValueChange={(v) => setMode(v as AIMode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="write">Write</SelectItem>
              <SelectItem value="edit">Edit</SelectItem>
              <SelectItem value="expand">Expand</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Context (auto-filled)</label>
          <div className="p-3 border border-border rounded-md bg-bg-input text-sm text-text-secondary space-y-1">
            <p>Entry: "{entry?.comment || "No entry selected"}"</p>
            {entry && entry.key.length > 0 && (
              <p>Keys: {entry.key.join(", ")}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Custom instructions</label>
          <Textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder={mode === "write" ? "e.g., Focus on corporate history..." : "Additional guidance..."}
            className="min-h-[100px]"
          />
        </div>

        <Button
          className="w-full"
          onClick={isGenerating ? stopGeneration : handleGenerate}
          disabled={!entry || !settings.ai.model}
        >
          {isGenerating ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </>
          )}
        </Button>

        {error && (
          <div className="p-3 rounded-md bg-danger/10 text-danger text-sm">
            {error}
          </div>
        )}

        {(streamingText || isGenerating) && (
          <div className="space-y-4 pt-4 border-t border-border">
            <label className="text-sm font-medium text-text-primary">
              {isThinking ? "Thinking..." : "Result"}
            </label>
            <div className="min-h-[150px] p-4 border border-border rounded-md bg-bg-input">
              {streamingText ? (
                <p className="text-sm text-text-primary whitespace-pre-wrap">{streamingText}</p>
              ) : (
                <span className="animate-pulse text-text-secondary">Generating...</span>
              )}
            </div>
          </div>
        )}
      </div>

      <AIPreviewDialog
        open={showPreview}
        onClose={handlePreviewClose}
        mode={mode}
      />
    </div>
  )
}