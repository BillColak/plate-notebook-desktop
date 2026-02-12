import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";

import { getKanbanData, getAllTags, moveNoteToTag } from "@/actions/features";
import type { KanbanCard, TagInfo } from "@/db/schema";

interface KanbanColumn {
  tag: TagInfo;
  cards: KanbanCard[];
}

export function KanbanView({
  onNavigate,
}: {
  onNavigate?: (noteId: string) => void;
}) {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const dragCard = useRef<{ noteId: string; fromTag: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [tags, cards] = await Promise.all([getAllTags(), getKanbanData()]);

    const cols: KanbanColumn[] = tags
      .filter((t) => t.noteCount > 0)
      .map((tag) => ({
        tag,
        cards: cards.filter((c) => c.tags.includes(tag.name)),
      }));

    // Add "Untagged" column for notes without tags
    const taggedIds = new Set(cards.filter((c) => c.tags.length > 0).map((c) => c.id));
    const untagged = cards.filter((c) => !taggedIds.has(c.id));
    // Only show untagged if there are any — but since getKanbanData only returns tagged notes, skip

    setColumns(cols);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDragStart = (noteId: string, fromTag: string) => {
    dragCard.current = { noteId, fromTag };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (toTag: string) => {
    if (!dragCard.current) return;
    const { noteId, fromTag } = dragCard.current;
    if (fromTag === toTag) return;

    await moveNoteToTag(noteId, fromTag, toTag);
    dragCard.current = null;
    load();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading kanban…
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-lg font-medium">No tagged notes yet</p>
        <p className="text-sm">Add tags to your notes to see them as a kanban board</p>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4">
      {columns.map((col) => (
        <div
          key={col.tag.id}
          className="flex w-72 min-w-72 flex-col rounded-lg border border-border bg-muted/20"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(col.tag.name)}
        >
          {/* Column header */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: col.tag.color ?? "#6366f1" }}
            />
            <span className="font-medium text-sm truncate">{col.tag.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {col.cards.length}
            </span>
          </div>

          {/* Cards */}
          <div className="flex-1 space-y-2 overflow-y-auto p-2">
            {col.cards.map((card) => (
              <div
                key={`${col.tag.id}-${card.id}`}
                draggable
                onDragStart={() => handleDragStart(card.id, col.tag.name)}
                onClick={() => onNavigate?.(card.id)}
                className="group cursor-pointer rounded-md border border-border bg-background p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/30 active:scale-[0.98]"
              >
                <div className="flex items-start gap-2">
                  <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {card.emoji && <span className="text-sm">{card.emoji}</span>}
                      <span className="font-medium text-sm truncate">
                        {card.title}
                      </span>
                    </div>
                    {card.preview && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {card.preview}
                      </p>
                    )}
                    <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                      {new Date(card.updatedAt * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
