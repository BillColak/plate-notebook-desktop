
import { Calendar, Clock, FileText } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

function formatDate(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function NoteMetadata({
  createdAt,
  updatedAt,
  wordCount,
}: {
  createdAt: Date | null;
  updatedAt: Date | null;
  wordCount: number;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Metadata</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="space-y-2 px-2 text-muted-foreground text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>Created: {formatDate(createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>Modified: {formatDate(updatedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            <span>
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
