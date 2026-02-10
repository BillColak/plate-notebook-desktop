import type { NoteTagInfo, TagInfo } from "@/db/schema";
import { invoke } from "@/lib/tauri";

export async function getAllTags(): Promise<TagInfo[]> {
  try {
    return await invoke<TagInfo[]>("get_all_tags");
  } catch {
    console.warn("[dev] getAllTags fallback");
    return [];
  }
}

export async function getNoteTags(noteId: string): Promise<NoteTagInfo[]> {
  try {
    return await invoke<NoteTagInfo[]>("get_note_tags", { noteId });
  } catch {
    console.warn("[dev] getNoteTags fallback");
    return [];
  }
}

export async function syncInlineTags(
  noteId: string,
  tagNames: string[]
): Promise<void> {
  try {
    await invoke("sync_inline_tags", { noteId, tagNames });
  } catch {
    console.warn("[dev] syncInlineTags fallback");
  }
}

export async function addManualTag(
  noteId: string,
  tagName: string
): Promise<void> {
  try {
    await invoke("add_manual_tag", { noteId, tagName });
  } catch {
    console.warn("[dev] addManualTag fallback");
  }
}

export async function removeTag(
  noteId: string,
  tagId: string
): Promise<void> {
  try {
    await invoke("remove_tag", { noteId, tagId });
  } catch {
    console.warn("[dev] removeTag fallback");
  }
}
