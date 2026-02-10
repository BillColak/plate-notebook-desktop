import type { TElement } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { getNote, saveNoteContent } from "@/actions/notes";
import { syncInlineTags } from "@/actions/tags";
import { syncWikilinks } from "@/actions/wikilinks";
import { EditorKit } from "@/components/editor-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import {
  extractInlineTags,
  extractPlainText,
  extractTitle,
  extractWikilinks,
} from "@/lib/extract";
import { useAppStore, closeSplit, setSplitRatio, refreshSidebar } from "@/lib/store";

const DEBOUNCE_MS = 500;

const defaultValue: TElement[] = [
  { type: "p", children: [{ text: "" }] },
];

function SplitEditorPane({ noteId }: { noteId: string }) {
  const [editorValue, setEditorValue] = useState<TElement[]>(defaultValue);
  const [noteTitle, setNoteTitle] = useState("Loading...");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getNote(noteId).then((note) => {
      if (note) {
        setNoteTitle(note.title);
        try {
          const parsed = JSON.parse(note.content ?? "[]");
          setEditorValue(
            Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultValue
          );
        } catch {
          setEditorValue(defaultValue);
        }
      }
    });
  }, [noteId]);

  const handleChange = useCallback(
    ({ value }: { value: TElement[] }) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        const title = extractTitle(value);
        const plainText = extractPlainText(value);
        const inlineTags = extractInlineTags(plainText);
        const wikilinks = extractWikilinks(plainText);

        startTransition(async () => {
          await saveNoteContent(noteId, value, title, plainText);
          await syncInlineTags(noteId, inlineTags);
          await syncWikilinks(noteId, wikilinks);
          refreshSidebar();
        });
      }, DEBOUNCE_MS);
    },
    [noteId]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <span className="truncate text-sm text-muted-foreground">{noteTitle}</span>
        <button
          type="button"
          onClick={closeSplit}
          className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Close split"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <SplitEditorInner
          initialValue={editorValue}
          onChange={handleChange}
          isPending={isPending}
        />
      </div>
    </div>
  );
}

function SplitEditorInner({
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
    </Plate>
  );
}

export function SplitEditorContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { splitNoteId, splitRatio } = useAppStore();
  const dividerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const container = dividerRef.current?.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const ratio = (moveEvent.clientX - rect.left) / rect.width;
      setSplitRatio(ratio);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, []);

  if (!splitNoteId) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full">
      <div style={{ width: `${splitRatio * 100}%` }} className="min-w-0 overflow-auto">
        {children}
      </div>
      <div
        ref={dividerRef}
        className="w-1 cursor-col-resize bg-border transition-colors hover:bg-primary/50"
        onMouseDown={handleMouseDown}
      />
      <div style={{ width: `${(1 - splitRatio) * 100}%` }} className="min-w-0 overflow-hidden border-l">
        <SplitEditorPane noteId={splitNoteId} />
      </div>
    </div>
  );
}
