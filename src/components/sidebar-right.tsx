import { NavUser } from "@/components/nav-user";
import { NoteMetadata } from "@/components/note-metadata";
import { TagPanel } from "@/components/tag-panel";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const userData = {
  name: "User",
  email: "user@notebook.local",
  avatar: "",
};

export function SidebarRight({
  noteId,
  createdAt,
  updatedAt,
  wordCount,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  noteId?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  wordCount?: number;
}) {
  return (
    <Sidebar
      className="sticky top-0 hidden h-svh border-l lg:flex"
      collapsible="none"
      {...props}
    >
      <SidebarHeader className="h-16 border-sidebar-border border-b">
        <NavUser user={userData} />
      </SidebarHeader>
      <SidebarContent>
        {noteId && (
          <>
            <TagPanel noteId={noteId} />
            <SidebarSeparator className="mx-0" />
            <NoteMetadata
              createdAt={createdAt ?? null}
              updatedAt={updatedAt ?? null}
              wordCount={wordCount ?? 0}
            />
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
