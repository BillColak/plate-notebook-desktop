import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { findRelatedNotes } from "@/actions/features";
import type { RelatedNoteItem } from "@/db/schema";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

export function RelatedNotesPanel({
  noteId,
  onNavigate,
}: {
  noteId: string;
  onNavigate?: (noteId: string) => void;
}) {
  const [related, setRelated] = useState<RelatedNoteItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!noteId) return;
    setLoading(true);
    const results = await findRelatedNotes(noteId);
    setRelated(results);
    setLoading(false);
  }, [noteId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
        Related Notes
      </SidebarGroupLabel>
      <SidebarGroupContent>
        {loading ? (
          <p className="px-3 py-2 text-xs text-muted-foreground">Analyzing…</p>
        ) : related.length === 0 ? (
          <p className="px-3 py-2 text-xs text-muted-foreground">
            No related notes found
          </p>
        ) : (
          <div className="space-y-0.5 px-1">
            {related.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => onNavigate?.(note.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
              >
                <span className="shrink-0 text-xs">
                  {note.emoji ?? "📝"}
                </span>
                <span className="min-w-0 flex-1 truncate">{note.title}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {note.score}%
                </span>
              </button>
            ))}
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
