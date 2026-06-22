# LoreGenius

A browser-based editor for creating, editing, and managing [SillyTavern](https://github.com/SillyTavern/SillyTavern)-compatible lorebooks, with AI-assisted writing capabilities.

Fully client-side — no backend, no accounts. All data lives in your browser and your exported JSON files.

## Features

- **Full lorebook editor** — all SillyTavern entry fields supported (keys, content, position, role, group, probability, sticky, cooldown, and more)
- **Import/export** — import existing SillyTavern lorebook JSON; export valid files that work in SillyTavern without modification
- **AI-assisted writing** — generate or expand entry content using any OpenAI-compatible endpoint (OpenAI-compatible, LM Studio, Ollama, OpenAI, or custom)
- **Streaming responses** — AI text streams in real-time; replace or extend entry content with the result
- **Token counting** — accurate token estimation using GPT tokenizer with character-heuristic fallback
- **Dark-first UI** — dark theme by default with light mode toggle
- **Keyboard shortcuts** — `Ctrl+N` new entry, `Ctrl+G` AI panel, `Ctrl+D` duplicate, `Ctrl+Shift+A` AI write, and more
- **Responsive layout** — works on desktop and tablet; mobile-friendly sidebar/panel flow

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix primitives) |
| State | Zustand |
| Validation | Zod |
| AI Client | OpenAI SDK (browser-side) |
| Routing | React Router v7 |
| Token Estimation | gpt-tokenizer |
| Icons | Lucide React |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm format

# Production build
pnpm build
```

## Project Structure

```
src/
├── components/
│   ├── ai/          # AI assistant panel, preview dialog, result display
│   ├── editor/      # Entry editor, keyword input, content editor, advanced options
│   ├── layout/      # App shell, sidebar, top bar, theme toggle
│   ├── settings/    # Settings page
│   └── ui/          # shadcn/ui primitives (button, input, dialog, etc.)
├── hooks/           # useKeyboardShortcuts, useAutoSave, useTheme
├── lib/             # Utilities: file I/O, tokenizer, defaults, validation
├── stores/          # Zustand stores: lorebook, editor, settings, AI
├── types/           # TypeScript types: lorebook, AI config, settings
└── styles/          # globals.css (Tailwind + theme tokens)
```

## AI Providers

LoreGenius works with any OpenAI-compatible API:

| Provider | Endpoint | Auth |
|---|---|---|
| OpenAI Compatible | `http://localhost:1234/v1` | None |
| LM Studio | `http://localhost:1234/v1` | None |
| Ollama | `http://localhost:11434/v1` | None |
| OpenAI | `https://api.openai.com/v1` | API key required |
| Custom | User-defined | Optional |

Configure your provider in **Settings**. The app auto-detects available models and tests connectivity before generating.

## Data & Privacy

- No backend server — all processing happens in your browser
- AI API calls go directly from your browser to your configured endpoint
- API keys are stored in `localStorage` and never sent anywhere except the configured endpoint
- Lorebook data is only exported when you explicitly save; auto-save stores drafts in `localStorage`

## Documentation

- [`DESIGN.md`](./DESIGN.md) — UI/UX design document (color system, layouts, interactions)
- [`SPECS.md`](./SPECS.md) — Technical specification (data models, state, AI integration, validation)