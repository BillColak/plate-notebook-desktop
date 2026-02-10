import {
  Bookmark,
  Columns2,
  FolderInput,
  Pencil,
  Pin,
  PinOff,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { toggleFavorite, togglePin } from "@/actions/folders";
import { deleteNote } from "@/actions/notes";
import { MoveDialog } from "@/components/move-dialog";
import { RenameDialog } from "@/components/rename-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { TreeNode } from "@/lib/tree";
import { setSplitNote, setBookmark, useAppStore } from "@/lib/store";

export function NoteTreeItem({
  node,
  isActive,
  children,
  onRefresh,
}: {
  node: TreeNode;
  isActive: boolean;
  children: React.ReactNode;
  onRefresh?: () => void;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const { bookmarks } = useAppStore();

  // Find if this note is bookmarked already
  const bookmarkSlot = Object.entries(bookmarks).find(
    ([, noteId]) => noteId === node.id
  )?.[0];

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          <ContextMenuItem onClick={() => setRenameOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setMoveOpen(true)}>
            <FolderInput className="mr-2 h-4 w-4" />
            Move to folder
          </ContextMenuItem>
          {!node.isFolder && (
            <ContextMenuItem onClick={() => setSplitNote(node.id)}>
              <Columns2 className="mr-2 h-4 w-4" />
              Open in Split
            </ContextMenuItem>
          )}
          <ContextMenuItem
            onClick={async () => {
              await toggleFavorite(node.id);
              onRefresh?.();
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
          <ContextMenuItem
            onClick={async () => {
              await togglePin(node.id);
              onRefresh?.();
            }}
          >
            {node.isPinned ? (
              <>
                <PinOff className="mr-2 h-4 w-4" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="mr-2 h-4 w-4" />
                Pin to top
              </>
            )}
          </ContextMenuItem>
          {!node.isFolder && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Bookmark className="mr-2 h-4 w-4" />
                Set as Bookmark
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-36">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((slot) => (
                  <ContextMenuItem
                    key={slot}
                    onClick={() => setBookmark(slot, node.id)}
                  >
                    <span className="mr-2 font-mono text-xs">⌘{slot}</span>
                    Bookmark {slot}
                    {bookmarks[slot] === node.id && (
                      <span className="ml-auto text-primary">✓</span>
                    )}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={async () => {
              await deleteNote(node.id);
              onRefresh?.();
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
        onSuccess={onRefresh}
      />
      <MoveDialog
        noteId={node.id}
        noteTitle={node.title}
        onOpenChange={setMoveOpen}
        open={moveOpen}
        onSuccess={onRefresh}
      />
    </>
  );
}
