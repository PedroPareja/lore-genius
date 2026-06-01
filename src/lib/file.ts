import type { Lorebook, LorebookEntry } from "@/types/lorebook"
import { ENTRY_DEFAULTS, LOREBOOK_DEFAULTS } from "./defaults"

const ENTRY_FIELD_ORDER: (keyof LorebookEntry)[] = [
  "uid",
  "key",
  "keysecondary",
  "comment",
  "content",
  "constant",
  "vectorized",
  "selective",
  "selectiveLogic",
  "addMemo",
  "order",
  "position",
  "disable",
  "ignoreBudget",
  "excludeRecursion",
  "preventRecursion",
  "matchPersonaDescription",
  "matchCharacterDescription",
  "matchCharacterPersonality",
  "matchCharacterDepthPrompt",
  "matchScenario",
  "matchCreatorNotes",
  "delayUntilRecursion",
  "probability",
  "useProbability",
  "depth",
  "outletName",
  "group",
  "groupOverride",
  "groupWeight",
  "scanDepth",
  "caseSensitive",
  "matchWholeWords",
  "useGroupScoring",
  "automationId",
  "role",
  "sticky",
  "cooldown",
  "delay",
  "triggers",
  "displayIndex",
]

function orderEntryFields(entry: LorebookEntry): Record<string, unknown> {
  const ordered: Record<string, unknown> = {}
  for (const key of ENTRY_FIELD_ORDER) {
    ordered[key] = entry[key]
  }
  return ordered
}

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
  const orderedEntries: Record<string, Record<string, unknown>> = {}
  for (const [key, entry] of Object.entries(lorebook.entries)) {
    orderedEntries[key] = orderEntryFields(entry)
  }

  const json = JSON.stringify({ entries: orderedEntries }, null, 2)
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