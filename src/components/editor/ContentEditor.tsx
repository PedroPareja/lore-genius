import { useState, useMemo } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Textarea } from "@/components/ui"
import { estimateTokens } from "@/lib/tokenizer"

interface ContentEditorProps {
  value: string
  onChange: (value: string) => void
  showTokenCount?: boolean
}

export function ContentEditor({ value, onChange, showTokenCount = true }: ContentEditorProps) {
  const [previewMode, setPreviewMode] = useState(false)

  const tokenCount = useMemo(() => estimateTokens(value), [value])

  const charCount = value.length
  const wordCount = value.split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">Content *</label>
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1"
        >
          {previewMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {previewMode ? "Edit" : "Preview"}
        </button>
      </div>

      {previewMode ? (
        <div className="min-h-[200px] p-3 border border-border rounded-md bg-bg-input prose prose-sm max-w-none text-text-primary">
          {value || <span className="text-text-secondary">No content to preview</span>}
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter lore content..."
          className="min-h-[200px] font-mono text-sm"
        />
      )}

      {showTokenCount && (
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>
            {charCount} chars · {wordCount} words
          </span>
          <span>~{tokenCount} tokens</span>
        </div>
      )}
    </div>
  )
}