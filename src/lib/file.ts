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

const INVALID_JSON_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g

function sanitizeString(value: string): string {
  return value.replace(INVALID_JSON_CHARS, "")
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") return sanitizeString(value)
  if (Array.isArray(value)) return value.map(sanitizeValue)
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[sanitizeString(k)] = sanitizeValue(v)
    }
    return result
  }
  return value
}

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
  const sortedEntries = Object.values(lorebook.entries).sort((a, b) => a.order - b.order)

  const orderedEntries: Record<string, Record<string, unknown>> = {}
  sortedEntries.forEach((entry, index) => {
    const entryWithIndex = { ...orderEntryFields(entry), displayIndex: index }
    orderedEntries[String(entry.uid)] = entryWithIndex
  })

  const sanitized = sanitizeValue({ entries: orderedEntries })
  const json = JSON.stringify(sanitized, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importLorebook(file: File, name?: string): Promise<Lorebook> {
  const text = await file.text()
  const json = JSON.parse(text)
  const lorebook = normalizeLorebook(json)
  if (name) {
    lorebook.name = name
  }
  return lorebook
}