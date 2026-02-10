import { Moon, Sun } from "lucide-react";

import { BacklinksPanel } from "@/components/backlinks-panel";
import { NoteMetadata } from "@/components/note-metadata";
import { RelatedNotesPanel } from "@/components/related-notes";
import { TagPanel } from "@/components/tag-panel";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAppStore, toggleTheme } from "@/lib/store";

export function SidebarRight({
  noteId,
  createdAt,
  updatedAt,
  wordCount,
  onNavigate,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  noteId?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  wordCount?: number;
  onNavigate?: (noteId: string) => void;
}) {
  const { theme } = useAppStore();

  return (
    <Sidebar
      className="sticky top-0 hidden h-svh border-l lg:flex"
      collapsible="none"
      {...props}
    >
      <SidebarHeader className="flex h-12 flex-row items-center justify-between border-sidebar-border border-b px-4">
        <span className="font-medium text-sm">Details</span>
        <button
          type="button"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </SidebarHeader>
      <SidebarContent>
        {noteId && (
          <>
            <TagPanel noteId={noteId} />
            <SidebarSeparator className="mx-0" />
            <BacklinksPanel noteId={noteId} onNavigate={onNavigate} />
            <SidebarSeparator className="mx-0" />
            <NoteMetadata
              createdAt={createdAt ?? null}
              updatedAt={updatedAt ?? null}
              wordCount={wordCount ?? 0}
            />
            <SidebarSeparator className="mx-0" />
            <RelatedNotesPanel noteId={noteId} onNavigate={onNavigate} />
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
