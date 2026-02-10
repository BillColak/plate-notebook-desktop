import { invoke } from "@tauri-apps/api/core";

export async function createFolder(name: string): Promise<string> {
  return invoke<string>("create_folder", { name });
}

export async function moveNote(
  noteId: string,
  targetParentId: string | null
): Promise<void> {
  return invoke("move_note", { noteId, targetParentId });
}

export async function renameNote(
  noteId: string,
  title: string
): Promise<void> {
  return invoke("rename_note", { noteId, title });
}

export async function toggleFavorite(noteId: string): Promise<void> {
  return invoke("toggle_favorite", { noteId });
}

export async function getFavoriteNotes(): Promise<
  { id: string; title: string; emoji: string | null }[]
> {
  return invoke("get_favorite_notes");
}

export async function permanentlyDeleteNote(noteId: string): Promise<void> {
  return invoke("permanently_delete_note", { noteId });
}

export async function restoreNote(noteId: string): Promise<void> {
  return invoke("restore_note", { noteId });
}
