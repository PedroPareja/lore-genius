import { useState } from "react"
import { Sparkles, Copy, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui"
import { useLorebookStore, useEditorStore } from "@/stores"
import { KeywordInput } from "./KeywordInput"
import { ContentEditor } from "./ContentEditor"
import { AdvancedOptions } from "./AdvancedOptions"

export function EntryEditor() {
  const { getEntry, updateEntry, deleteEntry, duplicateEntry } = useLorebookStore()
  const { selectedEntryUid, selectEntry, openAIPanel } = useEditorStore()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const entry = selectedEntryUid !== null ? getEntry(selectedEntryUid) : null

  if (!entry) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        <div className="text-center">
          <p className="text-lg mb-2">No entry selected</p>
          <p className="text-sm">Select an entry from the sidebar or create a new one</p>
        </div>
      </div>
    )
  }

  const handleUpdate = (fields: Partial<typeof entry>) => {
    if (selectedEntryUid !== null) {
      updateEntry(selectedEntryUid, fields)
    }
  }

  const handleDelete = () => {
    if (selectedEntryUid !== null) {
      deleteEntry(selectedEntryUid)
      selectEntry(null)
      setShowDeleteConfirm(false)
    }
  }

  const handleDuplicate = () => {
    if (selectedEntryUid !== null) {
      const newUid = duplicateEntry(selectedEntryUid)
      selectEntry(newUid)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => selectEntry(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to list
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-danger hover:text-danger hover:bg-danger/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Comment / Title</label>
            <input
              type="text"
              value={entry.comment}
              onChange={(e) => handleUpdate({ comment: e.target.value })}
              placeholder="Entry name..."
              className="w-full h-10 px-3 border border-border rounded-md bg-bg-input text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <KeywordInput
            label="Primary Keys *"
            values={entry.key}
            onChange={(key) => handleUpdate({ key })}
            placeholder="Add keyword..."
          />

          <KeywordInput
            label="Secondary Keys"
            values={entry.keysecondary}
            onChange={(keysecondary) => handleUpdate({ keysecondary })}
            placeholder="Add secondary keyword..."
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selective"
              checked={entry.selective}
              onChange={(e) => handleUpdate({ selective: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="selective" className="text-sm text-text-primary">Require secondary keys (selective)</label>
          </div>

          <ContentEditor
            value={entry.content}
            onChange={(content) => handleUpdate({ content })}
          />

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="secondary" onClick={() => openAIPanel()}>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Write
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <AdvancedOptions entry={entry} onUpdate={handleUpdate} />
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-bg-surface border border-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Entry?</h3>
              <p className="text-sm text-text-secondary mb-4">
                Are you sure you want to delete "{entry.comment || 'Untitled'}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}