
import { Folder } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { moveNote } from "@/actions/folders";
import { getNotesTree } from "@/actions/notes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Note } from "@/db/schema";

export function MoveDialog({
  noteId,
  noteTitle,
  open,
  onOpenChange,
}: {
  noteId: string;
  noteTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [folders, setFolders] = useState<Note[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      getNotesTree().then((notes) => {
        setFolders(notes.filter((n) => n.isFolder && n.id !== noteId));
      });
    }
  }, [open, noteId]);

  const handleMove = (parentId: string | null) => {
    startTransition(async () => {
      await moveNote(noteId, parentId);
      onOpenChange(false);
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move &quot;{noteTitle}&quot;</DialogTitle>
          <DialogDescription>Select a destination folder.</DialogDescription>
        </DialogHeader>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          <button
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
            disabled={isPending}
            onClick={() => handleMove(null)}
            type="button"
          >
            <Folder className="h-4 w-4" />
            Root (no folder)
          </button>
          {folders.map((folder) => (
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
              disabled={isPending}
              key={folder.id}
              onClick={() => handleMove(folder.id)}
              type="button"
            >
              <span>{folder.emoji}</span>
              <span className="truncate">{folder.title}</span>
            </button>
          ))}
          {folders.length === 0 && (
            <p className="px-3 py-2 text-muted-foreground text-sm">
              No folders available. Create a folder first.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
