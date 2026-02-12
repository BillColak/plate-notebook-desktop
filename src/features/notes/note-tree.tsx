import { ChevronRight, Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { createNote } from "@/actions/notes";
import { moveNote } from "@/actions/folders";
import { NoteTreeItem } from "@/features/notes/note-tree-item";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import type { TreeNode } from "@/lib/tree";
import { refreshSidebar, useAppStore } from "@/lib/store";

function getBookmarkSlot(
  bookmarks: Record<number, string>,
  noteId: string
): number | null {
  for (const [slot, id] of Object.entries(bookmarks)) {
    if (id === noteId) return Number(slot);
  }
  return null;
}

function TreeNodeComponent({
  node,
  activeNoteId,
  onNavigate,
  bookmarks,
}: {
  node: TreeNode;
  activeNoteId: string | null;
  onNavigate?: (noteId: string) => void;
  bookmarks: Record<number, string>;
}) {
  const [dragOver, setDragOver] = useState(false);
  const dragCountRef = useRef(0);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", node.id);
      e.dataTransfer.effectAllowed = "move";
    },
    [node.id]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (node.isFolder) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }
    },
    [node.isFolder]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (node.isFolder) {
        e.preventDefault();
        dragCountRef.current++;
        setDragOver(true);
      }
    },
    [node.isFolder]
  );

  const handleDragLeave = useCallback(() => {
    dragCountRef.current--;
    if (dragCountRef.current <= 0) {
      setDragOver(false);
      dragCountRef.current = 0;
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      dragCountRef.current = 0;
      const droppedId = e.dataTransfer.getData("text/plain");
      if (droppedId && droppedId !== node.id && node.isFolder) {
        await moveNote(droppedId, node.id);
        refreshSidebar();
      }
    },
    [node.id, node.isFolder]
  );

  if (node.isFolder) {
    return (
      <Collapsible>
        <SidebarMenuItem>
          <NoteTreeItem isActive={false} node={node} onRefresh={refreshSidebar}>
            <SidebarMenuButton
              className={dragOver ? "ring-2 ring-primary/50 bg-accent" : ""}
              draggable
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <span>{node.emoji}</span>
              <span className="truncate">{node.title}</span>
            </SidebarMenuButton>
          </NoteTreeItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuAction
              className="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
              showOnHover
            >
              <ChevronRight />
            </SidebarMenuAction>
          </CollapsibleTrigger>
          <SidebarMenuAction
            onClick={async () => {
              const id = await createNote(node.id);
              onNavigate?.(id);
              refreshSidebar();
            }}
            showOnHover
          >
            <Plus />
          </SidebarMenuAction>
          <CollapsibleContent>
            <SidebarMenuSub>
              {node.children.map((child) => (
                <TreeNodeComponent
                  activeNoteId={activeNoteId}
                  key={child.id}
                  node={child}
                  onNavigate={onNavigate}
                  bookmarks={bookmarks}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  const isActive = node.id === activeNoteId;
  const bookmarkSlot = getBookmarkSlot(bookmarks, node.id);

  return (
    <SidebarMenuItem>
      <NoteTreeItem isActive={isActive} node={node} onRefresh={refreshSidebar}>
        <SidebarMenuButton
          isActive={isActive}
          onClick={() => onNavigate?.(node.id)}
          draggable
          onDragStart={handleDragStart}
        >
          {node.isPinned && <span className="text-xs">📌</span>}
          <span>{node.emoji}</span>
          <span className="truncate">{node.title}</span>
          {bookmarkSlot !== null && (
            <span className="ml-auto shrink-0 rounded bg-primary/20 px-1 py-0 text-[10px] font-mono text-primary">
              ⌘{bookmarkSlot}
            </span>
          )}
        </SidebarMenuButton>
      </NoteTreeItem>
    </SidebarMenuItem>
  );
}

export function NoteTree({
  tree,
  activeNoteId,
  onNavigate,
}: {
  tree: TreeNode[];
  activeNoteId?: string | null;
  onNavigate?: (noteId: string) => void;
}) {
  const { bookmarks } = useAppStore();
  const [rootDragOver, setRootDragOver] = useState(false);
  const rootDragCountRef = useRef(0);

  // Allow dropping on root to move to root level
  const handleRootDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleRootDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    rootDragCountRef.current++;
    setRootDragOver(true);
  }, []);

  const handleRootDragLeave = useCallback(() => {
    rootDragCountRef.current--;
    if (rootDragCountRef.current <= 0) {
      setRootDragOver(false);
      rootDragCountRef.current = 0;
    }
  }, []);

  const handleRootDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setRootDragOver(false);
    rootDragCountRef.current = 0;
    const droppedId = e.dataTransfer.getData("text/plain");
    if (droppedId) {
      await moveNote(droppedId, null);
      refreshSidebar();
    }
  }, []);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Notes</SidebarGroupLabel>
      <SidebarGroupContent
        onDragOver={handleRootDragOver}
        onDragEnter={handleRootDragEnter}
        onDragLeave={handleRootDragLeave}
        onDrop={handleRootDrop}
        className={rootDragOver ? "bg-accent/30 rounded" : ""}
      >
        <SidebarMenu>
          {tree.map((node) => (
            <TreeNodeComponent
              activeNoteId={activeNoteId ?? null}
              key={node.id}
              node={node}
              onNavigate={onNavigate}
              bookmarks={bookmarks}
            />
          ))}
          {tree.length === 0 && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-sidebar-foreground/50"
                disabled
              >
                <span>No notes yet</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
