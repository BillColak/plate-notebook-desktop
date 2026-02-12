import { RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { getTrashedNotes, permanentlyDeleteNote, restoreNote } from "@/actions/folders";
import type { TrashedNote } from "@/db/schema";
import { refreshSidebar } from "@/lib/store";

export function TrashView() {
  const [notes, setNotes] = useState<TrashedNote[]>([]);
  const [isPending, startTransition] = useTransition();

  const load = () => {
    getTrashedNotes().then(setNotes);
  };

  useEffect(() => {
    load();
  }, []);

  if (notes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-16 text-muted-foreground">
        <Trash2 className="mb-4 h-12 w-12" />
        <p className="text-lg">Trash is empty</p>
        <p className="text-sm">Deleted notes will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 font-bold text-2xl">Trash</h1>
      <div className="space-y-2">
        {notes.map((note) => (
          <div
            className="flex items-center justify-between rounded-lg border px-4 py-3"
            key={note.id}
          >
            <div className="flex items-center gap-3">
              <span>{note.emoji ?? "📝"}</span>
              <div>
                <p className="font-medium">{note.title}</p>
                <p className="text-muted-foreground text-xs">
                  Deleted{" "}
                  {note.trashedAt
                    ? new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(note.trashedAt * 1000))
                    : "unknown"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await restoreNote(note.id);
                    load();
                    refreshSidebar();
                  });
                }}
                title="Restore"
                type="button"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await permanentlyDeleteNote(note.id);
                    load();
                  });
                }}
                title="Delete permanently"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
