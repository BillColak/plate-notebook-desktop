import { useState } from "react";

import { renameNote } from "@/actions/folders";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function RenameDialog({
  noteId,
  currentTitle,
  open,
  onOpenChange,
  onSuccess,
}: {
  noteId: string;
  currentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [title, setTitle] = useState(currentTitle);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = title.trim();
    if (!trimmed) return;

    await renameNote(noteId, trimmed);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
          <DialogDescription>Enter a new name for this item.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter name..."
            value={title}
          />
          <DialogFooter className="mt-4">
            <button
              className="rounded-md px-4 py-2 text-muted-foreground text-sm hover:text-foreground"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm hover:bg-primary/90"
              type="submit"
            >
              Rename
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
