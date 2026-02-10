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
