# LoreGenius - Technical Specification

## 1. Project Overview

**LoreGenius** is a browser-based web application for creating, editing, and managing SillyTavern-compatible lorebooks. It provides a modern interface with AI-assisted writing capabilities, supporting both cloud and local AI providers through an OpenAI-compatible API.

**Core value proposition**: A dedicated, polished tool that replaces manual JSON editing for SillyTavern lorebook creation.

---

## 2. Tech Stack

| Layer            | Technology                         | Rationale                                      |
| ---------------- | ---------------------------------- | ---------------------------------------------- |
| Package Manager  | pnpm                               | Secure, disk-efficient, strict dependency resolution |
| Framework        | React 18+ with TypeScript          | Mature ecosystem, strong typing                |
| Build Tool       | Vite 5+                            | Fast HMR, native ESM, minimal config           |
| Styling          | Tailwind CSS 3+                    | Utility-first, consistent design tokens        |
| UI Components    | shadcn/ui (Radix primitives)       | Accessible, unstyled, copy-paste components    |
| State Management | Zustand                            | Lightweight, no boilerplate, TypeScript-first  |
| Icons            | Lucide React                       | Consistent, tree-shakeable SVG icon set        |
| AI Integration   | OpenAI SDK (client-side)           | Compatible with all OpenAI-style endpoints      |
| File Handling    | Native File API + Blob download    | Import/export JSON without backend             |
| Validation       | Zod                                | Runtime type validation for lorebook JSON      |
| Token Estimation | `gpt-tokenizer` (fallback: char heuristic) | Accurate token counting for content         |
| Routing          | React Router v6                    | Simple client-side routing (settings, editor)  |
| Testing          | Vitest + React Testing Library     | Fast, Vite-native unit/component tests         |
| Linting          | ESLint + Prettier                  | Consistent code style                          |
| Type Checking    | TypeScript 5+ (strict mode)        | Full type safety                               |

### No Backend

The app is fully client-side. AI API calls are made directly from the browser to the configured endpoint. No server, no database, no user accounts. All data lives in:

- **localStorage**: App settings, AI config, last-opened lorebook state
- **File system**: JSON files imported/exported by the user

---

## 3. Project Structure

```
lore-genius-3/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component, routing
│   ├── vite-env.d.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Top bar + sidebar + main layout
│   │   │   ├── Sidebar.tsx         # Entry list container
│   │   │   ├── TopBar.tsx          # Logo, lorebook name, actions
│   │   │   └── ThemeToggle.tsx     # Dark/light mode switch
│   │   │
│   │   ├── editor/
│   │   │   ├── EntryEditor.tsx     # Main entry editing view
│   │   │   ├── KeywordInput.tsx    # Tag-style keyword chips
│   │   │   ├── ContentEditor.tsx   # Multi-line textarea with stats
│   │   │   ├── AdvancedOptions.tsx # Collapsible advanced fields
│   │   │   ├── PositionSelect.tsx  # Position dropdown (0/1/2)
│   │   │   └── EntryActions.tsx    # Duplicate, delete, disable buttons
│   │   │
│   │   ├── sidebar/
│   │   │   ├── EntryList.tsx       # Scrollable entry list
│   │   │   ├── EntryCard.tsx       # Individual entry in list
│   │   │   ├── SearchBar.tsx       # Search input
│   │   │   ├── FilterBar.tsx       # Group + status filters
│   │   │   └── NewEntryButton.tsx  # Add entry CTA
│   │   │
│   │   ├── ai/
│   │   │   ├── AIPanel.tsx         # Slide-in AI assistant panel
│   │   │   ├── AIModeSelect.tsx    # Write/Edit/Expand/Chat selector
│   │   │   ├── AIResult.tsx        # Streaming result display
│   │   │   └── AIActions.tsx       # Accept/Regenerate/Discard
│   │   │
│   │   ├── settings/
│   │   │   ├── SettingsPage.tsx    # Full settings view
│   │   │   ├── AIConfig.tsx        # Endpoint, key, model config
│   │   │   ├── AIProviderSelect.tsx# Provider preset dropdown
│   │   │   ├── ModelSelect.tsx     # Model list with refresh
│   │   │   ├── ConnectionTest.tsx  # Test connection button + status
│   │   │   └── AppPreferences.tsx  # Theme, auto-save, sidebar prefs
│   │   │
│   │   ├── lorebook/
│   │   │   ├── LorebookMeta.tsx    # Lorebook name, description, globals
│   │   │   └── ImportExport.tsx    # File import/export controls
│   │   │
│   │   └── ui/                     # shadcn/ui primitives
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── select.tsx
│   │       ├── dialog.tsx
│   │       ├── toast.tsx
│   │       ├── tooltip.tsx
│   │       ├── switch.tsx
│   │       ├── slider.tsx
│   │       ├── badge.tsx
│   │       ├── separator.tsx
│   │       ├── collapsible.tsx
│   │       ├── dropdown-menu.tsx
│   │       └── sheet.tsx
│   │
│   ├── stores/
│   │   ├── lorebookStore.ts        # Lorebook state (entries, metadata)
│   │   ├── editorStore.ts          # Editor UI state (selected entry, panels)
│   │   ├── settingsStore.ts        # App settings (AI config, preferences)
│   │   └── aiStore.ts              # AI interaction state (streaming, results)
│   │
│   ├── lib/
│   │   ├── ai.ts                   # AI service (OpenAI-compatible calls)
│   │   ├── prompts.ts              # System/user prompt templates
│   │   ├── validation.ts           # Zod schemas for lorebook JSON
│   │   ├── tokenizer.ts            # Token count estimation
│   │   ├── file.ts                 # JSON import/export utilities
│   │   ├── uid.ts                  # UID generation
│   │   ├── defaults.ts             # Default values for entries/lorebook
│   │   └── utils.ts                # Shared helpers (cn, truncate, etc.)
│   │
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts # Global shortcut registration
│   │   ├── useAutoSave.ts          # Debounced auto-save logic
│   │   ├── useAI.ts                # AI generation hook (streaming)
│   │   └── useLocalStorage.ts      # Typed localStorage wrapper
│   │
│   ├── types/
│   │   ├── lorebook.ts             # TypeScript types for lorebook schema
│   │   ├── ai.ts                   # AI config and response types
│   │   └── settings.ts             # App settings types
│   │
│   └── styles/
│       └── globals.css             # Tailwind directives + custom styles
│
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
├── .prettierrc
└── README.md
```

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

```typescript
interface LorebookEntry {
  uid: number
  key: string[]
  keysecondary: string[]
  comment: string
  content: string
  constant: boolean
  selective: boolean
  order: number
  position: number
  disable: boolean
  excludeRecursion: boolean
  probability: number
  useProbability: boolean
  depth: number
  group: string
  scanDepth: number | null
  caseSensitive: boolean
  matchWholeWords: boolean
  automationId: string
  role: number
  sticky: number
  cooldown: number
  delay: number
  vectorized: boolean
}
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
  selective: false,
  order: 100,
  position: 0,
  disable: false,
  excludeRecursion: false,
  probability: 100,
  useProbability: false,
  depth: 4,
  group: "default",
  scanDepth: null,
  caseSensitive: false,
  matchWholeWords: false,
  automationId: "",
  role: 0,
  sticky: 0,
  cooldown: 0,
  delay: 0,
  vectorized: false,
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

const AI_DEFAULTS: AIConfig = {
  provider: "openai-compatible",
  endpoint: "http://localhost:1234/v1",
  apiKey: "",
  model: "",
  systemPrompt: "You are a creative writing assistant specializing in worldbuilding and lore creation for roleplay. Write concise, factual, and evocative lore entries.",
  temperature: 0.7,
  maxTokens: 1024,
}
```

### 4.6 App Settings

```typescript
interface AppSettings {
  theme: "dark" | "light" | "system"
  sidebarExpanded: boolean
  autoSave: "off" | "5s" | "10s" | "30s"
  showTokenCount: boolean
  ai: AIConfig
}
```

### 4.7 Editor UI State

```typescript
interface EditorState {
  selectedEntryUid: number | null
  aiPanelOpen: boolean
  aiPanelMode: "write" | "edit" | "expand" | "chat"
  advancedOptionsExpanded: boolean
  unsavedChanges: Set<number>
  searchQuery: string
  filterGroup: string | null
  filterStatus: "all" | "enabled" | "disabled" | "constant"
  sortBy: "order" | "name" | "group" | "modified"
}
```

---

## 5. State Management (Zustand Stores)

### 5.1 lorebookStore

Manages the lorebook data. This is the single source of truth for all entry and metadata operations.

```
State:
  - lorebook: Lorebook | null
  - isDirty: boolean

Actions:
  - loadLorebook(data: Lorebook): void
  - createNewLorebook(name: string): void
  - updateMetadata(fields: Partial<Lorebook>): void
  - addEntry(): number  (returns new uid)
  - updateEntry(uid: number, fields: Partial<LorebookEntry>): void
  - deleteEntry(uid: number): void
  - duplicateEntry(uid: number): number  (returns new uid)
  - moveEntry(fromUid: number, toIndex: number): void
  - getEntry(uid: number): LorebookEntry | undefined
  - getEntries(): LorebookEntry[]
  - getNextUid(): number
  - reset(): void
```

### 5.2 editorStore

Manages UI state for the editor. Not persisted.

```
State:
  - selectedEntryUid: number | null
  - aiPanelOpen: boolean
  - aiPanelMode: AIMode
  - advancedExpanded: boolean
  - searchQuery: string
  - filterGroup: string | null
  - filterStatus: FilterStatus
  - sortBy: SortOption

Actions:
  - selectEntry(uid: number | null): void
  - openAIPanel(mode: AIMode): void
  - closeAIPanel(): void
  - toggleAdvanced(): void
  - setSearch(query: string): void
  - setFilter(group: string | null, status: FilterStatus): void
  - setSort(sortBy: SortOption): void
```

### 5.3 settingsStore

Manages app settings. Persisted to localStorage.

```
State:
  - settings: AppSettings

Actions:
  - updateSettings(fields: Partial<AppSettings>): void
  - updateAIConfig(fields: Partial<AIConfig>): void
  - resetToDefaults(): void
  - loadFromStorage(): void
  - saveToStorage(): void
```

### 5.4 aiStore

Manages AI interaction state. Not persisted.

```
State:
  - isGenerating: boolean
  - streamingText: string
  - error: string | null
  - abortController: AbortController | null

Actions:
  - generate(prompt: string, context: AIContext): Promise<string>
  - stopGeneration(): void
  - clearResult(): void
```

---

## 6. AI Integration

### 6.1 Architecture

The AI module (`src/lib/ai.ts`) wraps OpenAI-compatible chat completions:

```
User Action → aiStore.generate() → ai.ts → fetch(endpoint/chat/completions)
                                              ↓
                                        Streaming response
                                              ↓
                                        aiStore.streamingText (reactive)
                                              ↓
                                        AIPanel renders tokens
                                              ↓
                                        User accepts → lorebookStore.updateEntry()
```

### 6.2 API Contract

All AI calls use the OpenAI chat completions format:

```
POST {endpoint}/chat/completions
Authorization: Bearer {apiKey}
Content-Type: application/json

{
  "model": "{model}",
  "messages": [
    { "role": "system", "content": "{systemPrompt}" },
    { "role": "user", "content": "{userPrompt}" }
  ],
  "temperature": {temperature},
  "max_tokens": {maxTokens},
  "stream": true
}
```

### 6.3 Prompt Templates

#### AI Write (generate from scratch)

```
System: {configured system prompt}

User: Write a lorebook entry for the following:

Title/Comment: {entry.comment}
Primary Keywords: {entry.key.join(", ")}
Secondary Keywords: {entry.keysecondary.join(", ")}
Group: {entry.group}

{customInstructions if provided}

Write concise, factual lore content suitable for injection into an AI roleplay prompt.
Focus on key facts, relationships, and distinctive details.
Keep it under 200 words unless the subject requires more detail.
```

#### AI Edit (rewrite existing)

```
System: {configured system prompt}

User: Rewrite and improve the following lorebook entry:

Title: {entry.comment}
Keywords: {entry.key.join(", ")}

Current content:
{entry.content}

{customInstructions if provided}

Improve clarity, conciseness, and detail. Maintain the same factual content.
Return only the improved text, no explanations.
```

#### AI Expand (add detail)

```
System: {configured system prompt}

User: Expand the following lorebook entry with additional detail:

Title: {entry.comment}
Keywords: {entry.key.join(", ")}

Current content:
{entry.content}

{customInstructions if provided}

Add relevant details while preserving all existing information.
Return only the expanded text, no explanations.
```

### 6.4 Provider Presets

| Provider          | Default Endpoint                    | Auth Required | Notes                            |
| ----------------- | ----------------------------------- | ------------- | -------------------------------- |
| OpenAI Compatible | (user-defined)                      | Optional      | Generic, works with any provider |
| LM Studio         | `http://localhost:1234/v1`          | No            | Auto-detects running instance    |
| Ollama            | `http://localhost:11434/v1`         | No            | Auto-detects running instance    |
| OpenAI            | `https://api.openai.com/v1`         | Yes           | Standard OpenAI API              |
| Custom            | (user-defined)                      | Optional      | Fully manual configuration       |

### 6.5 Model Discovery

```typescript
async function fetchModels(endpoint: string, apiKey: string): Promise<string[]> {
  const response = await fetch(`${endpoint}/models`, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
  })
  const data = await response.json()
  return data.data.map((m: { id: string }) => m.id).sort()
}
```

### 6.6 Connection Test

```typescript
async function testConnection(endpoint: string, apiKey: string): Promise<{
  success: boolean
  message: string
  models?: string[]
}> {
  try {
    const models = await fetchModels(endpoint, apiKey)
    return {
      success: true,
      message: `Connected. ${models.length} model(s) available.`,
      models,
    }
  } catch {
    return { success: false, message: "Could not reach endpoint." }
  }
}
```

---

## 7. Validation (Zod Schemas)

### 7.1 Entry Schema

```typescript
const LorebookEntrySchema = z.object({
  uid: z.number().int(),
  key: z.array(z.string()).min(1, "At least one primary key is required"),
  keysecondary: z.array(z.string()),
  comment: z.string(),
  content: z.string().min(1, "Content cannot be empty"),
  constant: z.boolean(),
  selective: z.boolean(),
  order: z.number().int(),
  position: z.number().int().min(0),
  disable: z.boolean(),
  excludeRecursion: z.boolean(),
  probability: z.number().int().min(0).max(100),
  useProbability: z.boolean(),
  depth: z.number().int().min(0),
  group: z.string(),
  scanDepth: z.number().int().nullable(),
  caseSensitive: z.boolean(),
  matchWholeWords: z.boolean(),
  automationId: z.string(),
  role: z.number().int().min(0),
  sticky: z.number().int().min(0),
  cooldown: z.number().int().min(0),
  delay: z.number().int().min(0),
  vectorized: z.boolean(),
})
```

### 7.2 Lorebook Schema

```typescript
const LorebookSchema = z.object({
  entries: z.record(z.string(), LorebookEntrySchema),
  name: z.string().min(1, "Lorebook name is required"),
  description: z.string(),
  scanDepth: z.number().int().min(1),
  tokenBudget: z.number().int().min(1),
  recursiveScanning: z.boolean(),
  extensions: z.record(z.string(), z.unknown()),
})
```

### 7.3 Validation Pipeline

```
Import JSON
  → Parse JSON (syntax check)
  → Validate against LorebookSchema (structure check)
  → Check UID uniqueness
  → Check for duplicate keys (warning)
  → Estimate total tokens vs tokenBudget (warning)
  → Return: { valid: boolean, warnings: string[], errors: string[] }
```

---

## 8. File Import/Export

### 8.1 Import

```typescript
async function importLorebook(file: File): Promise<Lorebook> {
  const text = await file.text()
  const json = JSON.parse(text)
  const result = LorebookSchema.safeParse(json)

  if (!result.success) {
    throw new ValidationError(result.error.format())
  }

  return result.data
}
```

**Supported formats**:
- SillyTavern lorebook JSON (primary)
- Raw JSON with `entries` object (auto-wraps missing top-level fields with defaults)

**Entry-level field migration**: When importing a lorebook, any entry fields missing from the source JSON are filled with `ENTRY_DEFAULTS` values. This ensures compatibility with older SillyTavern versions that may not include newer fields:

```typescript
function normalizeEntry(partial: Partial<LorebookEntry>): LorebookEntry {
  return { ...ENTRY_DEFAULTS, ...partial }
}

function normalizeLorebook(json: unknown): Lorebook {
  const parsed = LorebookSchema.parse(json)
  const entries: Record<string, LorebookEntry> = {}
  for (const [key, entry] of Object.entries(parsed.entries)) {
    entries[key] = normalizeEntry(entry)
  }
  return { ...LOREBOOK_DEFAULTS, ...parsed, entries }
}
```

This normalization runs after Zod parsing, so optional/missing fields are safely filled before the data reaches the store.

### 8.2 Export

```typescript
function exportLorebook(lorebook: Lorebook, filename: string): void {
  const json = JSON.stringify(lorebook, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.json`
  a.click()
  URL.revokeObjectURL(url)
}
```

**Export format**: Always produces valid SillyTavern-compatible JSON with all fields present, even if at default values. This ensures maximum compatibility.

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
| 14 | AI Expand (add detail to content)    | P1       | M      |
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

---

## 10. Key Implementation Details

### 10.1 UID Generation

UIDs are monotonically increasing integers within a lorebook. On add:

```typescript
function getNextUid(entries: Record<string, LorebookEntry>): number {
  const uids = Object.values(entries).map((e) => e.uid)
  return uids.length === 0 ? 0 : Math.max(...uids) + 1
}
```

### 10.2 Entry Key in `entries` Object

The `entries` object uses stringified UIDs as keys:

```typescript
// Adding entry with uid 5
lorebook.entries["5"] = newEntry
```

**Ordering note**: `Object.keys()` and `Object.values()` do not guarantee numeric sort order for string keys. When iterating entries in display order, always sort by the `order` field rather than relying on key insertion order:

```typescript
function getSortedEntries(entries: Record<string, LorebookEntry>): LorebookEntry[] {
  return Object.values(entries).sort((a, b) => a.order - b.order)
}
```

### 10.3 Auto-Save

When enabled, a debounced save triggers after the configured interval of inactivity. Auto-save stores a draft to localStorage (not a file download) to avoid spamming the downloads folder:

```typescript
// Auto-save stores draft in localStorage
localStorage.setItem("lorebook-draft", JSON.stringify(lorebook))

// On app load, check for draft and offer to restore
const draft = localStorage.getItem("lorebook-draft")
if (draft) {
  showRestoreDialog(JSON.parse(draft))
}
```

**Important**: Auto-save and explicit export are separate concepts:
- **Auto-save** (draft): Persists work-in-progress to localStorage silently. Survives page reloads. Shown as "Draft saved" toast.
- **Export** (file download): Triggered by Ctrl+S or the Save button. Validates the lorebook, then downloads a `.json` file to the user's machine. Shown as "Lorebook saved!" toast.

The unsaved-changes indicator reflects whether the in-memory state differs from the last exported file. Auto-save does not clear this indicator.

### 10.4 Token Estimation

Approximate token count. The app uses `gpt-tokenizer` for accurate counts when available, with a character-based heuristic as fallback:

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

The heuristic fallback (`text.length / 4`) works for average English text but significantly underestimates CJK content. The `gpt-tokenizer` library uses the GPT-2/BPE vocabulary and provides counts accurate enough for budget planning.

Displayed in the content editor footer and as a total across all entries in the lorebook metadata view.

### 10.5 Theme Implementation

Theme is applied via a `data-theme` attribute on `<html>` and Tailwind's `dark:` variant. The `system` option uses `prefers-color-scheme` media query.

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

### 10.6 Undo/Redo Limitation

Undo/redo is not included in the MVP (Phase 1) or Phase 2. It is listed as a Phase 3 (P2/L) feature. This is a known UX limitation for a content editor. The mitigation strategy is:

- Auto-save drafts to localStorage prevent data loss on accidental edits
- Entry duplication before major edits serves as a manual "checkpoint"
- Ctrl+Z browser-level undo works within text fields

A future undo/redo implementation should use a command pattern with a history stack in the lorebook store, limiting depth to 50 states to manage memory.

### 10.7 Tailwind Token Mapping

Design color tokens from `DESIGN.md` are mapped to Tailwind via `tailwind.config.ts`:

```typescript
// tailwind.config.ts
export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          input: "var(--bg-input)",
        },
        border: "var(--border)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        ai: {
          glow: "var(--ai-glow)",
        },
      },
    },
  },
}
```

CSS custom properties are set in `globals.css` per theme, using the values from `DESIGN.md`:

```css
:root {
  --bg-primary: #f8f9fc;
  --bg-surface: #ffffff;
  /* ... light theme tokens ... */
}

.dark {
  --bg-primary: #0f1117;
  --bg-surface: #1a1d27;
  /* ... dark theme tokens ... */
}
```

---

## 11. Error Handling Strategy

| Scenario                    | Handling                                                |
| --------------------------- | ------------------------------------------------------- |
| Invalid JSON on import      | Error toast with parse error line/column                |
| Schema validation failure   | Error toast listing each failed field                   |
| AI endpoint unreachable     | Error toast + AI panel shows "Connection failed" state  |
| AI generation error (4xx)   | Error toast with HTTP status + message                  |
| AI generation timeout       | Auto-stop after 60s, show partial result + warning      |
| Empty required fields       | Inline red border + helper text on save attempt         |
| Duplicate UIDs on import    | Auto-fix by reassigning UIDs, show warning toast        |
| localStorage quota exceeded | Warning toast, disable auto-save draft                  |

---

## 12. Performance Considerations

| Concern                     | Mitigation                                              |
| --------------------------- | ------------------------------------------------------- |
| Large lorebooks (500+ entries) | Virtualized entry list (react-window or similar)     |
| Slow AI responses           | Streaming display, abort button, 60s timeout            |
| Large content fields        | Debounced validation (300ms), lazy token counting       |
| Initial bundle size         | Route-based code splitting, lazy-load settings page     |
| Re-renders on typing        | Zustand selectors with shallow equality, `useMemo`      |

---

## 13. Security Considerations

| Concern                     | Mitigation                                              |
| --------------------------- | ------------------------------------------------------- |
| API key exposure            | Stored only in localStorage, never logged or transmitted except to configured endpoint |
| XSS via content fields      | All user content rendered as text (never `dangerouslySetInnerHTML`) |
| Malicious JSON import       | Zod strict validation rejects unexpected fields         |
| CORS issues with local AI   | Document that LM Studio/Ollama must enable CORS headers |

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
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

---

## 15. Acceptance Criteria (MVP)

The MVP is complete when:

1. User can create a new lorebook with name and description
2. User can add, edit, and delete entries with all SillyTavern fields
3. User can import a valid SillyTavern JSON file and see all entries
4. User can export the current lorebook as valid SillyTavern JSON
5. Exported JSON imports cleanly into SillyTavern without errors
6. Entry list supports search and basic filtering
7. AI Write and AI Edit work with a configured OpenAI-compatible endpoint
8. AI panel shows streaming responses and allows accept/regenerate/discard
9. Settings page allows configuring AI endpoint, key, and model
10. LM Studio works as a local AI provider out of the box
11. App has a dark theme by default with light theme toggle
12. App is responsive and usable on desktop (primary) and tablet (secondary)
