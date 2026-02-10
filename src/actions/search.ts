import type { SearchResult } from "@/db/schema";
import { invoke } from "@/lib/tauri";

export async function searchNotes(query: string): Promise<SearchResult[]> {
  try {
    return await invoke<SearchResult[]>("search_notes", { query });
  } catch {
    console.warn("[dev] searchNotes fallback");
    return [];
  }
}
