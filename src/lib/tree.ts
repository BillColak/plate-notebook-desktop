import type { NoteTreeItem } from "@/db/schema";

export interface TreeNode {
  id: string;
  title: string;
  emoji: string;
  isFolder: boolean;
  isFavorite: boolean;
  isPinned: boolean;
  children: TreeNode[];
}

export function buildTree(notes: NoteTreeItem[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Create nodes
  for (const note of notes) {
    map.set(note.id, {
      id: note.id,
      title: note.title,
      emoji: note.emoji ?? "📝",
      isFolder: note.isFolder ?? false,
      isFavorite: note.isFavorite ?? false,
      isPinned: note.isPinned ?? false,
      children: [],
    });
  }

  // Build tree
  for (const note of notes) {
    const node = map.get(note.id);

    if (!node) {
      continue;
    }

    if (note.parentId && map.has(note.parentId)) {
      map.get(note.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort: pinned first, then folders, then alphabetically
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      if (a.isFolder !== b.isFolder) {
        return a.isFolder ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    });

    for (const node of nodes) {
      sortNodes(node.children);
    }
  };

  sortNodes(roots);

  return roots;
}
