import { useState, useMemo } from "react"
import { Search, Filter, Plus, GripVertical } from "lucide-react"
import { Button, Input, Badge } from "@/components/ui"
import { useLorebookStore, useEditorStore } from "@/stores"
import type { LorebookEntry } from "@/types/lorebook"

interface EntryCardProps {
  entry: LorebookEntry
  isSelected: boolean
  onSelect: () => void
  onDoubleClick: () => void
}

function EntryCard({ entry, isSelected, onSelect, onDoubleClick }: EntryCardProps) {
  const statusColor = entry.disable ? "bg-danger" : entry.constant ? "bg-ai-glow" : "bg-success"
  const preview = entry.content.slice(0, 60) || "No content"

  return (
    <div
      className={`group relative p-3 rounded-md cursor-pointer transition-colors ${
        isSelected ? "bg-accent/20 border border-accent" : "hover:bg-bg-elevated border border-transparent"
      }`}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
    >
      <div className="flex items-start gap-2">
        <div className="opacity-0 group-hover:opacity-100 cursor-grab mt-0.5">
          <GripVertical className="h-4 w-4 text-text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${statusColor}`} />
            <span className="font-medium text-text-primary truncate">{entry.comment || "Untitled"}</span>
          </div>
          <p className="text-xs text-text-secondary truncate mt-0.5">{preview}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {entry.group?.slice(0, 3) || "def"}
            </Badge>
            {entry.key.length > 0 && (
              <span className="text-xs text-text-secondary">{entry.key.length} key{entry.key.length !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { lorebook, getEntries, addEntry } = useLorebookStore()
  const { searchQuery, setSearch, filterStatus, selectedEntryUid, selectEntry } = useEditorStore()
  const [showFilters, setShowFilters] = useState(false)

  const entries = useMemo(() => {
    let result = getEntries()

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.comment.toLowerCase().includes(query) ||
          e.content.toLowerCase().includes(query) ||
          e.key.some((k) => k.toLowerCase().includes(query))
      )
    }

    if (filterStatus !== "all") {
      result = result.filter((e) => {
        if (filterStatus === "disabled") return e.disable
        if (filterStatus === "enabled") return !e.disable && !e.constant
        if (filterStatus === "constant") return e.constant
        return true
      })
    }

    return result
  }, [lorebook, getEntries, searchQuery, filterStatus])

  const handleNewEntry = () => {
    const uid = addEntry()
    selectEntry(uid)
  }

  if (!lorebook) {
    return (
      <aside className="w-[280px] h-full bg-bg-surface border-r border-border flex flex-col">
        <div className="flex-1 flex items-center justify-center text-text-secondary text-sm p-4 text-center">
          Create a new lorebook or import an existing one to get started.
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-[280px] h-full bg-bg-surface border-r border-border flex flex-col">
      <div className="p-3 space-y-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            className="pl-9"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <div className="text-center text-text-secondary text-sm py-8">
            {searchQuery ? "No entries match your search" : "Add your first entry to start building your world"}
          </div>
        ) : (
          <div className="space-y-1">
            {entries.map((entry) => (
              <EntryCard
                key={entry.uid}
                entry={entry}
                isSelected={selectedEntryUid === entry.uid}
                onSelect={() => selectEntry(entry.uid)}
                onDoubleClick={() => selectEntry(entry.uid)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <Button className="w-full" onClick={handleNewEntry}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>
    </aside>
  )
}