import { ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { useAppStore } from "@/lib/store";

interface BreadcrumbSegment {
  id: string;
  title: string;
  emoji: string;
  isFolder: boolean;
}

export function BreadcrumbNav({
  noteId,
  onNavigate,
}: {
  noteId: string | null;
  onNavigate?: (noteId: string) => void;
}) {
  const { tree } = useAppStore();

  const breadcrumbs = useMemo(() => {
    if (!noteId || tree.length === 0) return [];

    // Build a lookup map
    const itemMap = new Map(tree.map((n) => [n.id, n]));
    const segments: BreadcrumbSegment[] = [];

    // Find the current note
    const current = itemMap.get(noteId);
    if (!current) return [];

    // Walk up the tree
    let parentId = current.parentId;
    while (parentId) {
      const parent = itemMap.get(parentId);
      if (!parent) break;
      segments.unshift({
        id: parent.id,
        title: parent.title,
        emoji: parent.emoji ?? "📁",
        isFolder: parent.isFolder,
      });
      parentId = parent.parentId;
    }

    // Add current note
    segments.push({
      id: current.id,
      title: current.title,
      emoji: current.emoji ?? "📝",
      isFolder: current.isFolder,
    });

    return segments;
  }, [noteId, tree]);

  if (breadcrumbs.length <= 1) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b px-4 py-1.5 text-xs text-muted-foreground">
      {breadcrumbs.map((segment, i) => {
        const isLast = i === breadcrumbs.length - 1;
        return (
          <div key={segment.id} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />}
            {isLast ? (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <span>{segment.emoji}</span>
                <span className="truncate max-w-[150px]">{segment.title}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  // Navigate to the folder's first child note, or to the folder itself
                  onNavigate?.(segment.id);
                }}
                className="flex items-center gap-1 rounded px-1 py-0.5 hover:bg-accent hover:text-foreground"
              >
                <span>{segment.emoji}</span>
                <span className="truncate max-w-[120px]">{segment.title}</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
