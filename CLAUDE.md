# Plate Notebook Desktop

A rich-text note-taking application built with Tauri, React, TypeScript, and Plate.js.

## Project Overview

This is a desktop note-taking application featuring a powerful Plate.js editor with extensive formatting capabilities, file tree navigation, and various specialized views for content organization.

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS v3** - Utility-first styling
- **Plate.js** - Rich text editor framework (Slate.js-based)
- **shadcn/ui** - UI component library
- **Zustand** - State management
- **Radix UI** - Headless UI primitives

### Backend
- **Tauri** - Desktop application framework (Rust)
- **libSQL/Turso** - Embedded database via Tauri IPC

### Key Libraries
- **@platejs/*** - Extensive Plate.js plugin ecosystem for editor features
- **@ai-sdk/react** - AI integration for editor assistance
- **Mermaid** - Diagram rendering
- **KaTeX** - Math equation rendering
- **Lucide React** - Icon library

## Project Structure

```
plate-notebook-desktop/
├── src/
│   ├── app/                           # Application entry point
│   │   ├── main.tsx                   # Vite entry point
│   │   ├── App.tsx                    # Root app component
│   │   ├── App.css                    # App-level styles
│   │   ├── index.css                  # Global styles
│   │   ├── vite-env.d.ts             # Vite type definitions
│   │   └── providers.tsx              # React context providers
│   │
│   ├── features/                      # Feature-based modules
│   │   │
│   │   ├── editor/                    # Plate.js rich text editor
│   │   │   ├── plate-editor.tsx       # Main editor component
│   │   │   ├── plate-types.ts         # Editor type definitions
│   │   │   ├── transforms.ts          # Editor transformations
│   │   │   ├── use-chat.ts            # AI chat integration
│   │   │   ├── split-editor.tsx       # Side-by-side editing
│   │   │   ├── focus-mode.tsx         # Distraction-free mode
│   │   │   │
│   │   │   ├── kits/                  # Plate.js plugin bundles (~60 kits)
│   │   │   │   ├── ai-kit.tsx         # AI assistance features
│   │   │   │   ├── basic-blocks-kit.tsx
│   │   │   │   ├── basic-marks-kit.tsx
│   │   │   │   ├── table-kit.tsx
│   │   │   │   ├── media-kit.tsx
│   │   │   │   ├── math-kit.tsx       # KaTeX math equations
│   │   │   │   ├── code-block-kit.tsx
│   │   │   │   ├── markdown-kit.tsx
│   │   │   │   └── ... (many more)
│   │   │   │
│   │   │   └── nodes/                 # Editor node renderers (~70 nodes)
│   │   │       ├── heading-node.tsx
│   │   │       ├── paragraph-node.tsx
│   │   │       ├── table-node.tsx
│   │   │       ├── code-block-node.tsx
│   │   │       ├── media-image-node.tsx
│   │   │       ├── equation-node.tsx  # Math equation display
│   │   │       ├── mermaid-block.tsx  # Diagram rendering
│   │   │       └── ... (many more)
│   │   │
│   │   ├── toolbar/                   # Editor toolbars
│   │   │   ├── fixed-toolbar.tsx
│   │   │   ├── floating-toolbar.tsx
│   │   │   ├── ai-toolbar-button.tsx
│   │   │   ├── media-toolbar-button.tsx
│   │   │   ├── table-toolbar-button.tsx
│   │   │   └── ... (30+ toolbar components)
│   │   │
│   │   ├── notes/                     # Note management
│   │   │   ├── note-tree.tsx          # File tree sidebar
│   │   │   ├── note-tree-item.tsx
│   │   │   ├── create-note-button.tsx
│   │   │   ├── note-metadata.tsx
│   │   │   ├── related-notes.tsx
│   │   │   ├── move-dialog.tsx
│   │   │   └── rename-dialog.tsx
│   │   │
│   │   ├── navigation/                # App layout & navigation
│   │   │   ├── sidebar-left.tsx
│   │   │   ├── sidebar-right.tsx
│   │   │   ├── breadcrumb-nav.tsx
│   │   │   ├── nav-main.tsx
│   │   │   ├── nav-favorites.tsx
│   │   │   ├── status-bar.tsx
│   │   │   └── outline-panel.tsx
│   │   │
│   │   ├── views/                     # Alternative view modes
│   │   │   ├── graph-view.tsx         # Node graph visualization
│   │   │   ├── kanban-view.tsx        # Kanban board
│   │   │   ├── calendar-view.tsx
│   │   │   ├── flashcard-view.tsx
│   │   │   ├── canvas-view.tsx
│   │   │   ├── analytics-view.tsx
│   │   │   ├── snippet-library.tsx
│   │   │   └── trash-view.tsx
│   │   │
│   │   ├── search/
│   │   │   └── search-dialog.tsx
│   │   │
│   │   ├── tags/
│   │   │   └── tag-panel.tsx
│   │   │
│   │   ├── backlinks/
│   │   │   └── backlinks-panel.tsx
│   │   │
│   │   └── settings/
│   │       ├── settings-dialog.tsx
│   │       └── keyboard-shortcuts-dialog.tsx
│   │
│   ├── components/                    # Shared UI primitives (shadcn/ui ONLY)
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── popover.tsx
│   │       ├── sidebar.tsx
│   │       └── ... (18 shadcn components)
│   │
│   ├── actions/                       # Tauri IPC actions
│   │   ├── notes.ts                   # Note CRUD operations
│   │   ├── folders.ts                 # Folder operations
│   │   ├── tags.ts                    # Tag management
│   │   ├── search.ts                  # Full-text search
│   │   ├── wikilinks.ts               # Wikilink resolution
│   │   └── features.ts                # Feature flags
│   │
│   ├── db/
│   │   └── schema.ts                  # Database schema definitions
│   │
│   ├── hooks/                         # Shared React hooks
│   │   ├── use-debounce.ts
│   │   ├── use-mobile.ts
│   │   ├── use-mounted.ts
│   │   ├── use-is-touch-device.ts
│   │   └── use-upload-file.ts
│   │
│   ├── lib/                           # Shared utilities
│   │   ├── utils.ts                   # General utilities
│   │   ├── store.ts                   # Zustand store
│   │   ├── tauri.ts                   # Tauri helpers
│   │   ├── tree.ts                    # Tree utilities
│   │   ├── templates.ts               # Note templates
│   │   ├── extract.ts                 # Content extraction
│   │   └── uploadthing.ts             # File upload
│   │
│   └── assets/
│       └── react.svg
│
├── src-tauri/                         # Rust backend (Tauri)
│   ├── src/
│   │   └── main.rs                    # Tauri app entry
│   ├── Cargo.toml                     # Rust dependencies
│   └── tauri.conf.json                # Tauri configuration
│
├── index.html                         # HTML entry point
├── package.json                       # Node dependencies & scripts
├── tsconfig.json                      # TypeScript configuration
├── vite.config.ts                     # Vite build configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
├── postcss.config.js                  # PostCSS configuration
└── components.json                    # shadcn/ui configuration
```

## Development

### Prerequisites
- **Node.js** (v18+)
- **Bun** package manager
- **Rust** (latest stable) with cargo
- **Tauri CLI** dependencies for your OS

### Installation

```bash
# Install frontend dependencies
bun install

# Install Tauri CLI (if not already installed)
cargo install tauri-cli
```

### Development Server

```bash
# Start development server with hot reload
bun run tauri dev
```

This runs both the Vite dev server (frontend) and the Tauri app (desktop window).

### Building for Production

```bash
# Build frontend assets
bun run build

# Build desktop application
bun run tauri build
```

Production builds will be output to `src-tauri/target/release/bundle/`.

### Available Scripts

- `bun run dev` - Start Vite dev server only
- `bun run build` - Build frontend for production
- `bun run tauri dev` - Start Tauri development app
- `bun run tauri build` - Build production desktop app

## Key Features

### Rich Text Editing (Plate.js)
- **Formatting**: Bold, italic, underline, strikethrough, code, highlight, superscript, subscript
- **Blocks**: Headings, paragraphs, blockquotes, code blocks, callouts, toggles
- **Lists**: Ordered, unordered, nested, todo lists
- **Tables**: Full table support with merge/split cells, styling
- **Media**: Images, videos, audio, file attachments
- **Advanced**: Math equations (KaTeX), Mermaid diagrams, columns, TOC
- **Collaboration**: Comments, suggestions, discussions
- **AI**: AI-powered text generation and editing assistance

### Navigation & Organization
- **File tree** with folders and nested notes
- **Tags** for categorization
- **Backlinks** to track note relationships
- **Wikilinks** (`[[Note Title]]`) for linking notes
- **Search** with full-text search
- **Breadcrumbs** for navigation context

### Alternative Views
- **Graph view** - Visualize note connections
- **Kanban** - Task board organization
- **Calendar** - Date-based organization
- **Flashcards** - Spaced repetition learning
- **Canvas** - Infinite canvas for visual organization
- **Analytics** - Note statistics and insights

### Editor Modes
- **Focus mode** - Distraction-free writing
- **Split editor** - Side-by-side editing
- **Outline panel** - Document structure navigation

## Import Paths

The codebase uses TypeScript path aliases via `@/`:

- `@/app/*` - Application entry and providers
- `@/features/editor/*` - Editor core, kits, and nodes
- `@/features/toolbar/*` - Editor toolbars
- `@/features/notes/*` - Note management
- `@/features/navigation/*` - App navigation
- `@/features/views/*` - Alternative views
- `@/features/search/*` - Search functionality
- `@/features/tags/*` - Tag management
- `@/features/backlinks/*` - Backlinks
- `@/features/settings/*` - Settings
- `@/components/ui/*` - shadcn/ui primitives
- `@/actions/*` - Tauri IPC actions
- `@/hooks/*` - Shared React hooks
- `@/lib/*` - Shared utilities
- `@/db/*` - Database schemas

## Architecture Patterns

### Feature-Based Organization
Code is organized by feature/domain rather than file type. Each feature directory contains all related components, making it easy to understand and modify a specific feature area.

### Editor Plugin System
The Plate.js editor uses a plugin-based architecture. Each "kit" in `features/editor/kits/` configures one or more Plate plugins, and each "node" in `features/editor/nodes/` defines how a specific content type is rendered.

### Tauri IPC
Frontend communicates with the Rust backend via Tauri's IPC system. Actions in `src/actions/` wrap Tauri commands for type-safe communication.

### State Management
- **Zustand** for global app state (`lib/store.ts`)
- **React Context** for editor state (Plate.js)
- **Tauri State** for persistent data (via IPC)

## Database

The app uses **libSQL** (Turso) as an embedded database accessed via Tauri IPC. Schema is defined in `src/db/schema.ts`. Database operations are exposed through actions in `src/actions/`.

## Styling

- **Tailwind CSS v3** for utility classes
- **CSS Variables** for theming
- **cva** (class-variance-authority) for component variants
- **shadcn/ui** components in `src/components/ui/`

## Testing & Building

### Type Checking
```bash
bun run build  # Runs tsc for type checking
```

### Production Build
The build process:
1. TypeScript compilation (`tsc`)
2. Vite bundling (production assets)
3. Tauri bundling (desktop app with embedded frontend)

## Contributing

When adding new features:
1. Place components in the appropriate feature directory
2. Use existing patterns for imports and exports
3. Follow TypeScript strict mode
4. Use shadcn/ui components from `@/components/ui/`
5. Add Tauri actions in `src/actions/` for backend communication

## Common Tasks

### Adding a New Editor Node
1. Create renderer in `src/features/editor/nodes/my-node.tsx`
2. Create kit in `src/features/editor/kits/my-kit.tsx`
3. Register kit in `src/features/editor/plate-editor.tsx`

### Adding a New View Mode
1. Create view in `src/features/views/my-view.tsx`
2. Add navigation link in `src/features/navigation/nav-main.tsx`
3. Add route handling in `src/app/App.tsx`

### Adding a Tauri Command
1. Add Rust command in `src-tauri/src/main.rs`
2. Add TypeScript action in `src/actions/my-action.ts`
3. Use action in React components

## License

[Add your license here]
