import { useCallback, useSyncExternalStore } from "react";

import type { NoteTreeItem } from "@/db/schema";

// Simple global state store (no external deps needed)

export type ViewType = "editor" | "trash" | "graph" | "kanban" | "flashcards" | "calendar" | "canvas" | "snippets" | "analytics";

interface AppState {
  activeNoteId: string | null;
  view: ViewType;
  tree: NoteTreeItem[];
  favorites: { name: string; url: string; emoji: string }[];
  sidebarRefreshKey: number;
  theme: "dark" | "light";
  // Focus mode (Zen mode)
  focusMode: boolean;
  // Split editor
  splitNoteId: string | null;
  splitRatio: number; // 0.0 - 1.0
  // Bookmarks (Cmd+1 through Cmd+9)
  bookmarks: Record<number, string>; // slot -> noteId
  // Outline panel
  outlineOpen: boolean;
}

let state: AppState = {
  activeNoteId: null,
  view: "editor",
  tree: [],
  favorites: [],
  sidebarRefreshKey: 0,
  theme:
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "dark", // default to dark
  focusMode: false,
  splitNoteId: null,
  splitRatio: 0.5,
  bookmarks: {},
  outlineOpen: false,
};

const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function setActiveNote(noteId: string | null) {
  state = { ...state, activeNoteId: noteId, view: "editor" };
  emit();
}

export function setView(view: ViewType) {
  state = { ...state, view };
  emit();
}

export function setTree(tree: NoteTreeItem[]) {
  state = { ...state, tree };
  emit();
}

export function setFavorites(
  favorites: { name: string; url: string; emoji: string }[]
) {
  state = { ...state, favorites };
  emit();
}

export function refreshSidebar() {
  state = { ...state, sidebarRefreshKey: state.sidebarRefreshKey + 1 };
  emit();
}

export function toggleTheme() {
  const next = state.theme === "dark" ? "light" : "dark";
  state = { ...state, theme: next };
  document.documentElement.classList.toggle("dark", next === "dark");
  emit();
}

export function setTheme(theme: "dark" | "light") {
  state = { ...state, theme };
  document.documentElement.classList.toggle("dark", theme === "dark");
  emit();
}

// ─── Focus Mode ──────────────────────────────────────────

export function toggleFocusMode() {
  state = { ...state, focusMode: !state.focusMode };
  emit();
}

export function setFocusMode(enabled: boolean) {
  state = { ...state, focusMode: enabled };
  emit();
}

// ─── Split Editor ────────────────────────────────────────

export function setSplitNote(noteId: string | null) {
  state = { ...state, splitNoteId: noteId };
  emit();
}

export function closeSplit() {
  state = { ...state, splitNoteId: null };
  emit();
}

export function setSplitRatio(ratio: number) {
  state = { ...state, splitRatio: Math.max(0.2, Math.min(0.8, ratio)) };
  emit();
}

// ─── Bookmarks ───────────────────────────────────────────

export function setBookmark(slot: number, noteId: string) {
  const bookmarks = { ...state.bookmarks, [slot]: noteId };
  state = { ...state, bookmarks };
  emit();
}

export function removeBookmark(slot: number) {
  const bookmarks = { ...state.bookmarks };
  delete bookmarks[slot];
  state = { ...state, bookmarks };
  emit();
}

export function getBookmark(slot: number): string | null {
  return state.bookmarks[slot] ?? null;
}

// ─── Outline Panel ───────────────────────────────────────

export function toggleOutline() {
  state = { ...state, outlineOpen: !state.outlineOpen };
  emit();
}

export function setOutlineOpen(open: boolean) {
  state = { ...state, outlineOpen: open };
  emit();
}

export function useAppStore(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useNavigate() {
  return useCallback((noteId: string) => {
    setActiveNote(noteId);
  }, []);
}

// Initialize theme on load
if (typeof window !== "undefined") {
  document.documentElement.classList.add("dark");
}
