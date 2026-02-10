import type { TElement } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useCallback, useEffect, useRef, useTransition } from "react";

import { createNote, saveNoteContent } from "@/actions/notes";
import { syncInlineTags } from "@/actions/tags";
import { syncWikilinks } from "@/actions/wikilinks";
import { EditorKit } from "@/components/editor-kit";
import { SettingsDialog } from "@/components/settings-dialog";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { extractInlineTags, extractPlainText, extractTitle, extractWikilinks } from "@/lib/extract";
import { refreshSidebar } from "@/lib/store";

const DEBOUNCE_MS = 500;

interface PlateEditorProps {
  noteId: string;
  initialValue: TElement[];
  onNavigate?: (noteId: string) => void;
  onWordCountChange?: (words: number, chars: number) => void;
}

export function PlateEditor({
  noteId,
  initialValue,
  onNavigate,
  onWordCountChange,
}: PlateEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    ({ value }: { value: TElement[] }) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        const title = extractTitle(value);
        const plainText = extractPlainText(value);
        const words = plainText
          .split(/\s+/)
          .filter((w) => w.length > 0).length;
        const chars = plainText.length;

        onWordCountChange?.(words, chars);

        // Extract inline tags and wikilinks
        const inlineTags = extractInlineTags(plainText);
        const wikilinks = extractWikilinks(plainText);

        startTransition(async () => {
          await saveNoteContent(noteId, value, title, plainText);
          if (noteId !== "scratch") {
            await syncInlineTags(noteId, inlineTags);
            await syncWikilinks(noteId, wikilinks);
          }
          refreshSidebar();
        });
      }, DEBOUNCE_MS);
    },
    [noteId, onWordCountChange]
  );

  // Cmd+N keyboard shortcut for new note
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        createNote().then((id) => {
          onNavigate?.(id);
          refreshSidebar();
        });
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onNavigate]);

  return (
    <PlateEditorInner
      initialValue={initialValue}
      isPending={isPending}
      onChange={handleChange}
    />
  );
}

function PlateEditorInner({
  initialValue,
  onChange,
  isPending,
}: {
  initialValue: TElement[];
  onChange: (state: { value: TElement[] }) => void;
  isPending: boolean;
}) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue,
  });

  return (
    <Plate editor={editor} onChange={onChange}>
      <EditorContainer>
        <Editor variant="demo" />
      </EditorContainer>

      <div className="fixed right-4 bottom-14 z-50 rounded-md bg-background/80 px-2 py-1 text-muted-foreground text-xs backdrop-blur">
        {isPending ? "Saving..." : "Saved"}
      </div>

      <SettingsDialog />
    </Plate>
  );
}
