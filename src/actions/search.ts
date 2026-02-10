import { invoke } from "@tauri-apps/api/core";

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
}

export async function searchNotes(query: string): Promise<SearchResult[]> {
  return invoke<SearchResult[]>("search_notes", { query });
}
