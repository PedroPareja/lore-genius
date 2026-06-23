# LoreGenius - UI/UX Design Document

## 1. Design Philosophy

- **Clarity over density**: Each screen has a clear focal point; information is progressively disclosed
- **Contextual editing**: All entry fields are reachable without modal nesting; advanced options collapse by default
- **Keyboard-first**: Full keyboard navigation; shortcuts for common actions (save, new entry, AI assist)
- **Dark-first**: Default dark theme with light mode toggle; low-eye-strain color palette

---

## 2. Color System

### Dark Theme (Default)

| Token            | Value       | Usage                        |
| ---------------- | ----------- | ---------------------------- |
| `bg-primary`     | `#0f1117`   | App background               |
| `bg-surface`     | `#1a1d27`   | Cards, panels, sidebar       |
| `bg-elevated`    | `#242836`   | Hover states, active items   |
| `bg-input`       | `#2a2e3b`   | Input fields                 |
| `border`         | `#2e3348`   | Borders, dividers            |
| `text-primary`   | `#e4e6f0`   | Primary text                 |
| `text-secondary` | `#9499b0`   | Labels, hints, metadata      |
| `accent`         | `#6c5ce7`   | Primary accent (purple)      |
| `accent-hover`   | `#7f71ed`   | Accent hover state           |
| `success`        | `#00b894`   | Enabled, saved, active       |
| `warning`        | `#fdcb6e`   | Warnings, probability        |
| `danger`         | `#e17055`   | Disabled, errors, delete     |
| `ai-glow`        | `#a29bfe`   | AI-related UI accents        |

### Light Theme

| Token            | Value       | Usage                        |
| ---------------- | ----------- | ---------------------------- |
| `bg-primary`     | `#f8f9fc`   | App background               |
| `bg-surface`     | `#ffffff`   | Cards, panels, sidebar       |
| `bg-elevated`    | `#f0f1f5`   | Hover states, active items   |
| `bg-input`       | `#e8e9ef`   | Input fields                 |
| `border`         | `#d4d6e0`   | Borders, dividers            |
| `text-primary`   | `#1a1d27`   | Primary text                 |
| `text-secondary` | `#5c6078`   | Labels, hints, metadata      |
| `accent`         | `#6c5ce7`   | Primary accent (purple)      |
| `accent-hover`   | `#5a4bd6`   | Accent hover state           |
| `success`        | `#00a884`   | Enabled, saved, active       |
| `warning`        | `#e5a800`   | Warnings, probability        |
| `danger`         | `#d64534`   | Disabled, errors, delete     |
| `ai-glow`        | `#7c6fe0`   | AI-related UI accents        |

All semantic token names remain the same between themes; only the values change. Switching themes swaps the entire token set.

---

## 3. Typography

| Role       | Font                    | Size  | Weight |
| ---------- | ----------------------- | ----- | ------ |
| Heading 1  | Inter                   | 24px  | 700    |
| Heading 2  | Inter                   | 18px  | 600    |
| Body       | Inter                   | 14px  | 400    |
| Mono/Code  | JetBrains Mono          | 13px  | 400    |
| Label      | Inter                   | 12px  | 500    |
| Caption    | Inter                   | 11px  | 400    |

---

## 4. Layout

### 4.1 Global Shell

```
+----------------------------------------------------------+
| [Logo] LoreGenius  [LB Name] [New][AI LB][Import][Export]|
+----------+-----------------------------------------------+
|          |                                               |
| SIDEBAR  |              MAIN CONTENT                     |
|          |                                               |
| Entries  |   (changes per view — see below)              |
| List     |   (editor / settings / AI lorebook wizard /   |
|          |    character templates manager)                |
| [Search] |                                               |
| [Filter] |                                               |
| [+ New]  |                                               |
|          |                                               |
+----------+-----------------------------------------------+
```

The top bar exposes lorebook-level actions: **New** (empty lorebook), **AI Lorebook** (open the AI generation wizard — see 4.8), **Import**, **Export**, **Templates** (open Character Templates manager — see 4.7), theme toggle, and settings.

- **Sidebar**: Fixed 280px width, collapsible to 60px (icon-only mode) via drag or toggle
- **Main content**: Fluid, min-width 600px
- **Top bar**: Fixed 52px height

### 4.2 Sidebar — Entry List

```
+-----------------------------+
|  [Search icon] Search...    |
|  [Group filter ▼] [Sort ▼] |
+-----------------------------+
|  ⠿ ● Night City        loc  |
|    "Main city"              |
|  ⠿ ○ Arasaka Corp      fac  |
|    "Megacorporation"        |
|  ⠿ ○ David Martinez    chr  |
|    "Protagonist"        ✓AI |
|  ⠿ ○ (disabled) Lucy   chr  |
|    "Netrunner"              |
+-----------------------------+
|  [+ New Entry]              |
+-----------------------------+
```

The `⠿` drag handle appears on hover and is the grab target for reordering. On touch devices, a long-press initiates drag.

Each entry card shows:

| Element          | Details                                          |
| ---------------- | ------------------------------------------------ |
| Drag handle      | `⠿` icon, visible on hover; grab target for drag reorder |
| Status dot       | Green = enabled, Red = disabled, Purple = constant |
| Unsaved dot      | Blue dot in top-right corner of card when entry has unsaved changes |
| Comment/title    | Truncated to 1 line, bold                        |
| Content preview  | First 60 chars of content, dimmed                |
| Group badge      | Small colored pill (first 3 chars)               |
| AI indicator     | Small sparkle icon if AI was used to generate    |
| Keywords count   | Tiny badge showing `key` count                   |

**Interactions**:
- Click: Select entry, load in editor
- Double-click: Focus comment field for rename
- Right-click: Context menu (Duplicate, Delete, Disable/Enable, Move to Group)
- Drag: Reorder within list (updates `order` field)

**Filter & Sort**:
- Filter by group (dropdown)
- Filter by status: All / Enabled / Disabled / Constant
- Sort: By Order / By Name / By Group / By Date Modified (app-tracked)

### 4.3 Main Content — Entry Editor

When an entry is selected, the main area shows the full editor:

```
+-----------------------------------------------------------+
|  ← Back to list (mobile)   Entry #3   [Duplicate] [Delete]|
+-----------------------------------------------------------+
|                                                           |
|  Comment / Title                                          |
|  [Arasaka Corporation_________________________]           |
|                                                           |
|  Primary Keys *                                           |
|  [Arasaka] [Arasaka Corp] [+ Add keyword]                |
|                                                           |
|  Secondary Keys                                           |
|  [corporation] [megacorp] [+ Add keyword]                |
|  ☐ Require secondary keys (selective)                     |
|                                                           |
|  Content *                                                |
|  +---------------------------------------------------+    |
|  | Arasaka is a powerful megacorporation             |    |
|  | headquartered in Night City...                     |    |
|  |                                                    |    |
|  |                                                    |    |
|  +---------------------------------------------------+    |
|  [✨ AI Write]  [Random Personality]                        |
|                                                           |
|  ─── Advanced Options ──────────────────────── [▼ Toggle] |
|                                                           |
|  (collapsed by default, expands to show:)                 |
|                                                           |
|  [Order: 100]  [Position: Before Char Def ▼]             |
|  [Group: factions ▼]  [Role: System ▼]                   |
|  [Depth: 4]  [Scan Depth: (global)]                      |
|  ☐ Constant  ☐ Disabled  ☐ Exclude Recursion             |
|  ☐ Case Sensitive  ☐ Match Whole Words                   |
|  ☐ Use Probability  [Probability: 100]                   |
|  [Sticky: 0]  [Cooldown: 0]  [Delay: 0]                 |
|  ☐ Vectorized                                             |
|                                                           |
+-----------------------------------------------------------+
```

**Key UX decisions**:

1. **Progressive disclosure**: Advanced options are hidden by default. Most users only need keys + content. Clicking the toggle reveals all 15+ advanced fields in a clean grid layout.

2. **Tag-style keyword input**: Keywords are chips/tags, not a comma-separated text field. Easy to add/remove individual keywords. Enter or comma adds a new chip; click X on chip removes it.

3. **Content editor**: Multi-line textarea with:
   - Character/word/token count display (bottom-right)
   - Token count estimation via `gpt-tokenizer` (with a `chars / 4` fallback only if the tokenizer throws)
   - Preview toggle: switches the textarea to a read-only view of the raw content; toggle again returns to edit mode. Unsaved edits are preserved across toggles.

4. **AI assist button** below content:
   - **AI Write**: Generate content from the comment/title and keywords (with the current content, if any, provided as context) using the AI Assistant Panel (see 4.5). After streaming completes, a preview dialog lets the user **Replace** (overwrite content) or **Extend** (append to content).
   - Each opens the AI Assistant Panel (see 4.5)
   - **Random Personality**: Generates a randomized personality profile (see 4.9) and **appends** it to the current entry content. Useful as raw material the AI can later refine via AI Write/Expand. No AI call is made — the profile is computed locally and inserted as formatted text so the user can edit/delete it freely.

5. **Inline validation**: Required fields (key, content) show red border + helper text if empty on save attempt.

6. **Unsaved changes indicator**: Dot in tab title, "Unsaved" badge next to lorebook name, and unsaved state tracked per-entry.

### 4.4 Lorebook Metadata View

Accessible from top bar by clicking the lorebook name:

```
+-----------------------------------------------------------+
|  Lorebook Settings                                         |
+-----------------------------------------------------------+
|                                                           |
|  Name *                                                    |
|  [Cyberpunk Lorebook________]                             |
|                                                           |
|  Description                                               |
|  [World lore for cyberpunk RP________________]            |
|                                                           |
|  Global Scan Depth        [4 ▼]                           |
|  Token Budget             [512 ▼]                         |
|  ☐ Recursive Scanning                                     |
|                                                           |
|  [Save]  [Cancel]                                         |
|                                                           |
+-----------------------------------------------------------+
```

This maps to the top-level lorebook fields: `name`, `description`, `scanDepth`, `tokenBudget`, `recursiveScanning`.

### 4.5 AI Assistant Panel

Slides in from the right (400px wide) when an AI action is triggered:

```
+----------------------------------+
|  AI Assistant              [✕]   |
+----------------------------------+
|                                  |
|  Mode: [Write ▼]                |
|  (Write / Expand)               |
|                                  |
|  Context (auto-filled):          |
|  - Entry: "Arasaka Corporation" |
|  - Keys: Arasaka, Arasaka Corp  |
|                                  |
|  Custom instructions:            |
|  [Focus on corporate history___]|
|  [and military technology______]|
|                                  |
|  [✨ Generate]                   |
|                                  |
|  ── Result ──────────────────── |
|                                  |
|  Arasaka Corporation is a       |
|  Japanese megacorporation...    |
|                                  |
|  [Replace] [Extend] [Abort]     |
|                                  |
+----------------------------------+
```

**AI Modes**:

| Mode       | Behavior                                                             |
| ---------- | -------------------------------------------------------------------- |
| Write      | Generates content from scratch using entry comment + keys as prompt  |
| Expand     | Appends generated detail to the entry's existing content            |

**Flow**:
1. User clicks an AI button on the entry editor
2. Panel slides in, pre-filled with context from current entry
3. User can add custom instructions (optional)
4. Click Generate → streaming response appears
5. User chooses: Replace (overwrites content), Extend (appends to content), or Abort (stop generation)
6. On Replace/Extend, content is placed in the editor (still unsaved — user must save explicitly)

**Streaming**: AI responses stream token-by-token with a typing animation. A "Stop" button appears during generation.

### 4.6 Settings Page

Full-page view, accessible from top bar gear icon:

```
+-----------------------------------------------------------+
|  ← Back         Settings                                   |
+-----------------------------------------------------------+
|                                                           |
|  ── AI Configuration ─────────────────────────────────────|
|                                                           |
|  Provider         [OpenAI Compatible ▼]                   |
|                                                           |
|  API Endpoint                                              |
|  [http://localhost:1234/v1________________]               |
|                                                           |
|  API Key                                                   |
|  [•••••••••••••••••••]  [Show/Hide]                       |
|                                                           |
|  Model                                                     |
|  [Auto-detect ▼]  [Refresh Models]                        |
|                                                           |
|  ── AI Behavior ──────────────────────────────────────────|
|                                                           |
|  Default System Prompt                                     |
|  [You are a creative writing assistant...]                |
|                                                           |
|  Temperature      [0.7 ───●─── 1.0]                      |
|  Max Tokens       [1024 ▼]                                |
|  Max Context Size [32768 ▼]                                |
|                                                           |
|  ── App Preferences ──────────────────────────────────────|
|                                                           |
|  Theme           [Dark ▼]  (Dark / Light / System)       |
|  Sidebar Default [Expanded ▼]                             |
|  Auto-save       [After 5s ▼]  (Off / 5s / 10s / 30s)   |
|  Show Token Count  ☐ Enabled                             |
|                                                           |
|  ── Local AI (LM Studio) ────────────────────────────────|
|                                                           |
|  ☑ Enable LM Studio detection                             |
|  LM Studio Port   [1234]                                  |
|  [Test Connection]                                         |
|  Status: ● Connected / ○ Unreachable                     |
|                                                           |
|  ── Danger Zone ──────────────────────────────────────────|
|                                                           |
|  [Clear All App Data]  [Reset Settings to Default]       |
|                                                           |
+-----------------------------------------------------------+
```

**Key UX decisions**:

1. **LM Studio auto-detection**: The app attempts to detect a running LM Studio instance at `http://localhost:{port}/v1` and auto-fills endpoint + model list.

2. **Provider presets**: Dropdown includes:
   - OpenAI Compatible (custom endpoint)
   - LM Studio (local, auto-configures port)
   - Ollama (local, auto-configures `http://localhost:11434/v1`)
   - OpenAI (api.openai.com)
   - Custom (fully manual)

3. **Model list**: Clicking "Refresh Models" calls `GET /v1/models` on the configured endpoint and populates the model dropdown.

4. **Connection test**: "Test Connection" makes a lightweight request to verify the endpoint is reachable and the API key (if needed) is valid.

5. **API Key security**: Key is stored in localStorage (never sent anywhere except the configured endpoint). Masked by default with show/hide toggle.

6. **Max Context Size**: The maximum context window (in tokens) the configured model can accept. Used by the **AI Lorebook Generator** to budget how many characters/concepts can be generated in a single agent run and to decide whether to split generation across multiple sequential requests. Defaults to `32768`. A helper hint shows the estimated number of characters achievable within the budget (e.g. "~20 characters @ 1500 tokens each").

### 4.7 Character Templates Manager

Full-page view, accessible from the top-bar **Templates** button:

```
+-----------------------------------------------------------+
|  ← Back         Character Templates                         |
+-----------------------------------------------------------+
|                                                           |
|  [+ New Template]     [Import JSON]   [Export JSON]        |
|   ! "You have unsaved templates. Export them to a JSON file to avoid losing them."
|                                                           |
|  ── Templates ────────────────────────────────────────── |
|                                                           |
|  ⠿ ● Arasaka Exec            [Edit] [Delete]              |
|    "Ruthless corporate executive with a hidden past"      |
|  ⠿ ● Netrunner               [Edit] [Delete]              |
|    "Brilliant hacker haunted by their last run"           |
|  ⠿ ● Street Samurai          [Edit] [Delete]              |
|    "Cybernetically-enhanced mercenary"                    |
|                                                           |
+-----------------------------------------------------------+
```

The **Templates** list shows one card per template:

| Element        | Details                                                    |
| -------------- | ---------------------------------------------------------- |
| Drag handle    | `⠿` reorder handle (optional, controls export order)      |
| Status dot     | Green = saved, Blue = unsaved changes                      |
| Name           | Character/template name (bold)                            |
| Data preview   | First 80 chars of `data`, dimmed                          |
| Actions        | Edit (opens template editor), Delete (with confirmation)  |

**Template Editor** (inline dialog or full-page form):

```
+-----------------------------------------------------------+
|  Edit Character Template                                   |
+-----------------------------------------------------------+
|                                                           |
|  Name *                                                    |
|  [Arasaka Executive_____________________]                 |
|                                                           |
|  Data                                                      |
|  +---------------------------------------------------+    |
|  | Appearance: Tall, sharp features, always in a     |    |
|  | tailored suit. Cybernetic left eye.                |    |
|  |                                                    |    |
|  | Bio: Born into poverty, clawed their way up...     |    |
|  |                                                    |    |
|  | Fixed traits: Cold, calculating. Allergic to      |    |
|  | emp jelly. Hates being touched.                    |    |
|  +---------------------------------------------------+    |
|                                                           |
|  [Save]  [Cancel]                                          |
+-----------------------------------------------------------+
```

**Key UX decisions**:

1. **Two fields only**: Each character template has `name` (string) and `data` (free-form string). The `data` blob can include appearance, bio, fixed personality traits, quirks, kind of job — any text the AI should treat as immutable base material when generating the corresponding character.

2. **Bulk import/export**: `Export JSON` downloads all templates as a single file using the Character Templates JSON spec (see SPECS.md §X). `Import JSON` accepts a file conforming to that spec and merges/overwrites templates by `name` (with a confirmation dialog if names collide). Individual templates cannot be exported (only bulk).

3. **Unsaved-data warning**: If any template has been added or modified since the last export/import/load, a non-blocking warning banner ("! You have unsaved templates. Export them to a JSON file to avoid losing them.") is shown. Templates live only in `localStorage` between sessions; no automatic file is written.

4. **Navigation**: The "← Back" button returns to the previous screen (main editor or empty-state). The Templates manager is reachable both when a lorebook is open and from the empty state.

5. **Used-in-lorebook indicator (optional, future)**: When generating an AI Lorebook, templates selected for the run are temporarily marked "in use" to prevent double-use within the same lorebook (see 4.8).

### 4.8 AI Lorebook Generator (Agent Mode)

Opened from the top-bar **AI Lorebook** button. Slides in as a full-page wizard (replacing the main content area) with a progress panel on the right:

```
+-----------------------------------------------------------+
|  ← Back         AI Lorebook Generator                      |
+-----------------------------------------------------------+----------------------------------+
|  Configuration                                             |  Generation Progress             |
|                                                            |                                 |
|  World idea / concept description *                        |  ● Analyzing world idea…      ✓ |
|  +---------------------------------------------------+    |  ● Generating concepts…      ✓ |
|  | A totalitarian theocracy where women are          |    ○ Generating {{user}}…        |
|  | reduced to reproductive vessels...                 |    ○ Generating character 1/N…  |
|  |                                                    |    ○ Generating character 2/N…  |
|  +---------------------------------------------------+    |                                 |
|                                                            |  Tokens used: 4,200 / 32768     |
|  Lorebook name *                                           |                                 |
|  [The Handmaid's Tale_____________________]              |  [Stop]                         |
|                                                            |                                 |
|  Target number of characters *  [8 ▼]                     |  ── Live log ──────────────── |
|  Generate concepts?           ☑ Yes                       |  > concept "handmaid": A woman |
|  Character templates JSON     [Choose file…]               |      assigned to bear children… |
|   (optional — leave empty to use random base templates)   |  > concept "Gilead": The nation |
|                                                            |  > character "June Osborne"…     |
|  Extra instructions (optional)                             |                                 |
|  [Set a somber, literary tone; include… ]                  |                                 |
|                                                            |                                 |
|  [✨ Generate Lorebook]                                     |                                 |
+-----------------------------------------------------------+----------------------------------+
```

**Configuration fields**:

| Field                       | Required | Purpose                                                            |
| --------------------------- | -------- | ----------------------------------------------------------------- |
| World idea / concept        | Yes      | Free-form description of the world to build (the seed)            |
| Lorebook name               | Yes      | Name of the resulting lorebook                                     |
| Target number of characters | Yes      | How many character entries to generate (≤ available templates)   |
| Generate concepts?          | No       | If checked, AI also produces concept entries (keywords for world) |
| Character templates JSON    | No       | Bulk-imported templates to draw from; falls back to in-app templates if empty |
| Extra instructions          | No       | Additional guidance for tone, themes, content restrictions         |

**Generation agent flow**:

1. **Plan**: the agent builds an outline (`{{user}}` persona, list of concept keywords, list of N characters each assigned a unique template) *without* writing full entries. This plan is streamed into the live log and can be aborted before content generation.
2. **Concepts** (optional): for each planned concept, the agent produces a concept entry (keyword + short description). E.g. for *The Handmaid's Tale*: `handmaid`, `commander`, `eye`, `wife`, `Gilead`, `women rights`.
3. **`{{user}}` entry**: a singleton entry keyed `{{user}}` describing the user persona in that world (role, status, starting situation). Constant flag often enabled.
4. **Characters**: one entry per planned character, each:
   - Based on a **unique character template** (each template used at most once per lorebook).
   - Primary keywords = the distinct words of the character's name **plus** relevant role/job terms (e.g. for "June Osborne" → `June`, `Osborne`, `handmaid`; for "Arasaka Executive" → `Arasaka`, `Executive`, `CEO`).
   - Content includes a full **appearance/physical description**, **personality**, **bio**, and **motivations & struggles**. The personality is inspired by a freshly rolled **Random Personality** profile (see 4.9), but the AI may override specific traits if a template's fixed traits or world coherence demand it. Where a random trait contradicts an established template trait, **the template wins**.
5. **Budget management**: the agent respects `settings.ai.maxContextSize` (see 4.6). If the planned work would exceed the budget, it splits generation across multiple sequential requests, re-feeding previously generated entries as context so names/world stay consistent.
6. **Result**: a new lorebook is created, loaded into the main editor, and displayed — user can immediately review/edit/export it. A summary toast reports characters and concepts created. The original wizard state is discarded.

The progress panel is a read-only log; the user cannot edit during generation. The **Stop** button aborts the agent mid-run; partial entries are not committed (the user is told the lorebook was not created).

**Non-AI local helper — Random Personality**: the agent calls a local, deterministic-by-seed function (no AI) to roll a personality profile for each character before asking the AI to write the character. This keeps randomness cheap and reproducible. See 4.9.

### 4.9 Random Personality Tool

A pure-local function (`lib/personality.ts`) that returns a randomized personality profile. It is **not** AI-generated — it is cheap, instant, and deterministic given a seed. The output is a structured object rendered as a formatted text block for both the manual button (4.3) and the AI agent (4.8).

**Personality areas** (the final list, reviewed and extended):

| # | Area                  |
| - | --------------------- |
| 1 | Friendliness          |
| 2 | Honesty               |
| 3 | Confidence            |
| 4 | Agreeableness         |
| 5 | Manners               |
| 6 | Discipline            |
| 7 | Rebelliousness        |
| 8 | Loyalty               |
| 9 | Emotional Capacity    |
| 10 | Intelligence           |
| 11 | Positivity             |
| 12 | Activity Level         |
| 13 | Social Tendency       |
| 14 | Courage               |
| 15 | Patience              |
| 16 | Creativity            |
| 17 | Humor                 |
| 18 | Generosity            |
| 19 | Trust                 |
| 20 | Ambition              |
| 21 | Stress Response       |
| 22 | Curiosity              |
| 23 | Empathy                |
| 24 | Independence           |
| 25 | Adaptability           |
| 26 | Energy                 |
| 27 | Sensitivity            |
| 28 | Perseverance           |
| 29 | Self-Control           |
| 30 | Playfulness            |

> Extended from the original 20 with: Loyalty, Curiosity, Empathy, Independence, Adaptability, Energy, Sensitivity, Perseverance, Self-Control, Playfulness. The list is data-driven (`PERSONALITY_AREAS`) so further additions are trivial and need no code changes.

**Output format** (appended to entry content / fed to the agent):

```
[Personality]
Friendliness:    Low (25)
Honesty:          High (80)
Confidence:       Moderate (55)
Agreeableness:    Low (20)
Manners:          High (90)
Discipline:       Very High (95)
Rebelliousness:   Very Low (5)
Loyalty:          High (85)
Emotional Capacity: Moderate (50)
Intelligence:     Very High (92)
...
```

Each area gets a numeric value 0–100 plus a verbal bucket (Very Low / Low / Moderate-Low / Moderate / Moderate-High / High / Very High) tuned to feel meaningful for character writing. The function exposes `rollPersonality(seed?: string): PersonalityProfile`.

---

## 5. Interaction Flows

### 5.1 Create New Lorebook

```
App loads (empty state)
  → "Create New Lorebook" CTA in center
  → User enters name + description
  → Empty lorebook created
  → User starts adding entries
```

### 5.2 Import Existing Lorebook

```
User clicks [Import] in top bar
  → File picker opens (filtered to .json)
  → JSON is parsed and validated
  → If valid: lorebook loads into app
  → If invalid: error toast with specific validation issue
  → User can now edit entries
```

### 5.2b Generate AI Lorebook (Agent Mode)

```
User clicks [AI Lorebook] in top bar
  → Wizard opens (4.8) in main content area
  → User fills world idea, name, target character count, optional templates JSON
  → User clicks [✨ Generate Lorebook]
  → Agent:
      1. Plans (user persona, concepts, N characters bound to unique templates)
      2. (Optional) generates concept entries
      3. Creates {{user}} entry
      4. For each character: rolls a Random Personality, asks AI to write
         appearance + personality + bio + motivations, template traits win on conflict
      5. Respects maxContextSize, splits across requests if needed
  → Progress + live log shown in right panel; [Stop] can abort
  → On completion: new lorebook created in lorebookStore and shown in main editor
  → Toast: "Lorebook created: N characters, M concepts"
  → User can review, edit, export
```

### 5.2c Random Personality (manual)

```
User opens an entry in the editor
  → Clicks [Random Personality] under the content textarea (4.3)
  → A fresh personality profile is computed locally and appended to content
  → Entry remains unsaved (user can edit/delete the appended block)
  → Optional: pair with [✨ AI Write] + custom instructions to "incorporate the appended personality profile into a coherent character description"
```

### 5.2d Manage Character Templates

```
User clicks [Templates] in top bar
  → Character Templates Manager opens (4.7)
  → If templates have unsaved changes, warning banner is shown
  → User can: create, edit, delete, bulk-import JSON, bulk-export JSON
  → [← Back] returns to previous screen
```

### 5.3 Create New Entry

```
User clicks [+ New Entry] in sidebar
  → New entry created with defaults
  → Entry selected in sidebar
  → Editor scrolls to Comment field (focused)
  → User fills in fields
  → Entry auto-saves (if enabled) or user presses Ctrl+S
```

### 5.4 AI-Assisted Entry Creation

```
User creates new entry
  → Fills in Comment and Keywords
  → Clicks [✨ AI Write]
  → AI panel slides in
  → Optional: adds custom instructions
  → Clicks Generate
  → Streaming response appears
  → Clicks Accept
  → Content populates editor
  → User reviews, edits, saves
```

### 5.5 Save / Export

```
User clicks [Save] or Ctrl+S
  → Export dialog appears:
     - Filename (default: lorebook name)
     - Format: SillyTavern JSON
  → JSON file downloads to user's machine
  → Toast: "Lorebook saved!"
```

### 5.6 Validate Before Export

On save, the app silently validates:
- All entries have at least one key
- All entries have non-empty content
- All UIDs are unique
- No duplicate keys across entries (warn, not block)
- Token budget not exceeded (warn)

Validation errors block export with inline indicators. Warnings show a confirmation dialog.

---

## 6. Responsive Behavior

| Breakpoint | Layout                                              |
| ---------- | --------------------------------------------------- |
| ≥1200px    | Full 3-column: sidebar + editor + AI panel          |
| 768-1199px | Sidebar collapses to icons; AI panel overlays        |
| <768px     | Single-column: entry list → entry editor → AI panel  |

On mobile:
- Sidebar becomes a full-screen list view
- Selecting an entry navigates to the editor view
- Back button returns to list
- AI panel is full-screen overlay
- **AI Lorebook Wizard** becomes single-column: configuration form on top, progress panel collapses below (or as a collapsible accordion). Live log scrolls independently.
- **Character Templates Manager** becomes single-column: template cards stack vertically; template editor opens as a full-screen dialog.

---

## 7. Keyboard Shortcuts

| Shortcut         | Action                    |
| ---------------- | ------------------------- |
| `Ctrl+S`         | Save/Export lorebook       |
| `Ctrl+N`         | New entry                  |
| `Ctrl+I`         | Import lorebook            |
| `Ctrl+Shift+N`   | AI Lorebook generator (wizard) |
| `Ctrl+F`         | Focus search in sidebar    |
| `Ctrl+G`         | Toggle AI panel            |
| `Ctrl+.`         | Toggle settings            |
| `Ctrl+Shift+A`   | AI Write (current entry)   |
| `Ctrl+Shift+P`   | Random Personality (append to current entry) |
| `Delete`         | Delete selected entry      |
| `Ctrl+D`         | Duplicate selected entry   |
| `Arrow Up/Down`  | Navigate entries in list   |
| `Escape`         | Close panel / cancel       |

---

## 8. Empty States

| Context            | Message                                          |
| ------------------ | ------------------------------------------------ |
| No lorebook loaded | "Create a new lorebook or import an existing one" |
| No entries         | "Add your first entry to start building your world" |
| No search results  | "No entries match your search"                   |
| AI disconnected    | "Configure an AI endpoint in Settings to enable AI features" |
| No models found    | "No models available at this endpoint"           |
| No character templates | "No templates yet. Create one or import a JSON file to get started" |
| AI lorebook wizard — no templates available | "No character templates available. Import a JSON file or create templates in the Templates manager; random base templates will be used if none are provided" |

---

## 9. Notifications

All feedback uses non-blocking toast notifications (bottom-right, auto-dismiss after 4s):

| Type    | Color   | Examples                              |
| ------- | ------- | ------------------------------------- |
| Success | Green   | "Lorebook saved", "Entry duplicated"  |
| Error   | Red     | "Invalid JSON", "API connection failed" |
| Warning | Yellow  | "Token budget exceeded", "Duplicate keys detected" |
| Info    | Blue    | "Auto-saved", "Model loaded"          |

---

## 10. Animation & Transitions

| Element              | Animation                              |
| -------------------- | -------------------------------------- |
| Sidebar collapse     | 200ms ease-out width transition        |
| AI panel slide-in    | 250ms ease-out from right              |
| Entry selection      | 150ms background fade                  |
| AI text streaming    | Typing cursor with 20ms per token      |
| Toast appearance     | 200ms slide-up + fade-in               |
| Advanced toggle      | 200ms height expand/collapse           |
| Theme switch         | Instant (no animation, avoids flash)   |

---

## 11. Confirmation Dialogs

All destructive actions require explicit confirmation via a modal dialog:

| Action                     | Dialog Title         | Message                                              | Confirm Button |
| -------------------------- | -------------------- | ---------------------------------------------------- | -------------- |
| Delete entry               | Delete Entry?        | "Are you sure you want to delete '{entry.comment}'?" | Red "Delete"   |
| Clear all app data         | Clear All Data?      | "This will remove all settings and draft data."      | Red "Clear"    |
| Reset settings to defaults | Reset Settings?      | "All settings will be restored to their defaults."   | Red "Reset"    |
| Discard AI result          | Discard Result?      | "The generated text will be lost."                   | "Discard"      |
| Navigate away with unsaved | Unsaved Changes      | "You have unsaved changes. Discard them?"            | "Discard"      |
| Delete character template   | Delete Template?     | "Are you sure you want to delete '{template.name}'?" | Red "Delete"   |
| Overwrite templates on import | Templates will be overwritten | "Importing will overwrite N existing template(s) with the same name. Continue?" | "Overwrite" |
| Abort AI lorebook generation | Abort Generation?    | "Stopping now will discard all generated entries. The lorebook will not be created." | "Abort"      |
| Generate AI lorebook with unsaved current lorebook | Replace Current Lorebook? | "Generating a new AI lorebook will replace the currently open lorebook. Unsaved changes will be lost. Continue?" | "Continue"  |

Dialogs use the shadcn/ui `Dialog` component with a backdrop. The destructive action button is visually prominent (danger color). "Cancel" is the default focus.

---

## 12. Loading States

| Context                    | Indicator                                                    |
| -------------------------- | ------------------------------------------------------------ |
| AI connecting/generating   | Streaming text with blinking cursor + "Stop" button          |
| AI lorebook generating    | Right-side progress panel with step checklist, live log, token counter + "Stop" button |
| Lorebook file parsing      | Spinner overlay on main content area (< 1s expected)         |
| Model list fetching        | Inline spinner next to model dropdown + "Loading models..."  |
| Connection test            | Spinner replacing "Test Connection" button text              |
| Initial app load           | Logo + spinner centered on screen (no layout shift)          |
| Auto-save draft            | Subtle "Saving..." text in top bar, replaces with "Saved"    |

---

## 13. Mobile AI Panel

On screens < 768px, the AI assistant panel becomes a full-screen overlay:

```
+----------------------------------+
|  ← Back      AI Assistant  [✕]   |
+----------------------------------+
|                                  |
|  Mode: [Write ▼]                |
|                                  |
|  Context (auto-filled):          |
|  - Entry: "Arasaka Corporation" |
|  - Keys: Arasaka, Arasaka Corp  |
|                                  |
|  Custom instructions:            |
|  [Focus on corporate history___]|
|                                  |
|  [✨ Generate]                   |
|                                  |
|  ── Result ──────────────────── |
|                                  |
|  Arasaka Corporation is a       |
|  Japanese megacorporation...    |
|                                  |
|  [Replace] [Extend] [Abort]     |
|                                  |
+----------------------------------+
```

- Slides up from bottom (250ms ease-out)
- "← Back" returns to entry editor
- On Replace/Extend, panel closes and content populates the editor

---

## 14. Accessibility

- All interactive elements have visible focus rings (2px accent color outline)
- ARIA labels on icon-only buttons
- Keyboard navigation for all entry list and editor actions
- Screen reader announcements for AI generation status
- Color is never the sole indicator (always paired with icon or text)
- Minimum contrast ratio: 4.5:1 for text, 3:1 for interactive elements
- `text-secondary` (`#9499b0` on `#1a1d27` dark, `#5c6078` on `#ffffff` light) meets WCAG AA at both sizes
