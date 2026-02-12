# Refactor Plan: LLM-Friendly Project Structure

## Goal
Reorganize from flat `components/` dump (220+ files) into feature-based, descriptive folder structure that LLMs can navigate without reading every file.

## Current Problems
- `src/components/` has 100 files: editor kits, views, dialogs, panels, nav — all flat
- `src/components/ui/` has 121 files: shadcn primitives mixed with Plate node renderers and toolbars
- No grouping by feature/domain
- LLM has to read dozens of files to understand what's where

## Target Structure

```
src/
├── app/                              # App shell & entry point
│   ├── App.tsx                       # Main app component (moved from src/)
│   ├── App.css                       # App styles (moved from src/)
│   ├── main.tsx                      # Vite entry (moved from src/)
│   ├── index.css                     # Global styles (moved from src/)
│   ├── vite-env.d.ts                 # Vite types (moved from src/)
│   └── providers.tsx                 # Context providers
│
├── features/                         # Feature modules (colocated by domain)
│   │
│   ├── editor/                       # Core Plate.js editor
│   │   ├── plate-editor.tsx          # Main editor component
│   │   ├── plate-types.ts            # Editor type definitions
│   │   ├── transforms.ts             # Editor transforms/operations
│   │   ├── use-chat.ts               # AI chat hook for editor
│   │   ├── split-editor.tsx          # Side-by-side editor
│   │   ├── focus-mode.tsx            # Distraction-free writing mode
│   │   │
│   │   ├── kits/                     # Plate plugin configurations (each kit = one plugin bundle)
│   │   │   ├── ai-kit.tsx
│   │   │   ├── align-kit.tsx
│   │   │   ├── align-base-kit.tsx
│   │   │   ├── autoformat-kit.tsx
│   │   │   ├── basic-blocks-kit.tsx
│   │   │   ├── basic-blocks-base-kit.tsx
│   │   │   ├── basic-marks-kit.tsx
│   │   │   ├── basic-marks-base-kit.tsx
│   │   │   ├── basic-nodes-kit.tsx
│   │   │   ├── block-menu-kit.tsx
│   │   │   ├── block-placeholder-kit.tsx
│   │   │   ├── block-selection-kit.tsx
│   │   │   ├── callout-kit.tsx
│   │   │   ├── callout-base-kit.tsx
│   │   │   ├── code-block-kit.tsx
│   │   │   ├── code-block-base-kit.tsx
│   │   │   ├── code-drawing-base-kit.tsx
│   │   │   ├── column-kit.tsx
│   │   │   ├── column-base-kit.tsx
│   │   │   ├── comment-kit.tsx
│   │   │   ├── comment-base-kit.tsx
│   │   │   ├── copilot-kit.tsx
│   │   │   ├── cursor-overlay-kit.tsx
│   │   │   ├── date-kit.tsx
│   │   │   ├── date-base-kit.tsx
│   │   │   ├── discussion-kit.tsx
│   │   │   ├── dnd-kit.tsx
│   │   │   ├── docx-kit.tsx
│   │   │   ├── docx-export-kit.tsx
│   │   │   ├── editor-kit.tsx
│   │   │   ├── editor-base-kit.tsx
│   │   │   ├── emoji-kit.tsx
│   │   │   ├── exit-break-kit.tsx
│   │   │   ├── fixed-toolbar-kit.tsx
│   │   │   ├── floating-toolbar-kit.tsx
│   │   │   ├── font-kit.tsx
│   │   │   ├── font-base-kit.tsx
│   │   │   ├── indent-kit.tsx
│   │   │   ├── indent-base-kit.tsx
│   │   │   ├── line-height-kit.tsx
│   │   │   ├── line-height-base-kit.tsx
│   │   │   ├── link-kit.tsx
│   │   │   ├── link-base-kit.tsx
│   │   │   ├── list-kit.tsx
│   │   │   ├── list-base-kit.tsx
│   │   │   ├── markdown-kit.tsx
│   │   │   ├── math-kit.tsx
│   │   │   ├── math-base-kit.tsx
│   │   │   ├── media-kit.tsx
│   │   │   ├── media-base-kit.tsx
│   │   │   ├── mention-kit.tsx
│   │   │   ├── mention-base-kit.tsx
│   │   │   ├── slash-kit.tsx
│   │   │   ├── suggestion-kit.tsx
│   │   │   ├── suggestion-base-kit.tsx
│   │   │   ├── table-kit.tsx
│   │   │   ├── table-base-kit.tsx
│   │   │   ├── toc-kit.tsx
│   │   │   ├── toc-base-kit.tsx
│   │   │   ├── toggle-kit.tsx
│   │   │   └── toggle-base-kit.tsx
│   │   │
│   │   └── nodes/                    # Plate editor node renderers (visual representations)
│   │       ├── ai-chat-editor.tsx
│   │       ├── ai-menu.tsx
│   │       ├── ai-node.tsx
│   │       ├── blockquote-node.tsx
│   │       ├── blockquote-node-static.tsx
│   │       ├── block-discussion.tsx
│   │       ├── block-draggable.tsx
│   │       ├── block-list.tsx
│   │       ├── block-list-static.tsx
│   │       ├── block-selection.tsx
│   │       ├── block-suggestion.tsx
│   │       ├── callout-node.tsx
│   │       ├── callout-node-static.tsx
│   │       ├── caption.tsx
│   │       ├── code-block-node.tsx
│   │       ├── code-block-node-static.tsx
│   │       ├── code-drawing-node.tsx
│   │       ├── code-drawing-node-static.tsx
│   │       ├── code-node.tsx
│   │       ├── code-node-static.tsx
│   │       ├── column-node.tsx
│   │       ├── column-node-static.tsx
│   │       ├── comment-node.tsx
│   │       ├── comment-node-static.tsx
│   │       ├── comment.tsx
│   │       ├── cursor-overlay.tsx
│   │       ├── date-node.tsx
│   │       ├── date-node-static.tsx
│   │       ├── editor.tsx
│   │       ├── editor-static.tsx
│   │       ├── emoji-node.tsx
│   │       ├── equation-node.tsx
│   │       ├── equation-node-static.tsx
│   │       ├── ghost-text.tsx
│   │       ├── heading-node.tsx
│   │       ├── heading-node-static.tsx
│   │       ├── highlight-node.tsx
│   │       ├── highlight-node-static.tsx
│   │       ├── hr-node.tsx
│   │       ├── hr-node-static.tsx
│   │       ├── inline-combobox.tsx
│   │       ├── kbd-node.tsx
│   │       ├── kbd-node-static.tsx
│   │       ├── link-node.tsx
│   │       ├── link-node-static.tsx
│   │       ├── link-toolbar.tsx
│   │       ├── media-audio-node.tsx
│   │       ├── media-audio-node-static.tsx
│   │       ├── media-embed-node.tsx
│   │       ├── media-file-node.tsx
│   │       ├── media-file-node-static.tsx
│   │       ├── media-image-node.tsx
│   │       ├── media-image-node-static.tsx
│   │       ├── media-placeholder-node.tsx
│   │       ├── media-preview-dialog.tsx
│   │       ├── media-upload-toast.tsx
│   │       ├── media-video-node.tsx
│   │       ├── media-video-node-static.tsx
│   │       ├── mention-node.tsx
│   │       ├── mention-node-static.tsx
│   │       ├── mermaid-block.tsx
│   │       ├── paragraph-node.tsx
│   │       ├── paragraph-node-static.tsx
│   │       ├── resize-handle.tsx
│   │       ├── slash-node.tsx
│   │       ├── suggestion-node.tsx
│   │       ├── suggestion-node-static.tsx
│   │       ├── table-icons.tsx
│   │       ├── table-node.tsx
│   │       ├── table-node-static.tsx
│   │       ├── toc-node.tsx
│   │       ├── toc-node-static.tsx
│   │       ├── toggle-node.tsx
│   │       └── toggle-node-static.tsx
│   │
│   ├── toolbar/                      # Editor toolbars & toolbar buttons
│   │   ├── fixed-toolbar.tsx
│   │   ├── fixed-toolbar-buttons.tsx
│   │   ├── floating-toolbar.tsx
│   │   ├── floating-toolbar-buttons.tsx
│   │   ├── ai-toolbar-button.tsx
│   │   ├── align-toolbar-button.tsx
│   │   ├── comment-toolbar-button.tsx
│   │   ├── emoji-toolbar-button.tsx
│   │   ├── equation-toolbar-button.tsx
│   │   ├── export-toolbar-button.tsx
│   │   ├── font-color-toolbar-button.tsx
│   │   ├── font-size-toolbar-button.tsx
│   │   ├── history-toolbar-button.tsx
│   │   ├── import-toolbar-button.tsx
│   │   ├── indent-toolbar-button.tsx
│   │   ├── insert-toolbar-button.tsx
│   │   ├── line-height-toolbar-button.tsx
│   │   ├── link-toolbar-button.tsx
│   │   ├── list-toolbar-button.tsx
│   │   ├── mark-toolbar-button.tsx
│   │   ├── media-toolbar-button.tsx
│   │   ├── media-toolbar.tsx
│   │   ├── mode-toolbar-button.tsx
│   │   ├── more-toolbar-button.tsx
│   │   ├── suggestion-toolbar-button.tsx
│   │   ├── table-toolbar-button.tsx
│   │   ├── toggle-toolbar-button.tsx
│   │   ├── turn-into-toolbar-button.tsx
│   │   ├── toolbar.tsx               # Base toolbar component
│   │   └── block-context-menu.tsx
│   │
│   ├── notes/                        # Note management
│   │   ├── create-note-button.tsx
│   │   ├── note-tree.tsx             # File tree sidebar
│   │   ├── note-tree-item.tsx        # Individual tree node
│   │   ├── note-metadata.tsx         # Note info panel
│   │   ├── related-notes.tsx         # Related notes panel
│   │   ├── move-dialog.tsx           # Move note dialog
│   │   └── rename-dialog.tsx         # Rename note dialog
│   │
│   ├── navigation/                   # App layout & navigation
│   │   ├── sidebar-left.tsx          # Left sidebar container
│   │   ├── sidebar-left-client.tsx   # Left sidebar client wrapper
│   │   ├── sidebar-right.tsx         # Right sidebar container
│   │   ├── breadcrumb-nav.tsx        # Breadcrumb navigation
│   │   ├── nav-favorites.tsx         # Favorites nav section
│   │   ├── nav-main.tsx              # Main nav section
│   │   ├── nav-secondary.tsx         # Secondary nav section
│   │   ├── nav-user.tsx              # User nav section
│   │   ├── status-bar.tsx            # Bottom status bar
│   │   └── outline-panel.tsx         # Document outline panel
│   │
│   ├── search/                       # Search functionality
│   │   └── search-dialog.tsx
│   │
│   ├── tags/                         # Tag management
│   │   └── tag-panel.tsx
│   │
│   ├── backlinks/                    # Backlinks
│   │   └── backlinks-panel.tsx
│   │
│   ├── settings/                     # App settings
│   │   ├── settings-dialog.tsx
│   │   └── keyboard-shortcuts-dialog.tsx
│   │
│   └── views/                        # Secondary view modes
│       ├── analytics-view.tsx
│       ├── calendar-view.tsx
│       ├── canvas-view.tsx
│       ├── flashcard-view.tsx
│       ├── graph-view.tsx
│       ├── kanban-view.tsx
│       ├── snippet-library.tsx
│       └── trash-view.tsx
│
├── components/                       # Shared UI primitives (shadcn/ui ONLY)
│   └── ui/
│       ├── alert-dialog.tsx
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       └── tooltip.tsx
│
├── actions/                          # Tauri IPC data actions (keep as-is)
│   ├── features.ts
│   ├── folders.ts
│   ├── notes.ts
│   ├── search.ts
│   ├── tags.ts
│   └── wikilinks.ts
│
├── db/                               # Database schema (keep as-is)
│   └── schema.ts
│
├── hooks/                            # Shared hooks (keep as-is)
│   ├── use-debounce.ts
│   ├── use-is-touch-device.ts
│   ├── use-mobile.ts
│   ├── use-mounted.ts
│   └── use-upload-file.ts
│
├── lib/                              # Shared utilities (keep as-is)
│   ├── extract.ts
│   ├── store.ts
│   ├── tauri.ts
│   ├── templates.ts
│   ├── tree.ts
│   ├── uploadthing.ts
│   └── utils.ts
│
└── assets/                           # Static assets (keep as-is)
    └── react.svg
```

## Import Path Updates
All `@/components/` imports must be updated to new paths:
- `@/components/plate-editor` → `@/features/editor/plate-editor`
- `@/components/ui/button` → `@/components/ui/button` (unchanged for shadcn)
- `@/components/ui/heading-node` → `@/features/editor/nodes/heading-node`
- `@/components/ui/fixed-toolbar` → `@/features/toolbar/fixed-toolbar`
- `@/components/sidebar-left` → `@/features/navigation/sidebar-left`
- `@/components/search-dialog` → `@/features/search/search-dialog`
- etc.

## Also update tsconfig paths
The `@/` alias in tsconfig.json/vite.config.ts should point to `src/` (likely already does).

## Post-refactor
- Create CLAUDE.md with project map
- Verify `bun run build` passes
- Verify `cargo check` passes
