import { useCallback, useSyncExternalStore } from "react";

import type { NoteTreeItem } from "@/db/schema";

// Simple global state store (no external deps needed)

interface AppState {
  activeNoteId: string | null;
  view: "editor" | "trash" | "graph";
  tree: NoteTreeItem[];
  favorites: { name: string; url: string; emoji: string }[];
  sidebarRefreshKey: number;
  theme: "dark" | "light";
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

export function setView(view: AppState["view"]) {
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
