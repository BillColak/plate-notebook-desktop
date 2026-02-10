# Plate Notebook Desktop 📓

An Obsidian-like notebook app built with **Tauri v2**, **Vite**, **React**, **Plate.js**, and **SQLite**.

Local-first. No cloud. Your notes, your machine.

![Plate Notebook Desktop](https://img.shields.io/badge/Tauri-v2-blue) ![React](https://img.shields.io/badge/React-19-blue) ![Plate.js](https://img.shields.io/badge/Plate.js-v52-green) ![SQLite](https://img.shields.io/badge/SQLite-FTS5-orange)

## Features

### Rich Text Editor
- **40+ Plate.js plugins** — headings, lists, tables, code blocks, callouts, math, embeds, and more
- **Slash commands** — type `/` for quick element insertion
- **Markdown shortcuts** — `#` for headings, `*` for lists, `>` for quotes
- **AI integration** — built-in AI editing commands (Cmd+J)
- **Auto-save** — debounced saves with visual indicator

### Organization
- **Folder nesting** — organize notes in folders with unlimited depth
- **Favorites** — pin frequently accessed notes
- **Tags** — inline `#tag` extraction + manual tagging
- **Trash** — soft delete with restore and permanent delete

### Search & Discovery
- **Full-text search** (Cmd+K) — SQLite FTS5 with porter stemming
- **Highlighted snippets** — see matching content in search results
- **Recent notes** — quick access when search is empty

### Wikilinks & Graph
- **\[\[Wikilinks\]\]** — link between notes with `[[note title]]` syntax
- **Backlinks panel** — see which notes reference the current one
- **Graph view** — force-directed visualization of note connections

### Daily Notes
- **Today button** — creates or opens today's dated note (YYYY-MM-DD)
- Great for journaling and daily logs

### Desktop Native
- **Tauri v2** — lightweight native app (~10MB vs Electron's 100MB+)
- **SQLite backend** — all data stored locally in a single database file
- **Rust performance** — native-speed database operations
- **Dark/light mode** — theme toggle built in

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Tauri v2 (Rust) |
| Frontend | Vite + React 19 + TypeScript |
| Editor | Plate.js v52 (Slate + React) |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Database | SQLite (rusqlite) + FTS5 |
| Icons | Lucide React |

## Getting Started

### Prerequisites
- [Rust](https://rustup.rs/) (1.70+)
- [Bun](https://bun.sh/) (or Node.js 18+)
- Tauri system dependencies ([see docs](https://v2.tauri.app/start/prerequisites/))

### Install & Run

```bash
# Clone
git clone https://github.com/BillColak/plate-notebook-desktop.git
cd plate-notebook-desktop

# Install frontend deps
bun install

# Run in development (Tauri desktop app)
bun tauri dev

# Or run frontend only (browser, with mock data)
bun run dev
```

### Build

```bash
# Production build
bun tauri build
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Search notes |
| `Cmd+N` | New note |
| `Cmd+Shift+N` | New folder |
| `Cmd+J` | AI commands |
| `Cmd+B` | Bold |
| `Cmd+I` | Italic |
| `Cmd+U` | Underline |
| `/` | Slash command menu |

## Architecture

```
┌──────────────────────────────────────────┐
│           Tauri v2 (Rust)                │
│  ┌────────────────────────────────────┐  │
│  │  SQLite (rusqlite)                 │  │
│  │  ├── notes (content as JSON)       │  │
│  │  ├── tags + note_tags              │  │
│  │  ├── wikilinks                     │  │
│  │  └── notes_fts (FTS5 index)        │  │
│  └────────────────────────────────────┘  │
│  30+ Tauri invoke commands               │
└──────────────────┬───────────────────────┘
                   │ IPC
┌──────────────────┴───────────────────────┐
│        Vite + React 19 (Frontend)        │
│  ┌────────────────────────────────────┐  │
│  │  Plate.js Editor (40+ plugins)     │  │
│  │  Sidebar (note tree, favorites)    │  │
│  │  Search (Cmd+K command palette)    │  │
│  │  Graph View (force-directed)       │  │
│  │  Tag Panel + Backlinks             │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## License

MIT
