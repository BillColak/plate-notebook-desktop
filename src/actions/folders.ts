import type { FavoriteNote, TrashedNote } from "@/db/schema";
import { invoke } from "@/lib/tauri";

export async function createFolder(
  name: string,
  parentId?: string | null
): Promise<string> {
  try {
    return await invoke<string>("create_folder", {
      name,
      parentId: parentId ?? null,
    });
  } catch {
    console.warn("[dev] createFolder fallback");
    return `mock-folder-${Date.now()}`;
  }
}

export async function moveNote(
  noteId: string,
  newParentId: string | null
): Promise<void> {
  try {
    await invoke("move_note", { noteId, newParentId });
  } catch {
    console.warn("[dev] moveNote fallback");
  }
}

export async function renameNote(
  noteId: string,
  newTitle: string
): Promise<void> {
  try {
    await invoke("rename_note", { noteId, newTitle });
  } catch {
    console.warn("[dev] renameNote fallback");
  }
}

export async function toggleFavorite(noteId: string): Promise<void> {
  try {
    await invoke("toggle_favorite", { noteId });
  } catch {
    console.warn("[dev] toggleFavorite fallback");
  }
}

export async function togglePin(noteId: string): Promise<void> {
  try {
    await invoke("toggle_pin", { noteId });
  } catch {
    console.warn("[dev] togglePin fallback");
  }
}

export async function getFavoriteNotes(): Promise<FavoriteNote[]> {
  try {
    return await invoke<FavoriteNote[]>("get_favorite_notes");
  } catch {
    console.warn("[dev] getFavoriteNotes fallback");
    return [];
  }
}

export async function getTrashedNotes(): Promise<TrashedNote[]> {
  try {
    return await invoke<TrashedNote[]>("get_trashed_notes");
  } catch {
    console.warn("[dev] getTrashedNotes fallback");
    return [];
  }
}

export async function permanentlyDeleteNote(noteId: string): Promise<void> {
  try {
    await invoke("permanently_delete_note", { noteId });
  } catch {
    console.warn("[dev] permanentlyDeleteNote fallback");
  }
}

export async function restoreNote(noteId: string): Promise<void> {
  try {
    await invoke("restore_note", { noteId });
  } catch {
    console.warn("[dev] restoreNote fallback");
  }
}
