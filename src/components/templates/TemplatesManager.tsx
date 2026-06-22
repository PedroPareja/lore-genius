import { useState, useRef } from "react"
import { ArrowLeft, Plus, Upload, Download, Pencil, Trash2, AlertTriangle } from "lucide-react"
import { Button, Badge } from "@/components/ui"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useTemplatesStore } from "@/stores"
import { TemplateEditor } from "./TemplateEditor"
import { CharacterTemplate } from "@/types/templates"
import { useEditorStore } from "@/stores"

export function TemplatesManager() {
  const { templates, isDirty, addTemplate, updateTemplate, deleteTemplate, importFromFile, exportToFile } = useTemplatesStore()
  const { setView } = useEditorStore()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CharacterTemplate | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<{ added: number; overwritten: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleNew = () => {
    setEditingTemplate(null)
    setEditorOpen(true)
  }

  const handleEdit = (template: CharacterTemplate) => {
    setEditingTemplate(template)
    setEditorOpen(true)
  }

  const handleSave = (name: string, data: string) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, { name, data })
    } else {
      addTemplate(name, data)
    }
  }

  const handleDelete = (id: string) => {
    deleteTemplate(id)
    setDeleteConfirm(null)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    setImportResult(null)

    try {
      const result = await importFromFile(file)
      setImportResult(result)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed")
    }
    e.target.value = ""
  }

  const handleExport = () => {
    exportToFile("character-templates")
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setView("editor")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-xl font-semibold text-text-primary">Character Templates</h2>
        </div>

        {isDirty && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-md">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning">You have unsaved templates. Export them to a JSON file to avoid losing them.</span>
          </div>
        )}

        {importResult && (
          <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-md">
            <span className="text-sm text-success">
              Imported {importResult.added} new template(s), overwritten {importResult.overwritten} existing.
            </span>
          </div>
        )}

        {importError && (
          <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/30 rounded-md">
            <span className="text-sm text-danger">{importError}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
          <Button variant="outline" onClick={handleImportClick}>
            <Upload className="h-4 w-4 mr-2" />
            Import JSON
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="space-y-3">
          {templates.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <p className="text-lg mb-2">No character templates yet</p>
              <p className="text-sm">Create one or import a JSON file to get started</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="p-4 bg-bg-surface border border-border rounded-lg hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-text-primary">{template.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {template.data.length} chars
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary truncate">
                      {template.data || "(no data)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(template.id)}
                      className="text-danger hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <TemplateEditor
          key={editingTemplate?.id ?? "new"}
          open={editorOpen}
          onOpenChange={(open) => {
            setEditorOpen(open)
            if (!open) setEditingTemplate(null)
          }}
          template={editingTemplate}
          onSave={handleSave}
        />

        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Template?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-secondary py-2">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
