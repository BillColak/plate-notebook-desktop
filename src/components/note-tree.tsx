
import { ChevronRight, Plus } from "lucide-react";

import { createNote } from "@/actions/notes";
import { NoteTreeItem } from "@/components/note-tree-item";
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

function TreeNodeComponent({
  node,
  activeNoteId,
  onNavigate,
}: {
  node: TreeNode;
  activeNoteId: string | null;
  onNavigate?: (noteId: string) => void;
}) {
  if (node.isFolder) {
    return (
      <Collapsible>
        <SidebarMenuItem>
          <NoteTreeItem isActive={false} node={node}>
            <SidebarMenuButton>
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
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  const isActive = node.id === activeNoteId;

  return (
    <SidebarMenuItem>
      <NoteTreeItem isActive={isActive} node={node}>
        <SidebarMenuButton
          isActive={isActive}
          onClick={() => onNavigate?.(node.id)}
        >
          <span>{node.emoji}</span>
          <span className="truncate">{node.title}</span>
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

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Notes</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {tree.map((node) => (
            <TreeNodeComponent
              activeNoteId={activeNoteId ?? null}
              key={node.id}
              node={node}
              onNavigate={onNavigate}
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
