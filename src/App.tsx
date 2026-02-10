import type { TElement } from "platejs";
import { useCallback, useEffect, useState } from "react";

import { getNote, getMostRecentNote } from "@/actions/notes";
import { AnalyticsView } from "@/components/analytics-view";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { CalendarView } from "@/components/calendar-view";
import { CanvasView } from "@/components/canvas-view";
import { FlashcardView } from "@/components/flashcard-view";
import { FocusModeOverlay } from "@/components/focus-mode";
import { GraphView } from "@/components/graph-view";
import { KanbanView } from "@/components/kanban-view";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { OutlinePanel } from "@/components/outline-panel";
import { PlateEditor } from "@/components/plate-editor";
import { Providers } from "@/components/providers";
import { SearchDialog } from "@/components/search-dialog";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import { SnippetLibrary } from "@/components/snippet-library";
import { SplitEditorContainer } from "@/components/split-editor";
import { StatusBar } from "@/components/status-bar";
import { TrashView } from "@/components/trash-view";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Note } from "@/db/schema";
import { extractPlainText } from "@/lib/extract";
import {
  useAppStore,
  setActiveNote,
  setView,
  getBookmark,
} from "@/lib/store";

const defaultValue: TElement[] = [
  {
    type: "h1",
    children: [{ text: "Welcome to Plate Notebook" }],
  },
  {
    type: "p",
    children: [
      {
        text: "Start writing here. This is your Obsidian-like notebook powered by Plate.js and Tauri.",
      },
    ],
  },
];

export default function App() {
  const { activeNoteId, view, focusMode } = useAppStore();
  const [noteData, setNoteData] = useState<Note | null>(null);
  const [editorValue, setEditorValue] = useState<TElement[]>(defaultValue);
  const [currentEditorValue, setCurrentEditorValue] = useState<TElement[]>(defaultValue);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [plainText, setPlainText] = useState("");

  // Load initial note
  useEffect(() => {
    getMostRecentNote().then((note) => {
      if (note) {
        setActiveNote(note.id);
      }
    });
  }, []);

  // Load note data when active note changes
  useEffect(() => {
    if (!activeNoteId) {
      setNoteData(null);
      setEditorValue(defaultValue);
      setCurrentEditorValue(defaultValue);
      return;
    }

    getNote(activeNoteId).then((note) => {
      if (note) {
        setNoteData(note);
        try {
          const parsed = JSON.parse(note.content ?? "[]");
          const value =
            Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultValue;
          setEditorValue(value);
          setCurrentEditorValue(value);
        } catch {
          setEditorValue(defaultValue);
          setCurrentEditorValue(defaultValue);
        }
        setWordCount(note.wordCount ?? 0);
        setPlainText(note.plainText ?? "");
      }
    });
  }, [activeNoteId]);

  // Bookmark keyboard shortcuts (Cmd+1 through Cmd+9)
  useEffect(() => {
    const handleBookmarkKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 9) {
          const noteId = getBookmark(num);
          if (noteId) {
            e.preventDefault();
            setActiveNote(noteId);
            setView("editor");
          }
        }
      }
    };
    document.addEventListener("keydown", handleBookmarkKeys);
    return () => document.removeEventListener("keydown", handleBookmarkKeys);
  }, []);

  const handleNavigate = useCallback((noteId: string) => {
    setActiveNote(noteId);
    setView("editor");
  }, []);

  const handleWordCountChange = useCallback(
    (words: number, chars: number) => {
      setWordCount(words);
      setCharCount(chars);
    },
    []
  );

  const handleEditorValueChange = useCallback(
    (value: TElement[]) => {
      setCurrentEditorValue(value);
      const text = extractPlainText(value);
      setPlainText(text);
    },
    []
  );

  return (
    <Providers>
      <SidebarProvider>
        {!focusMode && <SidebarLeft onNavigate={handleNavigate} />}
        <SidebarInset>
          <div className={`flex h-screen flex-col ${focusMode ? "focus-mode-editor" : ""}`}>
            {!focusMode && view === "editor" && (
              <BreadcrumbNav
                noteId={activeNoteId}
                onNavigate={handleNavigate}
              />
            )}
            <div className="flex-1 overflow-auto">
              {view === "trash" && !focusMode && <TrashView />}
              {view === "graph" && !focusMode && (
                <GraphView onNavigate={handleNavigate} />
              )}
              {view === "kanban" && !focusMode && (
                <KanbanView onNavigate={handleNavigate} />
              )}
              {view === "flashcards" && !focusMode && <FlashcardView />}
              {view === "calendar" && !focusMode && (
                <CalendarView onNavigate={handleNavigate} />
              )}
              {view === "canvas" && !focusMode && (
                <CanvasView onNavigate={handleNavigate} />
              )}
              {view === "snippets" && !focusMode && <SnippetLibrary />}
              {view === "analytics" && !focusMode && <AnalyticsView />}
              {(view === "editor" || focusMode) && (
                <SplitEditorContainer>
                  <PlateEditor
                    key={activeNoteId ?? "scratch"}
                    initialValue={editorValue}
                    noteId={activeNoteId ?? "scratch"}
                    onNavigate={handleNavigate}
                    onWordCountChange={handleWordCountChange}
                    onEditorValueChange={handleEditorValueChange}
                  />
                </SplitEditorContainer>
              )}
            </div>
            {!focusMode && (
              <StatusBar
                wordCount={wordCount}
                charCount={charCount}
                plainText={plainText}
              />
            )}
          </div>
        </SidebarInset>
        {!focusMode && (
          <SidebarRight
            noteId={activeNoteId ?? undefined}
            createdAt={
              noteData?.createdAt ? new Date(noteData.createdAt * 1000) : null
            }
            updatedAt={
              noteData?.updatedAt ? new Date(noteData.updatedAt * 1000) : null
            }
            wordCount={wordCount}
            onNavigate={handleNavigate}
          />
        )}
        <SearchDialog onNavigate={handleNavigate} />
        <KeyboardShortcutsDialog />
        <FocusModeOverlay />
        {view === "editor" && !focusMode && (
          <OutlinePanel editorValue={currentEditorValue} />
        )}
      </SidebarProvider>
    </Providers>
  );
}
