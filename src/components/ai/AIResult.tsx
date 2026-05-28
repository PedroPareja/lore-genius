import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui"
import { useAIStore } from "@/stores"

interface AIResultProps {
  onAccept: () => void
  onDiscard: () => void
}

export function AIResult({ onAccept, onDiscard }: AIResultProps) {
  const { streamingText, isGenerating } = useAIStore()

  return (
    <div className="space-y-4">
      <div className="min-h-[150px] p-4 border border-border rounded-md bg-bg-input">
        {isGenerating ? (
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating...</span>
          </div>
        ) : (
          <p className="text-sm text-text-primary whitespace-pre-wrap">{streamingText}</p>
        )}
        {isGenerating && (
          <span className="inline-block animate-pulse">|</span>
        )}
      </div>

      {!isGenerating && streamingText && (
        <div className="flex gap-2">
          <Button onClick={onAccept} className="flex-1">
            Accept
          </Button>
          <Button variant="outline" onClick={onDiscard}>
            Discard
          </Button>
        </div>
      )}
    </div>
  )
}