import { Link2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getBacklinks } from "@/actions/wikilinks";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import type { BacklinkItem } from "@/db/schema";

export function BacklinksPanel({
  noteId,
  onNavigate,
}: {
  noteId: string;
  onNavigate?: (noteId: string) => void;
}) {
  const [backlinks, setBacklinks] = useState<BacklinkItem[]>([]);

  useEffect(() => {
    getBacklinks(noteId).then(setBacklinks);
  }, [noteId]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        Backlinks {backlinks.length > 0 && `(${backlinks.length})`}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="space-y-1 px-2">
          {backlinks.length === 0 && (
            <p className="text-muted-foreground text-xs">
              No other notes link to this one yet.
            </p>
          )}
          {backlinks.map((link) => (
            <button
              key={link.id}
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent"
              onClick={() => onNavigate?.(link.id)}
            >
              <Link2 className="h-3 w-3 text-muted-foreground" />
              <span className="mr-1">{link.emoji ?? "📝"}</span>
              <span className="truncate">{link.title}</span>
            </button>
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
