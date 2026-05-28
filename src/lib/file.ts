import type { Lorebook, LorebookEntry } from "@/types/lorebook"
import { ENTRY_DEFAULTS, LOREBOOK_DEFAULTS } from "./defaults"

export function normalizeEntry(partial: Partial<LorebookEntry>): LorebookEntry {
  return { ...ENTRY_DEFAULTS, ...partial }
}

export function normalizeLorebook(json: unknown): Lorebook {
  const parsed = json as Partial<Lorebook>
  const entries: Record<string, LorebookEntry> = {}

  if (parsed.entries) {
    for (const [key, entry] of Object.entries(parsed.entries)) {
      entries[key] = normalizeEntry(entry as Partial<LorebookEntry>)
    }
  }

  return {
    ...LOREBOOK_DEFAULTS,
    ...parsed,
    entries,
  }
}

export function exportLorebook(lorebook: Lorebook, filename: string): void {
  const json = JSON.stringify(lorebook, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importLorebook(file: File): Promise<Lorebook> {
  const text = await file.text()
  const json = JSON.parse(text)
  return normalizeLorebook(json)
}