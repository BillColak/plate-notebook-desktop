import type { TElement } from "platejs";
import { useCallback, useEffect, useState } from "react";

import { getNote, getMostRecentNote } from "@/actions/notes";
import { GraphView } from "@/components/graph-view";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { PlateEditor } from "@/components/plate-editor";
import { Providers } from "@/components/providers";
import { SearchDialog } from "@/components/search-dialog";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarRight } from "@/components/sidebar-right";
import { StatusBar } from "@/components/status-bar";
import { TrashView } from "@/components/trash-view";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Note } from "@/db/schema";
import { useAppStore, setActiveNote, setView } from "@/lib/store";

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
  const { activeNoteId, view } = useAppStore();
  const [noteData, setNoteData] = useState<Note | null>(null);
  const [editorValue, setEditorValue] = useState<TElement[]>(defaultValue);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

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
      return;
    }

    getNote(activeNoteId).then((note) => {
      if (note) {
        setNoteData(note);
        try {
          const parsed = JSON.parse(note.content ?? "[]");
          setEditorValue(
            Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultValue
          );
        } catch {
          setEditorValue(defaultValue);
        }
        setWordCount(note.wordCount ?? 0);
      }
    });
  }, [activeNoteId]);

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

  return (
    <Providers>
      <SidebarProvider>
        <SidebarLeft onNavigate={handleNavigate} />
        <SidebarInset>
          <div className="flex h-screen flex-col">
            <div className="flex-1 overflow-auto">
              {view === "trash" && <TrashView />}
              {view === "graph" && <GraphView onNavigate={handleNavigate} />}
              {view === "editor" && (
                <PlateEditor
                  key={activeNoteId ?? "scratch"}
                  initialValue={editorValue}
                  noteId={activeNoteId ?? "scratch"}
                  onNavigate={handleNavigate}
                  onWordCountChange={handleWordCountChange}
                />
              )}
            </div>
            <StatusBar wordCount={wordCount} charCount={charCount} />
          </div>
        </SidebarInset>
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
        <SearchDialog onNavigate={handleNavigate} />
        <KeyboardShortcutsDialog />
      </SidebarProvider>
    </Providers>
  );
}
