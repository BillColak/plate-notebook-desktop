import type { TElement } from "platejs";

import type {
  Note,
  NoteTreeItem,
  RecentNote,
} from "@/db/schema";
import { invoke } from "@/lib/tauri";

export async function createNote(parentId?: string | null): Promise<string> {
  try {
    return await invoke<string>("create_note", { parentId: parentId ?? null });
  } catch {
    console.warn("[dev] createNote fallback");
    return `mock-${Date.now()}`;
  }
}

export async function createNoteFromTemplate(
  title: string,
  emoji: string,
  content: string
): Promise<string> {
  try {
    return await invoke<string>("create_note_from_template", {
      title,
      emoji,
      content,
    });
  } catch {
    console.warn("[dev] createNoteFromTemplate fallback");
    return `mock-template-${Date.now()}`;
  }
}

export async function getNote(noteId: string): Promise<Note | null> {
  try {
    return await invoke<Note>("get_note", { noteId });
  } catch {
    console.warn("[dev] getNote fallback");
    return null;
  }
}

export async function saveNoteContent(
  noteId: string,
  content: TElement[],
  title: string,
  plainText: string
): Promise<void> {
  try {
    await invoke("save_note_content", {
      noteId,
      content: JSON.stringify(content),
      title,
      plainText,
    });
  } catch {
    console.warn("[dev] saveNoteContent fallback");
  }
}

export async function getNotesTree(): Promise<NoteTreeItem[]> {
  try {
    return await invoke<NoteTreeItem[]>("get_notes_tree");
  } catch {
    console.warn("[dev] getNotesTree fallback");
    return [];
  }
}

export async function getMostRecentNote(): Promise<Note | null> {
  try {
    return await invoke<Note | null>("get_most_recent_note");
  } catch {
    console.warn("[dev] getMostRecentNote fallback");
    return null;
  }
}

export async function deleteNote(noteId: string): Promise<void> {
  try {
    await invoke("delete_note", { noteId });
  } catch {
    console.warn("[dev] deleteNote fallback");
  }
}

export async function getRecentNotes(limit?: number): Promise<RecentNote[]> {
  try {
    return await invoke<RecentNote[]>("get_recent_notes", { limit: limit ?? 10 });
  } catch {
    console.warn("[dev] getRecentNotes fallback");
    return [];
  }
}
