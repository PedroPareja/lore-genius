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
| [Logo] LoreGenius    [Lorebook Name]   [Theme] [Settings]|
+----------+-----------------------------------------------+
|          |                                               |
| SIDEBAR  |              MAIN CONTENT                     |
|          |                                               |
| Entries  |   (changes per view — see below)              |
| List     |                                               |
|          |                                               |
| [Search] |                                               |
| [Filter] |                                               |
| [+ New]  |                                               |
|          |                                               |
+----------+-----------------------------------------------+
```

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
|  [✨ AI Write] [✨ AI Edit] [✨ AI Expand]              |
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
   - Line numbers
   - Character/word/token count display (bottom-right)
   - Approximate token count estimation (based on ~4 chars/token)
   - Markdown preview toggle: switches the textarea to a read-only rendered markdown view; toggle again returns to edit mode. Unsaved edits are preserved across toggles.

4. **AI assist buttons** below content:
   - **AI Write**: Generate content from scratch given the comment/title and keywords as context
   - **AI Edit**: AI rewrites/polishes the current content
   - **AI Expand**: AI adds more detail to existing content
   - Each opens the AI Assistant Panel (see 4.5)

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
|  (Write / Edit / Expand / Chat) |
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
|  [Accept] [Regenerate] [Discard]|
|                                  |
+----------------------------------+
```

**AI Modes**:

| Mode       | Behavior                                                             |
| ---------- | -------------------------------------------------------------------- |
| Write      | Generates content from scratch using entry comment + keys as prompt  |
| Edit       | Takes current content + instruction, returns improved version        |
| Expand     | Takes current content, adds detail while preserving existing text    |
| Chat       | Freeform conversation with AI about the entry; paste result manually |

**Flow**:
1. User clicks an AI button on the entry editor
2. Panel slides in, pre-filled with context from current entry
3. User can add custom instructions (optional)
4. Click Generate → streaming response appears
5. User chooses: Accept (replaces content), Regenerate, or Discard
6. On Accept, content is placed in the editor (still unsaved — user must save explicitly)

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

---

## 7. Keyboard Shortcuts

| Shortcut         | Action                    |
| ---------------- | ------------------------- |
| `Ctrl+S`         | Save/Export lorebook       |
| `Ctrl+N`         | New entry                  |
| `Ctrl+I`         | Import lorebook            |
| `Ctrl+F`         | Focus search in sidebar    |
| `Ctrl+G`         | Toggle AI panel            |
| `Ctrl+.`         | Toggle settings            |
| `Ctrl+Shift+A`   | AI Write (current entry)   |
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

Dialogs use the shadcn/ui `Dialog` component with a backdrop. The destructive action button is visually prominent (danger color). "Cancel" is the default focus.

---

## 12. Loading States

| Context                    | Indicator                                                    |
| -------------------------- | ------------------------------------------------------------ |
| AI connecting/generating   | Streaming text with blinking cursor + "Stop" button          |
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
|  [Accept] [Regenerate] [Discard]|
|                                  |
+----------------------------------+
```

- Slides up from bottom (250ms ease-out)
- "← Back" returns to entry editor
- On Accept, panel closes and content populates the editor

---

## 14. Accessibility

- All interactive elements have visible focus rings (2px accent color outline)
- ARIA labels on icon-only buttons
- Keyboard navigation for all entry list and editor actions
- Screen reader announcements for AI generation status
- Color is never the sole indicator (always paired with icon or text)
- Minimum contrast ratio: 4.5:1 for text, 3:1 for interactive elements
- `text-secondary` (`#9499b0` on `#1a1d27` dark, `#5c6078` on `#ffffff` light) meets WCAG AA at both sizes
