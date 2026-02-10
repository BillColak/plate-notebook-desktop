import type { BacklinkItem, GraphData, NoteTitleItem } from "@/db/schema";
import { invoke } from "@/lib/tauri";

export async function syncWikilinks(
  noteId: string,
  targetTitles: string[]
): Promise<void> {
  try {
    await invoke("sync_wikilinks", { noteId, targetTitles });
  } catch {
    console.warn("[dev] syncWikilinks fallback");
  }
}

export async function getBacklinks(noteId: string): Promise<BacklinkItem[]> {
  try {
    return await invoke<BacklinkItem[]>("get_backlinks", { noteId });
  } catch {
    console.warn("[dev] getBacklinks fallback");
    return [];
  }
}

export async function getAllNoteTitles(): Promise<NoteTitleItem[]> {
  try {
    return await invoke<NoteTitleItem[]>("get_all_note_titles");
  } catch {
    console.warn("[dev] getAllNoteTitles fallback");
    return [];
  }
}

export async function findNoteByTitle(title: string): Promise<string | null> {
  try {
    return await invoke<string | null>("find_note_by_title", { title });
  } catch {
    console.warn("[dev] findNoteByTitle fallback");
    return null;
  }
}

export async function getGraphData(): Promise<GraphData> {
  try {
    return await invoke<GraphData>("get_graph_data");
  } catch {
    console.warn("[dev] getGraphData fallback");
    return { nodes: [], edges: [] };
  }
}

export async function getOrCreateDailyNote(date: string): Promise<string> {
  try {
    return await invoke<string>("get_or_create_daily_note", { date });
  } catch {
    console.warn("[dev] getOrCreateDailyNote fallback");
    return `mock-daily-${date}`;
  }
}

export async function exportNoteMarkdown(noteId: string): Promise<string> {
  try {
    return await invoke<string>("export_note_markdown", { noteId });
  } catch {
    console.warn("[dev] exportNoteMarkdown fallback");
    return "";
  }
}
