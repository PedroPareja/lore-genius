import { Sparkles, Brain } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui"
import { useAIStore, useLorebookStore, useEditorStore } from "@/stores"

interface AIPreviewDialogProps {
  open: boolean
  onClose: () => void
}

export function AIPreviewDialog({ open, onClose }: AIPreviewDialogProps) {
  const streamingText = useAIStore((s) => s.streamingText)
  const isGenerating = useAIStore((s) => s.isGenerating)
  const isThinking = useAIStore((s) => s.isThinking)
  const clearResult = useAIStore((s) => s.clearResult)
  const { updateEntry } = useLorebookStore()
  const selectedEntryUid = useEditorStore((s) => s.selectedEntryUid)

  const handleReplace = () => {
    if (selectedEntryUid === null || !streamingText) return

    updateEntry(selectedEntryUid, { content: streamingText })
    clearResult()
    onClose()
  }

  const handleExtend = () => {
    if (selectedEntryUid === null || !streamingText) return

    const entry = useLorebookStore.getState().getEntry(selectedEntryUid)
    if (!entry) return

    const newContent = entry.content ? `${entry.content}\n\n${streamingText}` : streamingText
    updateEntry(selectedEntryUid, { content: newContent })
    clearResult()
    onClose()
  }

  const handleAbort = () => {
    useAIStore.getState().stopGeneration()
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
          <Button variant="outline" onClick={handleAbort}>
            Abort
          </Button>
          <Button variant="outline" onClick={handleExtend} disabled={!streamingText || isGenerating}>
            Extend
          </Button>
          <Button onClick={handleReplace} disabled={!streamingText || isGenerating}>
            Replace
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}