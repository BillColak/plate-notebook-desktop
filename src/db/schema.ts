// Type definitions matching the Rust backend structs

export interface Note {
  id: string;
  title: string;
  content?: string | null;
  plainText?: string | null;
  emoji?: string | null;
  parentId?: string | null;
  isFolder?: boolean;
  isFavorite?: boolean;
  isPinned?: boolean;
  isTrashed?: boolean;
  sortOrder?: number;
  createdAt?: number | null;
  updatedAt?: number | null;
  trashedAt?: number | null;
  wordCount?: number;
}

export interface NoteTreeItem {
  id: string;
  title: string;
  parentId: string | null;
  emoji: string | null;
  isFolder: boolean;
  position: number;
  isFavorite: boolean;
  isPinned: boolean;
}

export interface SearchResult {
  id: string;
  noteId: string;
  title: string;
  snippet: string;
}

export interface TagInfo {
  id: string;
  name: string;
  color: string | null;
  noteCount: number;
}

export interface NoteTagInfo {
  tagId: string;
  tagName: string;
  tagColor: string | null;
  source: string;
}

export interface TrashedNote {
  id: string;
  title: string;
  emoji: string | null;
  trashedAt: number | null;
}

export interface BacklinkItem {
  id: string;
  title: string;
  emoji: string | null;
}

export interface GraphNode {
  id: string;
  title: string;
  emoji: string | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  edgeType: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NoteTitleItem {
  id: string;
  title: string;
}

export interface RecentNote {
  id: string;
  title: string;
  emoji: string | null;
  updatedAt: string | null;
}

export interface FavoriteNote {
  id: string;
  title: string;
  emoji: string | null;
}

// ─── Related Notes ───────────────────────────────────────

export interface RelatedNoteItem {
  id: string;
  title: string;
  emoji: string | null;
  score: number;
}

// ─── Flashcards ──────────────────────────────────────────

export interface FlashcardData {
  id: string;
  note_id: string;
  question: string;
  answer: string;
  next_review: number;
  interval: number;
  ease_factor: number;
  repetitions: number;
}

export interface FlashcardStats {
  due_today: number;
  total_cards: number;
  reviewed_today: number;
  streak: number;
}

// ─── Canvas ──────────────────────────────────────────────

export interface CanvasItem {
  id: string;
  note_id: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasConnection {
  id: string;
  from_item_id: string;
  to_item_id: string;
}

export interface CanvasData {
  items: CanvasItem[];
  connections: CanvasConnection[];
}

// ─── Snippets ────────────────────────────────────────────

export interface SnippetData {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string;
  createdAt: number;
}

// ─── Writing Stats ───────────────────────────────────────

export interface WritingStat {
  date: string;
  words_written: number;
  notes_edited: number;
  time_spent_seconds: number;
}

// ─── Calendar ────────────────────────────────────────────

export interface NotesByDateItem {
  id: string;
  title: string;
  emoji: string | null;
  createdAt: number;
  updatedAt: number;
}

// ─── Kanban ──────────────────────────────────────────────

export interface KanbanCard {
  id: string;
  title: string;
  emoji: string | null;
  preview: string;
  updatedAt: number;
  tags: string[];
}
