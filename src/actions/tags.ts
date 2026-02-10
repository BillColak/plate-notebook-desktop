import { invoke } from "@tauri-apps/api/core";

export async function getAllTags(): Promise<
  { id: string; name: string; color: string | null }[]
> {
  return invoke("get_all_tags");
}

export async function getTagsForNote(
  noteId: string
): Promise<
  {
    tagId: string;
    tagName: string;
    tagColor: string | null;
    source: string;
  }[]
> {
  return invoke("get_tags_for_note", { noteId });
}

export async function addManualTag(
  noteId: string,
  tagName: string
): Promise<void> {
  return invoke("add_manual_tag", { noteId, tagName });
}

export async function removeManualTag(
  noteId: string,
  tagId: string
): Promise<void> {
  return invoke("remove_manual_tag", { noteId, tagId });
}
