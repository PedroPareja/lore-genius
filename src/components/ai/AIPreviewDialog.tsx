import { Sparkles, Brain } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui"
import { useAIStore, useLorebookStore, useEditorStore } from "@/stores"
import type { AIMode } from "@/types/ai"

interface AIPreviewDialogProps {
  open: boolean
  onClose: () => void
  mode: AIMode
}

export function AIPreviewDialog({ open, onClose, mode }: AIPreviewDialogProps) {
  const streamingText = useAIStore((s) => s.streamingText)
  const isGenerating = useAIStore((s) => s.isGenerating)
  const isThinking = useAIStore((s) => s.isThinking)
  const clearResult = useAIStore((s) => s.clearResult)
  const { updateEntry } = useLorebookStore()
  const selectedEntryUid = useEditorStore((s) => s.selectedEntryUid)

  const handleAccept = () => {
    if (selectedEntryUid === null || !streamingText) return

    const entry = useLorebookStore.getState().getEntry(selectedEntryUid)
    if (!entry) return

    let newContent: string
    if (mode === "write" || mode === "chat") {
      newContent = streamingText
    } else {
      newContent = entry.content ? `${entry.content}\n\n${streamingText}` : streamingText
    }

    updateEntry(selectedEntryUid, { content: newContent })
    clearResult()
    onClose()
  }

  const handleReject = () => {
    clearResult()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ai-glow" />
            AI Generated Content
          </DialogTitle>
          <DialogDescription>
            Review the generated text and accept or reject it
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[200px] max-h-[400px] p-4 border border-border rounded-md bg-bg-input overflow-y-auto">
          {isThinking ? (
            <div className="flex items-center gap-2 text-text-secondary">
              <Brain className="h-4 w-4 animate-pulse" />
              <span className="animate-pulse">Thinking...</span>
            </div>
          ) : isGenerating && !streamingText ? (
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="animate-pulse">Generating...</span>
            </div>
          ) : (
            <p className="text-sm text-text-primary whitespace-pre-wrap">{streamingText}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleReject}>
            Reject
          </Button>
          <Button onClick={handleAccept} disabled={!streamingText || isGenerating}>
            Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}