import { useState } from "react"
import { Button, Input, Textarea } from "@/components/ui"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CharacterTemplate } from "@/types/templates"

interface TemplateEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: CharacterTemplate | null
  onSave: (name: string, data: string) => void
}

export function TemplateEditor({ open, onOpenChange, template, onSave }: TemplateEditorProps) {
  // The parent remounts this component via `key={editingTemplate?.id ?? "new"}`, so
  // lazy initial state from `template` is re-evaluated each time the edited template
  // changes. Radix's controlled `Dialog` does not fire `onOpenChange` when the parent
  // flips `open` to true, so we can't seed the fields from there.
  const [name, setName] = useState(template?.name ?? "")
  const [data, setData] = useState(template?.data ?? "")
  const [error, setError] = useState("")

  const handleSave = () => {
    if (!name.trim()) {
      setError("Name is required")
      return
    }
    onSave(name.trim(), data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "New Template"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Name *</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError("")
              }}
              placeholder="Template name..."
              autoFocus
            />
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Data</label>
            <Textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="Appearance, bio, fixed traits, quirks..."
              className="min-h-[200px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
