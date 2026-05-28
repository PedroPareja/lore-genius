import { Settings, Upload, Download, FilePlus, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui"
import { ThemeToggle } from "./ThemeToggle"
import { useLorebookStore } from "@/stores"
import { exportLorebook, importLorebook } from "@/lib/file"

interface TopBarProps {
  onOpenSettings?: () => void
}

export function TopBar({ onOpenSettings }: TopBarProps) {
  const { lorebook, createNewLorebook, loadLorebook, isDirty } = useLorebookStore()

  const handleImport = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const data = await importLorebook(file)
        loadLorebook(data)
      } catch (err) {
        console.error("Import failed:", err)
      }
    }
    input.click()
  }

  const handleExport = () => {
    if (!lorebook) return
    exportLorebook(lorebook, lorebook.name || "lorebook")
  }

  const handleNew = () => {
    createNewLorebook("Untitled Lorebook")
  }

  return (
    <header className="h-[52px] border-b border-border bg-bg-surface flex items-center px-4 gap-2">
      <div className="flex items-center gap-2">
        <svg className="h-7 w-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span className="font-semibold text-text-primary">LoreGenius</span>
      </div>

      {lorebook && (
        <>
          <ChevronLeft className="h-4 w-4 text-text-secondary" />
          <span className="text-text-primary font-medium">{lorebook.name}</span>
          {isDirty && (
            <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded">Unsaved</span>
          )}
        </>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handleNew} title="New Lorebook">
          <FilePlus className="h-4 w-4 mr-1" />
          New
        </Button>
        <Button variant="ghost" size="sm" onClick={handleImport} title="Import">
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>
        {lorebook && (
          <Button variant="ghost" size="sm" onClick={handleExport} title="Export">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        )}
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={onOpenSettings} title="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}