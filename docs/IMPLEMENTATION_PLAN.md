# Implementation Plan — Phase 4: AI Lorebook Generation & Character Templates

This document is the implementation plan for the Phase 4 features described in `DESIGN.md` (sections 4.7–4.10, 5.2b–5.2d) and `SPECS.md` (sections 4.8–4.10, 5.5–5.6, 6.7–6.8, 8.3, Phase 4 table). It is ordered so that each milestone unlocks the next; no coding has started yet.

The plan is split into **6 milestones (M1–M6)**. Effort estimates follow the SPECS.md scale (S <2h, M 2–6h, L 6–12h). Total: ~2 full days for an experienced developer.

---

## Milestone M1 — Settings: Max Context Size (feature #31)

**Goal**: Add `maxContextSize` to AI configuration and expose it in the Settings page.

**Tasks**:

1. `src/types/ai.ts` — add `maxContextSize: number` to `AIConfig`.
2. `src/stores/settingsStore.ts` — add `maxContextSize: 32768` to `DEFAULT_AI_CONFIG`.
3. `src/components/settings/SettingsPage.tsx`:
   - Add a number input below "Max Tokens" inside the **AI Behavior** section.
   - Props: `min={1024}`, `step={512}`, helper hint showing estimated feasible character count for the agent (lazy formula; the real calculation lands in M5).
   - Wire `onChange` → `updateAIConfig({ maxContextSize })`.
4. Backward-compat: `loadFromStorage()` already does a shallow merge over `DEFAULT_SETTINGS`, but `settings.ai` is replaced wholesale from storage. Add a nested merge so a stored config missing `maxContextSize` falls back to the default (e.g. `ai: { ...DEFAULT_AI_CONFIG, ...stored.ai }`). Verify by loading an old `localStorage["loregenius-settings"]` payload.
5. Update DESIGN.md §4.6 mockup (already done) and SPECS.md §4.5 / §6.8 (already done).

**Verification**: `pnpm typecheck && pnpm lint`. Manual: open Settings, change the value, reload, confirm persisted. Confirm an old settings payload still loads.

**Effort**: S.

---

## Milestone M2 — Random Personality Tool (features #32, #33)

**Goal**: A pure-local, deterministic personality roller usable both from the Entry Editor and the agent runner.

**Tasks**:

1. `src/types/personality.ts` (new) — define `PersonalityBucket`, `PersonalityTrait`, `PersonalityProfile`, and the `PERSONALITY_AREAS` constant (30 entries, see DESIGN.md §4.10). Export from `src/types/index.ts`.
2. `src/lib/personality.ts` (new):
   - Seeded PRNG: implement `mulberry32(hashString(seed))`. If no seed, use `Math.random()` and store the resulting seed so the profile is reproducible on re-roll with the same seed.
   - `bucketFor(value: number): PersonalityBucket` — 7 buckets at 0–14, 15–29, 30–44, 45–55, 56–70, 71–85, 86–100 (note the symmetric "Moderate" middle).
   - `rollPersonality(seed?: string): PersonalityProfile` — one trait per area; value 0–100; deterministic given the seed.
   - `formatPersonality(profile): string` — produces the `[Random Personality] ...` text block shown in DESIGN.md §4.10. Keep formatting stable; the agent parses structure, not prose.
3. `src/components/editor/EntryEditor.tsx`:
   - Add a "Random Personality" button next to the existing "AI Write" button.
   - On click: `const profile = rollPersonality()` → append `formatPersonality(profile)` to the current entry's content (separated from existing content by a blank line; do not overwrite). Call `lorebookStore.updateEntry(uid, { content })`. Leave entry unsaved (so the user can edit/delete).
   - Optional seed input via a tiny popover (gear icon) for reproducibility; default is no seed.
4. `src/hooks/useKeyboardShortcuts.ts` — register `Ctrl+Shift+P` to trigger the Random Personality action on the currently selected entry. (Needs a way to reach the action from anywhere; simplest is a callback registered in `editorStore` — add `onRandomPersonality?: () => void` and let `EntryEditor` set it when mounted. Alternative: a small custom event.)
5. Update DESIGN.md / SPECS.md (already done).

**Verification**: `pnpm typecheck && pnpm lint`. Manual + a quick unit-style check in the console: `rollPersonality("June")` returns the same profile across calls. Default `rollPersonality()` differs between calls.

**Effort**: S–M (core logic is S; the editor wiring + shortcut plumbing is S–M).

---

## Milestone M3 — Character Templates: Model + Store + JSON Spec (features #34, #36)

**Goal**: Persistable character template collection with validated bulk import/export.

**Tasks**:

1. `src/types/templates.ts` (new) — `CharacterTemplate` interface (id, name, data, createdAt, updatedAt). Export from `src/types/index.ts`.
2. `src/lib/templateFile.ts` (new):
   - `zod` schema `templateFileSchema` (first real use of zod in the codebase): `{ schemaVersion: z.literal(1), exportedAt: z.number().optional(), templates: z.array(z.object({ name: z.string().min(1), data: z.string(), createdAt: z.number().optional(), updatedAt: z.number().optional() })) }`.
   - `exportTemplates(templates, filename)` → Blob download `${filename}.json`.
   - `importTemplates(file): Promise<{ templates: Omit<CharacterTemplate, "id">[]; schemaVersion: number }>` → parse, validate, throw `Error` with the first zod issue on failure.
3. `src/stores/templatesStore.ts` (new):
   - State: `templates: CharacterTemplate[]`, `isDirty: boolean`.
   - Actions per SPECS.md §5.5: `loadFromStorage`, `saveToStorage` (key `loregenius-templates`), `addTemplate` (validates unique `name`; generates id via `generateUid()`), `updateTemplate`, `deleteTemplate`, `getTemplate`, `getAll`, `importFromFile` (merge by name → returns `{ added, overwritten }`; sets `isDirty = true`), `exportToFile`, `markClean`.
   - Call `loadFromStorage()` from `App.tsx` on startup (next to settings load).
4. Update `src/stores/index.ts` to export `useTemplatesStore`.
5. Update DESIGN.md / SPECS.md (already done).

**Verification**: `pnpm typecheck && pnpm lint`. Manual via console: add a couple of templates, reload, confirm they survive; export and re-import; feed a malformed file and confirm a helpful error.

**Effort**: M.

---

## Milestone M4 — Character Templates Manager Screen (features #35, #37)

**Goal**: User-facing CRUD screen for templates with the unsaved-data warning.

**Tasks**:

1. `src/components/templates/TemplateEditor.tsx` (new) — a `Dialog`-based form with `Name` (required) and `Data` (multi-line `Textarea`). Validation: non-empty unique name. Save → `templatesStore.addTemplate` or `updateTemplate`; Cancel closes without saving.
2. `src/components/templates/TemplatesManager.tsx` (new):
   - Header with `← Back`, title, `+ New Template`, `Import JSON`, `Export JSON` buttons.
   - **Unsaved-data warning banner** (warning color): visible when `templatesStore.isDirty === true`. Text: "You have unsaved templates. Export them to a JSON file to avoid losing them."
   - List of template cards (name + data preview + `Edit` / `Delete` actions).
   - Delete → confirmation dialog (DESIGN.md §11 "Delete Template?").
   - Import → file picker; on collision, show the "Overwrite / Skip" confirmation before merging. On success/failure show a toast (introduce a minimal toast utility here, since SPECS.md §11 notes there is no global toast today — a tiny `useToast` store + a `<Toaster>` portalled at the app root is fine; reuse it for the agent's completion summary in M6).
   - Export → `templatesStore.exportToFile("character-templates")`.
   - Empty state: per DESIGN.md §8 ("No character templates yet…").
3. `src/components/layout/TopBar.tsx` — add a **Templates** button (icon: `Users` or `IdCard` from lucide) between Export and the theme toggle. On click, set editor view state to "templates" (see routing decision below).
4. Routing: SPECS.md lists React Router v7. Decide between (a) a new route `/templates` and `/ai-lorebook`, or (b) a view-state enum in `editorStore` (`view: "editor" | "settings" | "templates" | "ai-lorebook"`). **Recommended: view-state enum** in `editorStore` (matches the existing settings page pattern which is controller-driven, not router-driven). Add `view` + `setView` to `editorStore`. The TopBar buttons and the ← Back buttons use `setView`.
5. `src/components/layout/AppShell.tsx` — render `TemplatesManager` when `view === "templates"`.
6. Mobile: per DESIGN.md §6, the manager becomes single-column; the template editor opens as a full-screen dialog (the existing `Dialog` already scales).

**Verification**: `pnpm typecheck && pnpm lint`. Manual: create/edit/delete templates; export → reload → import with overwrites; confirm the warning banner appears after edits and disappears after export.

**Effort**: M.

---

## Milestone M5 — AI Lorebook Generator: Agent Runner (features #38, #39, #40, #43, #44)

**Goal**: The headless pipeline that turns an `AILorebookRequest` into a populated lorebook.

**Tasks**:

1. `src/types/agent.ts` (new) — `AILorebookRequest`, `AgentStepStatus`, `AgentStep`, `AgentPlan` (per SPECS.md §4.10). Export from `src/types/index.ts`.
2. `src/stores/agentStore.ts` (new) — state and actions per SPECS.md §5.6. The `start(request)` action constructs an `AbortController`, then calls `runAgent(request, hooks, abortController.signal)` where `hooks` are the store's own setters (`appendLog`, `updateStep`, `setPhase`, etc.). `stop()` calls `abortController.abort()`.
3. `src/lib/agent.ts` (new) — the runner. Outline per SPECS.md §6.7:
   - `buildPlanPrompt(request, templates)` and `runPlan(...)` → one AI call that returns strict JSON. Parse with `JSON.parse` inside a try/catch; on failure, throw `Error("Plan: invalid JSON from model")`. Validate the shape minimally (counts of characters == target, distinct template ids). **Abort check**: before each AI call and after each step, test `signal.aborted`; if aborted, throw a sentinel `AbortError`.
   - Template selection: if `request.templateIds` is provided, use those; else use `templatesStore.getAll()`; else synthesise generic "Random Character N" base templates (a couple of lines of generic data each) so generation never blocks. Each template used at most once; if the target count exceeds available distinct templates, abort with an error surfaced to the user.
   - `runConcepts(plan)` → one batched AI call (or a loop) producing one entry per planned concept. Keywords = `[keyword]`, group `"concepts"`, position `0`, constant `false`.
   - `runUserPersona(plan)` → `key = ["{{user}}"]`, comment `"{{user}}"`, group `"persona"`, constant `true`, position `0`.
   - `runCharacters(plan, request, priorEntries)` → loop; per character:
     1. `const profile = rollPersonality(name)` (seeded by the character's name for reproducibility within a run).
     2. `buildCharacterPrompt(template, role, profile, priorEntries, request)` — instructs the model to write appearance, personality, bio, and motivations & struggles; states that the rolled profile is inspiration and may be overridden, but **template fixed traits prevail over the rolled value**.
     3. Primary keywords: split `name` on whitespace and common punctuation → tokens; filter stopwords (`of`, `the`, `de`, `van`, …) and collapse duplicates; append the planner-supplied `role` term. These become entry `key`.
     4. Create the local entry (don't commit to the lorebook yet; accumulate in memory).
     5. **Context budget** (`maxContextSize`): maintain a running token estimate (`estimateTokens` from `lib/tokenizer.ts`) of `systemPrompt + request.worldIdea + (summarised | full) priorEntries + template.data`. If adding the full prior entries would exceed `maxContextSize - headroom`, summarise prior entries (simple: keep only the most recent 2 full + names of the rest; or ask the model for a one-line summary in a tiny side call — start with the simpler truncation strategy). Update `agentStore.tokensUsed`.
   - **Commit** (`runCommit`): only after **all** steps succeed (or the non-aborting steps complete), call `lorebookStore.createNewLorebook(request.lorebookName)` once, then add entries in order: user → concepts → characters. Select the first entry. **This is the single commit point**; if any step threw before this, nothing is committed.
   - Abort handling: the outer `start()` wraps the runner in try/catch; `AbortError` → `phase = "aborted"` and no commit; other errors → `phase = "error"` and `error` set; no commit either way.
4. Hook `useAutoSave` should treat the freshly created lorebook as clean-to-avoid saving a half-built draft only after a successful commit. Simplest: on success, call `lorebookStore.markClean()` after commit and let normal dirty-tracking take over from there as the user edits.
5. Reuse `aiStore.generate()` for every AI call (it already supports abort, streaming and reasoning capture). For plan-parsing calls we want a **non-streaming** result string; `aiStore.generate()` already returns a `Promise<string>` once the stream completes, so this is fine — just ignore the streaming UI side for the plan step (the wizard's live log can still show the streamed plan text).
6. Update DESIGN.md / SPECS.md (already done).

**Verification**: `pnpm typecheck && pnpm lint`. Manual: invoke the runner from the browser console with a small request (2–3 characters, no concepts) against a configured endpoint; verify the lorebook appears in the editor with the correct entries, keywords, and groups. Verify aborting mid-run leaves no lorebook. Verify a weak model that returns non-JSON for the plan step produces a clean error, not a crash.

**Effort**: L.

---

## Milestone M6 — AI Lorebook Wizard UI + Navigation + Shortcuts (features #41, #42, #45)

**Goal**: The user-facing wizard that drives M5, plus the top-bar entry point.

**Tasks**:

1. `src/components/agent/AgentProgressPanel.tsx` (new) — right-side panel:
   - Step checklist (each `AgentStep` rendered with a status icon: pending `○`, running `●`, done `✓`, aborted `■`, error `✗`).
   - Live log (`agentStore.log` joined by newlines, auto-scroll to bottom).
   - Token counter `Tokens used: X / {maxContextSize}`.
   - `Stop` button → `agentStore.stop()` (with the abort-confirmation dialog per DESIGN.md §11).
2. `src/components/agent/AILorebookWizard.tsx` (new) — left-side configuration form per DESIGN.md §4.8:
   - Required: World idea (textarea), Lorebook name (input), Target number of characters (number, min 1).
   - Optional: Generate concepts? (checkbox, default on), Character templates JSON (file input — parsed on selection via `importTemplates` and shown as a count, NOT committed to the persistent templatesStore; the wizard keeps its own ephemeral list), Extra instructions (textarea).
   - Estimate hint under target count: `Math.floor((maxContextSize - systemPromptTokens - conceptTokens) / perCharacterTokens)` feasible characters. Keep it simple and label it an estimate.
   - `✨ Generate Lorebook` button → builds an `AILorebookRequest` and calls `agentStore.start(request)`.
   - If a lorebook is currently open and dirty, show the "Replace Current Lorebook?" confirmation (DESIGN.md §11) before starting — the runner will overwrite the current lorebook.
   - While running, lock the form and show `AgentProgressPanel`. On `done`, switch `editorStore.view` back to `"editor"` and toast the summary. On `error` / `aborted`, stay on the wizard with the error/log visible.
3. `src/components/layout/TopBar.tsx`:
   - Add an **AI Lorebook** button between `New` and `Import` (icon: `Sparkles` or `Wand2`). On click, `editorStore.setView("ai-lorebook")`.
4. `src/components/layout/AppShell.tsx` — render `AILorebookWizard` when `view === "ai-lorebook"`.
5. `src/hooks/useKeyboardShortcuts.ts`:
   - `Ctrl+Shift+N` → `editorStore.setView("ai-lorebook")`.
   - (`Ctrl+Shift+P` for Random Personality was added in M2.)
6. `src/editorStore.ts` — extend `view` state + `setView`; default `"editor"`. Settings open already uses some path; align it with the `view` enum so settings, templates and the wizard share one switch.
7. Toast utility: if M4 didn't introduce one, introduce it here (small `useToast` store + `<Toaster>`). Use it for "Lorebook created: N characters, M concepts".

**Verification**: `pnpm typecheck && pnpm lint`. Manual end-to-end: click **AI Lorebook**, fill in a world idea (e.g. "a totalitarian theocracy where women are reduced to reproductive vessels"), set 3 characters, import a small templates JSON, generate. Verify the resulting lorebook has the `{{user}}` entry, optional concepts, and 3 character entries with correct keywords (name words + role) and all four content sections, with no template reused. Verify abort leaves no lorebook.

**Effort**: L (wizard UI is L agent; the wiring around it is S).

---

## Cross-cutting concerns

- **Routing decision**: a `view` enum in `editorStore` is recommended over React Router routes to match the existing settings-page pattern and keep the wizard/templates state in memory while navigating away and back. If the project later standardises on React Router, M4/M6 can be refactored without changing the stores.
- **Toast system**: introduced in M4 (needed for import collisions) and reused in M6. Place at `src/components/ui/toast.tsx` + a `useToast` mini-store; stays opt-in for new features and doesn't force refactors of existing inline error displays.
- **No new dependencies**: everything reuses `zod` (already installed, unused until M3), `gpt-tokenizer` (M5 budget calc), Lucide icons, and the existing `aiStore` streaming layer. The agent deliberately avoids OpenAI function-calling/API; "tools" are local helpers embedded in prompt text.
- **Testing**: there is no test runner today. The core pure functions in M2 (`rollPersonality`, `bucketFor`) and M3 (`templateFileSchema` parsing) are the most valuable to unit-test first. If/when Vitest is added, prioritise those; otherwise rely on the console verification steps above.
- **Backward compatibility**: M1 must merge old stored `ai` config with defaults; M3's `schemaVersion: 1` leaves room for forward migrations.

---

## Sequencing summary

| Milestone | Depends on | Features delivered | Effort |
| --------- | ---------- | ------------------ | ------ |
| M1 — Max Context Size | — | #31 | S |
| M2 — Random Personality Tool | — | #32, #33 | S–M |
| M3 — Templates store + JSON spec | — | #34, #36 | M |
| M4 — Templates manager screen | M3 | #35, #37 | M |
| M5 — Agent runner | M1, M2, M3 | #38, #39, #40, #43, #44 | L |
| M6 — Wizard UI + nav + shortcuts | M5, M4 | #41, #42, #45 | L |

M1, M2 and M3 are independent and can be developed in parallel. M4 needs M3. M5 requires M1 (maxContextSize), M2 (personality roller) and M3 (templates). M6 requires M5 and M4.

Recommended order if working solo: **M1 → M2 → M3 → M4 → M5 → M6**.