# LoreGenius - Technical Specification

## 1. Project Overview

**LoreGenius** is a browser-based web application for creating, editing, and managing SillyTavern-compatible lorebooks. It provides a modern interface with AI-assisted writing capabilities, supporting both cloud and local AI providers through an OpenAI-compatible API.

**Core value proposition**: A dedicated, polished tool that replaces manual JSON editing for SillyTavern lorebook creation.

---

## 2. Tech Stack

| Layer            | Technology                         | Rationale                                      |
| ---------------- | ---------------------------------- | ---------------------------------------------- |
| Package Manager  | pnpm                               | Secure, disk-efficient, strict dependency resolution |
| Framework        | React 19 with TypeScript           | Mature ecosystem, strong typing                |
| Build Tool       | Vite 8                             | Fast HMR, native ESM, minimal config           |
| Styling          | Tailwind CSS 4 (`@tailwindcss/vite`)| Utility-first, zero-config via Vite plugin + `@theme inline` |
| UI Components    | shadcn/ui (Radix primitives)       | Accessible, unstyled, copy-paste components    |
| State Management | Zustand                            | Lightweight, no boilerplate, TypeScript-first  |
| Icons            | Lucide React                       | Consistent, tree-shakeable SVG icon set        |
| AI Integration   | Raw `fetch` to OpenAI-style `/chat/completions` (SSE streaming) | Compatible with all OpenAI-style endpoints; the `openai` SDK is installed but currently unused |
| File Handling    | Native File API + Blob download    | Import/export JSON without backend             |
| Validation       | Spread-merge normalization (`ENTRY_DEFAULTS`/`LOREBOOK_DEFAULTS`) | Loose validation tolerant of older SillyTavern formats. (`zod` is a dependency but no schemas are defined yet) |
| Token Estimation | `gpt-tokenizer` (fallback: char heuristic) | Accurate token counting for content         |
| Routing          | React Router v7                    | Simple client-side routing (settings, editor)  |
| Linting          | ESLint + Prettier                  | Consistent code style                          |
| Type Checking    | TypeScript (strict mode)           | Full type safety                               |

> Note: A Vitest + React Testing Library setup is planned but not yet present — there are no test scripts or test files.

### No Backend

The app is fully client-side. AI API calls are made directly from the browser to the configured endpoint. No server, no database, no user accounts. All data lives in:

- **localStorage**: App settings (key `loregenius-settings`) and auto-save drafts (key `lorebook-draft`)
- **File system**: JSON files imported/exported by the user

---

## 3. Project Structure

```
lore-genius-3/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component, routing, global hook wiring
│   ├── vite-env.d.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Top bar + sidebar + main layout, renders AIPanel
│   │   │   ├── Sidebar.tsx         # Entry list container (inline EntryCard, search, status filter, "+ New Entry")
│   │   │   ├── TopBar.tsx          # Logo, lorebook name, import/export, settings nav
│   │   │   ├── ThemeToggle.tsx     # Dark/light/system switch
│   │   │   └── index.ts
│   │   │
│   │   ├── editor/
│   │   │   ├── EntryEditor.tsx     # Main entry editing view (comment, keys, content, actions)
│   │   │   ├── KeywordInput.tsx    # Tag-style keyword chips (primary + secondary)
│   │   │   ├── ContentEditor.tsx   # Textarea + char/word/token stats + preview toggle
│   │   │   ├── AdvancedOptions.tsx # Collapsible advanced fields (incl. inline Position/Role/NullableBool selects)
│   │   │   └── index.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── AIPanel.tsx         # Slide-in AI assistant panel (builds prompt, calls aiStore.generate)
│   │   │   ├── AIPreviewDialog.tsx # Result preview with Replace / Extend / Abort actions
│   │   │   ├── AIResult.tsx        # Streaming result display
│   │   │   └── index.ts
│   │   │
│   │   ├── settings/
│   │   │   ├── SettingsPage.tsx    # Full settings view (AI config, behaviour, app prefs, LM Studio test)
│   │   │   └── index.ts
│   │   │
│   │   └── ui/                     # shadcn/ui primitives
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── dialog.tsx
│   │       ├── tooltip.tsx
│   │       ├── switch.tsx
│   │       ├── slider.tsx
│   │       ├── badge.tsx
│   │       ├── separator.tsx
│   │       ├── collapsible.tsx
│   │       ├── sheet.tsx
│   │       └── index.ts
│   │
│   ├── stores/
│   │   ├── lorebookStore.ts        # Lorebook state (entries, metadata). Not persisted.
│   │   ├── editorStore.ts          # Editor UI state (selected entry, panels, filters). Not persisted.
│   │   ├── settingsStore.ts        # App settings. Manually persisted to localStorage.
│   │   ├── aiStore.ts              # AI interaction state + streaming fetch implementation. Not persisted.
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── defaults.ts             # ENTRY_DEFAULTS, LOREBOOK_DEFAULTS
│   │   ├── file.ts                 # JSON import/export (normalize, order fields, sanitize, download)
│   │   ├── tokenizer.ts            # estimateTokens() via gpt-tokenizer
│   │   ├── utils.ts                # cn(), truncate(), generateUid()
│   │   └── (no ai.ts / prompts.ts / validation.ts / uid.ts — see sections 6 & 7)
│   │
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts # Global shortcut registration
│   │   ├── useAutoSave.ts          # Debounced draft auto-save to localStorage
│   │   ├── useTheme.ts             # Theme application + cycling toggle
│   │   └── index.ts
│   │
│   ├── types/
│   │   ├── lorebook.ts             # Lorebook / LorebookEntry types, EntryPosition / EntryRole
│   │   ├── ai.ts                   # AIConfig / AIProvider / AIMode / AIContext
│   │   ├── settings.ts             # AppSettings / Theme / AutoSaveInterval
│   │   └── index.ts
│   │
│   └── styles/
│       └── globals.css             # Tailwind 4 `@import`, `@theme inline` token mapping, base styles
│
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts                  # react + @tailwindcss/vite, `@` → ./src alias
├── eslint.config.js
├── .prettierrc
└── README.md
```

> Tailwind 4 is configured entirely in `vite.config.ts` (the `@tailwindcss/vite` plugin) and `src/styles/globals.css` (`@import "tailwindcss";` + an `@theme inline { ... }` block mapping `--color-*` tokens to CSS custom properties). There is **no `tailwind.config.ts`** and **no `postcss.config.js`**.

---

## 4. Data Models

### 4.1 Lorebook (Top-Level)

```typescript
interface Lorebook {
  entries: Record<string, LorebookEntry>
  name: string
  description: string
  scanDepth: number
  tokenBudget: number
  recursiveScanning: boolean
  extensions: Record<string, unknown>
}
```

### 4.2 LorebookEntry

The entry model mirrors the full SillyTavern lorebook entry schema (all fields are present on import/export):

```typescript
interface LorebookEntry {
  uid: number
  key: string[]
  keysecondary: string[]
  comment: string
  content: string
  constant: boolean
  vectorized: boolean
  selective: boolean
  selectiveLogic: number
  addMemo: boolean
  order: number
  position: number
  disable: boolean
  ignoreBudget: boolean
  excludeRecursion: boolean
  preventRecursion: boolean
  matchPersonaDescription: boolean
  matchCharacterDescription: boolean
  matchCharacterPersonality: boolean
  matchCharacterDepthPrompt: boolean
  matchScenario: boolean
  matchCreatorNotes: boolean
  delayUntilRecursion: boolean
  probability: number
  useProbability: boolean
  depth: number
  outletName: string
  group: string
  groupOverride: boolean
  groupWeight: number
  scanDepth: number | null
  caseSensitive: boolean | null
  matchWholeWords: boolean | null
  useGroupScoring: boolean | null
  automationId: string
  role: number | null
  sticky: number
  cooldown: number
  delay: number
  triggers: unknown[]
  displayIndex: number
}

type EntryPosition = 0 | 1 | 2   // 0: Before Char Def, 1: After Char Def, 2: Author's Note
type EntryRole    = 0 | 1 | 2   // 0: System, 1: User, 2: Assistant (null = default/System)
```

### 4.3 Entry Defaults

```typescript
const ENTRY_DEFAULTS: LorebookEntry = {
  uid: 0,
  key: [],
  keysecondary: [],
  comment: "",
  content: "",
  constant: false,
  vectorized: false,
  selective: true,
  selectiveLogic: 0,
  addMemo: true,
  order: 100,
  position: 0,
  disable: false,
  ignoreBudget: false,
  excludeRecursion: false,
  preventRecursion: false,
  matchPersonaDescription: false,
  matchCharacterDescription: false,
  matchCharacterPersonality: false,
  matchCharacterDepthPrompt: false,
  matchScenario: false,
  matchCreatorNotes: false,
  delayUntilRecursion: false,
  probability: 100,
  useProbability: true,
  depth: 4,
  outletName: "",
  group: "",
  groupOverride: false,
  groupWeight: 100,
  scanDepth: null,
  caseSensitive: null,
  matchWholeWords: null,
  useGroupScoring: null,
  automationId: "",
  role: null,
  sticky: 0,
  cooldown: 0,
  delay: 0,
  triggers: [],
  displayIndex: 0,
}
```

### 4.4 Lorebook Defaults

```typescript
const LOREBOOK_DEFAULTS: Omit<Lorebook, "entries"> = {
  name: "Untitled Lorebook",
  description: "",
  scanDepth: 4,
  tokenBudget: 512,
  recursiveScanning: true,
  extensions: {},
}
```

### 4.5 AI Configuration

```typescript
interface AIConfig {
  provider: AIProvider
  endpoint: string
  apiKey: string
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
}

type AIProvider =
  | "openai-compatible"
  | "lm-studio"
  | "ollama"
  | "openai"
  | "custom"

type AIMode = "write" | "expand"

interface AIContext {
  entryComment: string
  entryKeys: string[]
  entryKeysecondary: string[]
  entryGroup: string
  entryContent: string
}
```

The default config is defined inside `settingsStore.ts` as `DEFAULT_AI_CONFIG`:

```typescript
const DEFAULT_AI_CONFIG: AIConfig = {
  provider: "openai-compatible",
  endpoint: "http://localhost:1234/v1",
  apiKey: "",
  model: "",
  systemPrompt:
    "You are a creative writing assistant specializing in worldbuilding and lore creation for roleplay. Write concise, factual, and evocative lore entries.",
  temperature: 0.7,
  maxTokens: 1024,
}
```

### 4.6 App Settings

```typescript
type Theme = "dark" | "light" | "system"
type AutoSaveInterval = "off" | "5s" | "10s" | "30s"

interface AppSettings {
  theme: Theme
  sidebarExpanded: boolean
  autoSave: AutoSaveInterval
  showTokenCount: boolean
  ai: AIConfig
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  sidebarExpanded: true,
  autoSave: "off",
  showTokenCount: true,
  ai: DEFAULT_AI_CONFIG,
}
```

### 4.7 Editor UI State

Defined inside `editorStore.ts`:

```typescript
type FilterStatus = "all" | "enabled" | "disabled" | "constant"
type SortOption   = "order" | "name" | "group" | "modified"

interface EditorState {
  selectedEntryUid: number | null
  aiPanelOpen: boolean
  advancedOptionsExpanded: boolean
  searchQuery: string
  filterGroup: string | null
  filterStatus: FilterStatus
  sortBy: SortOption
  showDeleteConfirm: boolean
}
```

---

## 5. State Management (Zustand Stores)

All four stores use `create()` from `zustand`. **None use the `persist` middleware** — persistence is performed manually (settings via `localStorage["loregenius-settings"]`, drafts via `localStorage["lorebook-draft"]`).

### 5.1 lorebookStore

Manages lorebook data; the single source of truth for all entry and metadata operations. Not persisted.

```
State:
  - lorebook: Lorebook | null
  - isDirty: boolean

Actions:
  - loadLorebook(data: Lorebook): void            (also resets editor selection/search/filter)
  - createNewLorebook(name: string): void
  - updateMetadata(fields: Partial<Lorebook>): void
  - addEntry(): number                             (returns new uid; uses ENTRY_DEFAULTS + getNextUid())
  - updateEntry(uid: number, fields: Partial<LorebookEntry>): void
  - deleteEntry(uid: number): void
  - duplicateEntry(uid: number): number            (returns new uid; comment += " (copy)", order += 1)
  - moveEntry(fromUid: number, toIndex: number): void  (sets order = toIndex * 100)
  - getEntry(uid: number): LorebookEntry | undefined
  - getEntries(): LorebookEntry[]                  (sorted by `order` ascending)
  - getNextUid(): number                          (0 if empty, else maxUid + 1)
  - reset(): void
  - markClean(): void                              (sets isDirty = false)
```

### 5.2 editorStore

Manages UI state for the editor. Not persisted.

```
State:
  - selectedEntryUid: number | null
  - aiPanelOpen: boolean
  - advancedOptionsExpanded: boolean              (default true)
  - searchQuery: string
  - filterGroup: string | null
  - filterStatus: FilterStatus                     (default "all")
  - sortBy: SortOption                             (default "order")
  - showDeleteConfirm: boolean

Actions:
  - selectEntry(uid: number | null): void
  - openAIPanel(): void                            (no mode argument — mode is decided by the caller)
  - closeAIPanel(): void
  - toggleAdvanced(): void
  - setSearch(query: string): void
  - setFilter(group: string | null, status: FilterStatus): void
  - setSort(sortBy: SortOption): void
  - setShowDeleteConfirm(show: boolean): void
```

> Note: `filterGroup` and `sortBy` exist in the store but are **not wired into the Sidebar UI** — only `searchQuery` and `filterStatus` are currently rendered as controls.

### 5.3 settingsStore

Manages app settings. Manually persisted to `localStorage["loregenius-settings"]`.

```
State:
  - settings: AppSettings

Actions:
  - updateSettings(fields: Partial<AppSettings>): void   (auto-saves to storage)
  - updateAIConfig(fields: Partial<AIConfig>): void      (auto-saves to storage)
  - resetToDefaults(): void                              (auto-saves to storage)
  - loadFromStorage(): void                              (merges stored over DEFAULT_SETTINGS)
  - saveToStorage(): void
```

### 5.4 aiStore

Manages AI interaction state and contains the streaming fetch implementation. Not persisted.

```
State:
  - isGenerating: boolean
  - isThinking: boolean                           (set when a "reasoning"/"thinking" stream is active)
  - streamingText: string
  - error: string | null
  - abortController: AbortController | null

Actions:
  - generate(prompt: string, context: AIContext, mode: AIMode): Promise<string>
  - stopGeneration(): void                         (aborts the in-flight request)
  - clearResult(): void
```

`generate()` reads AI config dynamically via `useSettingsStore.getState().settings.ai`, then performs a raw `fetch` to `${endpoint}/chat/completions` with `stream: true`, parsing SSE manually. It extracts content from `delta.content` / `delta.text` / `message.content` / `choice.text`, and reasoning from `reasoning_content` / `reasoning` / `thinking`. The `openai` SDK package is installed but **not currently used** by this store.

---

## 6. AI Integration

### 6.1 Architecture

There is no separate `lib/ai.ts` or `lib/prompts.ts` file. AI streaming lives in `editorStore`'s sibling `aiStore.ts`, and the user-facing prompt is built inline in `AIPanel.tsx`:

```
User Action → AIPanel.buildPrompt() → aiStore.generate(prompt, context, "write")
                                            ↓
                                      aiStore → fetch(`${endpoint}/chat/completions`, { stream: true })
                                            ↓
                                      SSE parsed manually → streamingText + isThinking (reactive)
                                            ↓
                                      AIPreviewDialog renders result → Replace / Extend / Abort
                                            ↓
                                      On Replace/Extend → lorebookStore.updateEntry()
```

### 6.2 API Contract

```
POST {endpoint}/chat/completions
Authorization: Bearer {apiKey}        (omitted if apiKey is empty)
Content-Type: application/json

{
  "model": "model || \"unknown\"",
  "messages": [
    { "role": "system", "content": "{settings.ai.systemPrompt}" },
    { "role": "user",   "content": "{userPrompt}" }
  ],
  "temperature": {settings.ai.temperature},
  "max_tokens":  {settings.ai.maxTokens},
  "stream": true
}
```

### 6.3 Prompt Template (Write)

Only a single template ("write") is currently constructed, in `AIPanel.tsx::buildPrompt()`:

```
{configured system prompt}

Write a lorebook entry for the following:

Title/Comment: {entry.comment}
Primary Keywords: {entry.key.join(", ")}
Secondary Keywords: {entry.keysecondary.join(", ")}
Group: {entry.group}
{Current Content:\n{entry.content}   (only if entry.content is non-empty)}

{Additional instructions: {customInstructions}   (only if provided)}

Write concise, factual lore content suitable for injection into an AI roleplay prompt.
Focus on key facts, relationships, and distinctive details.
Keep it under 200 words unless the subject requires more detail.
```

The "expand" `AIMode` is accepted by `aiStore.generate()` but `AIPanel` always invokes the store with `"write"`. Expansion behaviour is instead handled client-side by `AIPreviewDialog`'s **Extend** button, which concatenates `${entry.content}\n\n${streamingText}`.

### 6.4 Provider Presets

Configured inline in `SettingsPage.tsx::handleProviderChange`. Selecting a provider sets the endpoint:

| Provider          | Default Endpoint                    | Auth Required | Notes                            |
| ----------------- | ----------------------------------- | ------------- | -------------------------------- |
| OpenAI Compatible | `http://localhost:1234/v1`          | Optional      | Default provider; generic         |
| LM Studio         | `http://localhost:1234/v1`          | No            | Local, auto-configures port       |
| Ollama            | `http://localhost:11434/v1`         | No            | Local, auto-configures port       |
| OpenAI            | `https://api.openai.com/v1`         | Yes           | Standard OpenAI API               |
| Custom            | (current endpoint retained)        | Optional      | Fully manual configuration        |

### 6.5 Model Discovery

Lives in `SettingsPage.tsx` ("Refresh Models"). Equivalent behaviour:

```typescript
const res = await fetch(`${ai.endpoint}/models`, {
  headers: ai.apiKey ? { Authorization: `Bearer ${ai.apiKey}` } : {},
})
const data = await res.json()
const models = data.data?.map((m: { id: string }) => m.id).sort()
```

If no model is currently selected and models are found, the first model is auto-selected.

### 6.6 Connection Test

Lives in `SettingsPage.tsx` ("Test Connection"). It reuses the model discovery call and reports:

```typescript
{
  success: boolean,
  message: string,      // "Connected. N model(s) available." or "Could not reach endpoint."
  models?: string[]
}
```

---

## 7. Import Normalization

> There are **no Zod schemas** anywhere in the codebase, despite `zod` being a dependency. Import does not run any schema validation pipeline; instead, loose spread-merges fill missing fields with `ENTRY_DEFAULTS` / `LOREBOOK_DEFAULTS`. There is no `min(1)` enforcement, required-field enforcement, UID-uniqueness reassignment, or duplicate-key warnings during import.

`src/lib/file.ts` exposes:

```typescript
function normalizeEntry(partial: Partial<LorebookEntry>): LorebookEntry {
  return { ...ENTRY_DEFAULTS, ...partial }
}

function normalizeLorebook(json: unknown): Lorebook {
  const parsed = json as Lorebook
  const entries: Record<string, LorebookEntry> = {}
  for (const [key, entry] of Object.entries(parsed.entries)) {
    entries[key] = normalizeEntry(entry)
  }
  return { ...LOREBOOK_DEFAULTS, ...parsed, entries }
}
```

Because this is a pure spread, any fields present in the source JSON override the defaults, and any missing fields are silently filled. Unexpected/extra fields are *preserved* (not rejected) on import; on export the entry is rebuilt from a fixed field-order list (see §8.2), so unknown keys are dropped from the exported file.

---

## 8. File Import/Export

### 8.1 Import

```typescript
async function importLorebook(file: File, name?: string): Promise<Lorebook> {
  const text = await file.text()
  const json = JSON.parse(text)
  const lorebook = normalizeLorebook(json)
  if (name) lorebook.name = name
  return lorebook
}
```

**Supported formats**:
- SillyTavern lorebook JSON (primary)
- Raw JSON with an `entries` object (missing top-level and entry fields are filled with defaults)

### 8.2 Export

```typescript
function exportLorebook(lorebook: Lorebook, filename: string): void {
  // 1. Sort entries by `order` ascending and write sequential displayIndex.
  // 2. Reorder each entry's keys to a fixed ENTRY_FIELD_ORDER (42 SillyTavern fields).
  // 3. Remove invisible control chars (\x00-\x08, \x0B, \x0C, \x0E-\x1F) from strings.
  // 4. JSON.stringify(lorebook, null, 2) → Blob → download as `${filename}.json`.
}
```

**Export format**: Always produces valid SillyTavern-compatible JSON with all known fields present (unknown keys are dropped by the field reordering step), even if the values are defaults. This ensures maximum compatibility.

---

## 9. Feature Breakdown

### Phase 1: Core Editor (MVP)

| #  | Feature                        | Priority | Effort |
| -- | ------------------------------ | -------- | ------ |
| 1  | Create/load/save lorebook JSON | P0       | S      |
| 2  | Entry list with search         | P0       | M      |
| 3  | Entry editor (all fields)      | P0       | L      |
| 4  | Keyword tag input              | P0       | M      |
| 5  | Add/duplicate/delete entries   | P0       | S      |
| 6  | Lorebook metadata editing      | P0       | S      |
| 7  | Import/export JSON files       | P0       | S      |
| 8  | JSON validation on import      | P0       | M      |
| 9  | Dark/light theme               | P1       | S      |
| 10 | Responsive layout              | P1       | M      |

### Phase 2: AI Integration

| #  | Feature                              | Priority | Effort |
| -- | ------------------------------------ | -------- | ------ |
| 11 | Settings page (AI endpoint config)   | P0       | M      |
| 12 | AI Write (generate entry content)    | P0       | M      |
| 13 | AI Edit (rewrite existing content)   | P0       | M      |
| 14 | AI Expand (extend existing content)  | P1       | S      |
| 15 | Streaming AI responses               | P1       | M      |
| 16 | AI Chat mode                         | P2       | M      |
| 17 | Model auto-detection                 | P1       | S      |
| 18 | Connection test                      | P1       | S      |
| 19 | LM Studio / Ollama presets           | P1       | S      |
| 20 | Custom system prompt                 | P2       | S      |

### Phase 3: Polish & Productivity

| #  | Feature                              | Priority | Effort |
| -- | ------------------------------------ | -------- | ------ |
| 21 | Keyboard shortcuts                   | P1       | M      |
| 22 | Entry drag-to-reorder                | P2       | M      |
| 23 | Group filter + sort                  | P1       | S      |
| 24 | Token count estimation               | P1       | S      |
| 25 | Auto-save (debounced)                | P2       | S      |
| 26 | Unsaved changes indicator            | P1       | S      |
| 27 | Entry context menu                   | P2       | S      |
| 28 | Undo/redo                            | P2       | L      |
| 29 | Bulk operations (select multiple)    | P3       | L      |
| 30 | Entry templates                      | P3       | M      |

**Effort scale**: S (small, <2h), M (medium, 2-6h), L (large, 6-12h)

> Current implementation status: Phase 1 core editing, import/export, themes (1–7, 9–10), AI Write + streaming + model detection + connection test + presets (11, 12, 14, 15, 17–19), keyboard shortcuts (21), token estimation (24), and draft auto-save (25) are implemented. AI Edit / Chat (13, 16), group filter/sort UI (23), drag reorder (22), context menu (27), and undo/redo (28) are **not** yet implemented despite store fields existing for some of them.

---

## 10. Key Implementation Details

### 10.1 UID Generation

Entry UIDs are monotonically increasing integers within a lorebook, assigned by the store:

```typescript
function getNextUid(): number {
  const uids = Object.values(lorebook.entries).map((e) => e.uid)
  return uids.length === 0 ? 0 : Math.max(...uids) + 1
}
```

`src/lib/utils.ts` also exports a `generateUid()` helper (`Date.now() + Math.floor(Math.random() * 1000)`), but it is **not used** for entry UIDs.

### 10.2 Entry Key in `entries` Object

The `entries` object uses stringified UIDs as keys:

```typescript
// Adding entry with uid 5
lorebook.entries["5"] = newEntry
```

**Ordering note**: `Object.keys()` / `Object.values()` do not guarantee numeric sort order for string keys. When iterating entries in display order, always sort by the `order` field (this is what `lorebookStore.getEntries()` and `exportLorebook()` do):

```typescript
function getSortedEntries(entries: Record<string, LorebookEntry>): LorebookEntry[] {
  return Object.values(entries).sort((a, b) => a.order - b.order)
}
```

### 10.3 Auto-Save

When enabled, a debounced save triggers after the configured interval of inactivity. Auto-save stores a draft to localStorage (not a file download) to avoid spamming the downloads folder:

```typescript
// useAutoSave.ts — draft key
localStorage.setItem("lorebook-draft", JSON.stringify(lorebook))
```

`useAutoSave` debounces using a `setTimeout` (interval = parsed `settings.autoSave` seconds) keyed off `lorebook`/`isDirty`, and calls `markClean()` after persisting. There is currently **no "offer to restore draft" dialog** on load — the draft is written but not surfaced back to the user.

**Important**: Auto-save and explicit export are separate concepts:
- **Auto-save** (draft): Persists work-in-progress to localStorage silently. Survives page reloads.
- **Export** (file download): Triggered from the TopBar export control (a "Ctrl+S save" shortcut is registered in `useKeyboardShortcuts` but currently only calls `preventDefault()` — it does not invoke export). Downloads a `.json` file to the user's machine.

The unsaved-changes indicator (`lorebookStore.isDirty`) reflects whether the in-memory state differs from the last-clean state. Auto-save calls `markClean()` and **does** clear this indicator.

### 10.4 Token Estimation

```typescript
import { encode } from "gpt-tokenizer"

function estimateTokens(text: string): number {
  try {
    return encode(text).length
  } catch {
    return Math.ceil(text.length / 4)
  }
}
```

The `gpt-tokenizer` library uses the GPT-2/BPE vocabulary and provides counts accurate enough for budget planning. The heuristic fallback (`text.length / 4`) runs **only** when `encode()` throws. Displayed in the `ContentEditor` footer (gated by `settings.showTokenCount`).

### 10.5 Theme Implementation

Theme is applied by toggling a `dark` class on `<html>` (Tailwind `dark:` variant). The `system` option resolves via `matchMedia("(prefers-color-scheme: dark)")` and re-applies on change. `<html>` ships with `class="dark"` by default in `index.html` to match the default `theme: "dark"` setting.

```typescript
function applyTheme(theme: "dark" | "light" | "system") {
  const root = document.documentElement
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    root.classList.toggle("dark", prefersDark)
  } else {
    root.classList.toggle("dark", theme === "dark")
  }
}
```

`useTheme` additionally cycles `dark → light → system → dark` via `toggleTheme()`.

### 10.6 Tailwind Token Mapping (Tailwind 4)

There is **no `tailwind.config.ts`**. Tailwind 4 is wired through the `@tailwindcss/vite` plugin and an `@theme inline { ... }` block in `src/styles/globals.css`, which maps flat `--color-*` names to the CSS custom properties defined for `:root` (light) and `.dark` (dark):

```css
@import "tailwindcss";

@theme inline {
  --color-bg-primary: var(--bg-primary);
  --color-bg-surface: var(--bg-surface);
  --color-bg-elevated: var(--bg-elevated);
  --color-bg-input:   var(--bg-input);
  --color-border:     var(--border);
  --color-text-primary:   var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-accent:       var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger:  var(--danger);
  --color-ai-glow: var(--ai-glow);
}

:root {
  --bg-primary: #f8f9fc;
  --bg-surface: #ffffff;
  /* ... light theme tokens (see DESIGN.md) ... */
}

.dark {
  --bg-primary: #0f1117;
  --bg-surface: #1a1d27;
  /* ... dark theme tokens (see DESIGN.md) ... */
}
```

The token values in `globals.css` match `DESIGN.md` exactly (26 values, dark + light).

### 10.7 Undo/Redo Limitation

Undo/redo is not implemented. Mitigation strategy:
- Auto-save drafts to localStorage prevent data loss on accidental edits
- Entry duplication before major edits serves as a manual "checkpoint"
- `Ctrl+Z` browser-level undo works within text fields

A future undo/redo implementation should use a command pattern with a history stack in the lorebook store, limiting depth to 50 states to manage memory.

---

## 11. Error Handling Strategy

There is no global toast system (no `toast` UI component exists). Errors are surfaced inline:

| Scenario                    | Handling                                                |
| --------------------------- | ------------------------------------------------------- |
| Invalid JSON on import      | Throws from `JSON.parse`; propagates to the import call site in `TopBar.tsx` (no user-facing toast today) |
| Missing/extra fields on import | Silently filled by `normalizeEntry`/`normalizeLorebook`; no error shown |
| AI endpoint unreachable / error | `aiStore.error` set; shown inline in `AIPanel`/`AIPreviewDialog` |
| AI generation timeout       | User must press Abort (`stopGeneration()`); there is no automatic 60s timeout |
| Connection test failure     | `connectionStatus.success=false` shown inline in `SettingsPage` |
| localStorage quota exceeded | (Not currently handled — auto-save may throw silently) |

---

## 12. Performance Considerations

| Concern                     | Current state                                            |
| --------------------------- | ------------------------------------------------------- |
| Large lorebooks (500+ entries) | No virtualization; `Sidebar` renders all entry cards directly |
| Slow AI responses           | Streaming display + `Abort` button (no automatic timeout) |
| Large content fields        | Token count recomputed on every keystroke via `useEffect` (not debounced) |
| Initial bundle size         | No route-based code splitting; `SettingsPage` is statically imported |
| Re-renders on typing        | Zustand selectors; `useMemo` where practical |

---

## 13. Security Considerations

| Concern                     | Mitigation                                              |
| --------------------------- | ------------------------------------------------------- |
| API key exposure            | Stored only in `localStorage["loregenius-settings"]`; sent only to the configured endpoint |
| XSS via content fields      | All user content rendered as text (never `dangerouslySetInnerHTML`) |
| Malicious JSON import       | Spread-merge normalization fills known fields; unknown fields are dropped on export. **No schema rejection** of unexpected fields |
| CORS issues with local AI  | Document that LM Studio/Ollama must enable CORS headers  |

---

## 14. Development Commands

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  }
}
```

> There is no `test`/`test:run` script and no Vitest/RTL dependency; testing infrastructure is not yet set up.

---

## 15. Acceptance Criteria (MVP)

The MVP is complete when:

1. User can create a new lorebook with name and description
2. User can add, edit, and delete entries with all SillyTavern fields
3. User can import a valid SillyTavern JSON file and see all entries
4. User can export the current lorebook as valid SillyTavern JSON
5. Exported JSON imports cleanly into SillyTavern without errors
6. Entry list supports search and basic filtering
7. AI Write works with a configured OpenAI-compatible endpoint
8. AI preview shows streaming responses and allows Replace/Extend/Abort
9. Settings page allows configuring AI endpoint, key, and model
10. LM Studio works as a local AI provider out of the box
11. App has a dark theme by default with light theme toggle
12. App is responsive and usable on desktop (primary) and tablet (secondary)