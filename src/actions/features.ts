import type {
  RelatedNoteItem,
  FlashcardData,
  FlashcardStats,
  CanvasData,
  SnippetData,
  WritingStat,
  NotesByDateItem,
  KanbanCard,
  TagInfo,
} from "@/db/schema";
import { invoke } from "@/lib/tauri";

// ─── Related Notes ───────────────────────────────────────

export async function findRelatedNotes(noteId: string): Promise<RelatedNoteItem[]> {
  try {
    return await invoke<RelatedNoteItem[]>("find_related_notes", { noteId });
  } catch {
    console.warn("[dev] findRelatedNotes fallback");
    return [];
  }
}

// ─── Flashcards ──────────────────────────────────────────

export async function syncFlashcards(
  noteId: string,
  cards: [string, string][]
): Promise<void> {
  try {
    await invoke("sync_flashcards", { noteId, cards });
  } catch {
    console.warn("[dev] syncFlashcards fallback");
  }
}

export async function getDueFlashcards(): Promise<FlashcardData[]> {
  try {
    return await invoke<FlashcardData[]>("get_due_flashcards");
  } catch {
    console.warn("[dev] getDueFlashcards fallback");
    return [];
  }
}

export async function reviewFlashcard(cardId: string, rating: number): Promise<void> {
  try {
    await invoke("review_flashcard", { cardId, rating });
  } catch {
    console.warn("[dev] reviewFlashcard fallback");
  }
}

export async function getFlashcardStats(): Promise<FlashcardStats> {
  try {
    return await invoke<FlashcardStats>("get_flashcard_stats");
  } catch {
    console.warn("[dev] getFlashcardStats fallback");
    return { due_today: 0, total_cards: 0, reviewed_today: 0, streak: 0 };
  }
}

// ─── Canvas ──────────────────────────────────────────────

export async function getCanvasData(): Promise<CanvasData> {
  try {
    return await invoke<CanvasData>("get_canvas_data");
  } catch {
    console.warn("[dev] getCanvasData fallback");
    return { items: [], connections: [] };
  }
}

export async function saveCanvasItem(
  id: string,
  noteId: string | null,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<void> {
  try {
    await invoke("save_canvas_item", { id, noteId, x, y, width, height });
  } catch {
    console.warn("[dev] saveCanvasItem fallback");
  }
}

export async function deleteCanvasItem(id: string): Promise<void> {
  try {
    await invoke("delete_canvas_item", { id });
  } catch {
    console.warn("[dev] deleteCanvasItem fallback");
  }
}

export async function saveCanvasConnection(
  id: string,
  fromItemId: string,
  toItemId: string
): Promise<void> {
  try {
    await invoke("save_canvas_connection", { id, fromItemId, toItemId });
  } catch {
    console.warn("[dev] saveCanvasConnection fallback");
  }
}

export async function deleteCanvasConnection(id: string): Promise<void> {
  try {
    await invoke("delete_canvas_connection", { id });
  } catch {
    console.warn("[dev] deleteCanvasConnection fallback");
  }
}

// ─── Snippets ────────────────────────────────────────────

export async function createSnippet(
  title: string,
  content: string,
  language: string,
  tags: string
): Promise<string> {
  try {
    return await invoke<string>("create_snippet", { title, content, language, tags });
  } catch {
    console.warn("[dev] createSnippet fallback");
    return `mock-snippet-${Date.now()}`;
  }
}

export async function getSnippets(): Promise<SnippetData[]> {
  try {
    return await invoke<SnippetData[]>("get_snippets");
  } catch {
    console.warn("[dev] getSnippets fallback");
    return [];
  }
}

export async function deleteSnippet(id: string): Promise<void> {
  try {
    await invoke("delete_snippet", { id });
  } catch {
    console.warn("[dev] deleteSnippet fallback");
  }
}

export async function searchSnippets(query: string): Promise<SnippetData[]> {
  try {
    return await invoke<SnippetData[]>("search_snippets", { query });
  } catch {
    console.warn("[dev] searchSnippets fallback");
    return [];
  }
}

// ─── Writing Stats ───────────────────────────────────────

export async function recordWritingStat(
  wordsWritten: number,
  notesEdited: number
): Promise<void> {
  try {
    await invoke("record_writing_stat", { wordsWritten, notesEdited });
  } catch {
    console.warn("[dev] recordWritingStat fallback");
  }
}

export async function getWritingStats(days: number): Promise<WritingStat[]> {
  try {
    return await invoke<WritingStat[]>("get_writing_stats", { days });
  } catch {
    console.warn("[dev] getWritingStats fallback");
    return [];
  }
}

// ─── Calendar ────────────────────────────────────────────

export async function getNotesByDateRange(
  startTs: number,
  endTs: number
): Promise<NotesByDateItem[]> {
  try {
    return await invoke<NotesByDateItem[]>("get_notes_by_date_range", { startTs, endTs });
  } catch {
    console.warn("[dev] getNotesByDateRange fallback");
    return [];
  }
}

// ─── Kanban ──────────────────────────────────────────────

export async function getKanbanData(): Promise<KanbanCard[]> {
  try {
    return await invoke<KanbanCard[]>("get_kanban_data");
  } catch {
    console.warn("[dev] getKanbanData fallback");
    return [];
  }
}

export async function moveNoteToTag(
  noteId: string,
  fromTag: string,
  toTag: string
): Promise<void> {
  try {
    await invoke("move_note_to_tag", { noteId, fromTag, toTag });
  } catch {
    console.warn("[dev] moveNoteToTag fallback");
  }
}

// ─── Tags (re-export for convenience) ────────────────────

export async function getAllTags(): Promise<TagInfo[]> {
  try {
    return await invoke<TagInfo[]>("get_all_tags");
  } catch {
    console.warn("[dev] getAllTags fallback");
    return [];
  }
}
