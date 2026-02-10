
import { FolderInput, Pencil, Star, StarOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { toggleFavorite } from "@/actions/folders";
import { deleteNote } from "@/actions/notes";
import { MoveDialog } from "@/components/move-dialog";
import { RenameDialog } from "@/components/rename-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { TreeNode } from "@/lib/tree";

export function NoteTreeItem({
  node,
  isActive,
  children,
}: {
  node: TreeNode;
  isActive: boolean;
  children: React.ReactNode;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => setRenameOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setMoveOpen(true)}>
            <FolderInput className="mr-2 h-4 w-4" />
            Move to folder
          </ContextMenuItem>
          <ContextMenuItem
            onClick={async () => {
              await toggleFavorite(node.id);
            }}
          >
            {node.isFavorite ? (
              <>
                <StarOff className="mr-2 h-4 w-4" />
                Remove from Favorites
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                Add to Favorites
              </>
            )}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={async () => {
              await deleteNote(node.id);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <RenameDialog
        currentTitle={node.title}
        noteId={node.id}
        onOpenChange={setRenameOpen}
        open={renameOpen}
      />
      <MoveDialog
        noteId={node.id}
        noteTitle={node.title}
        onOpenChange={setMoveOpen}
        open={moveOpen}
      />
    </>
  );
}
