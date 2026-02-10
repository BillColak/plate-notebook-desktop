import type { TElement } from "platejs";

import { invoke } from "@tauri-apps/api/core";

export async function createNote(parentId?: string | null): Promise<string> {
  return invoke<string>("create_note", { parentId: parentId ?? null });
}

export async function saveNoteContent(
  noteId: string,
  content: TElement[],
  title: string
): Promise<void> {
  return invoke("save_note_content", {
    noteId,
    content: JSON.stringify(content),
    title,
  });
}

export async function getNotesTree(): Promise<
  {
    id: string;
    title: string;
    parentId: string | null;
    emoji: string | null;
    isFolder: boolean;
    position: number;
  }[]
> {
  return invoke("get_notes_tree");
}

export async function deleteNote(noteId: string): Promise<void> {
  return invoke("delete_note", { noteId });
}

export async function getRecentNotes(): Promise<
  { id: string; title: string; updatedAt: string }[]
> {
  return invoke("get_recent_notes");
}
