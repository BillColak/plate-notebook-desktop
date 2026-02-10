import { FileText, FolderPlus, LayoutTemplate } from "lucide-react";

import { createFolder } from "@/actions/folders";
import { createNoteFromTemplate } from "@/actions/notes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { templates } from "@/lib/templates";
import { refreshSidebar } from "@/lib/store";
import { createNote } from "@/actions/notes";

export function CreateNoteButton({
  onNavigate,
}: {
  onNavigate?: (noteId: string) => void;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-fit px-1.5">
              <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <span className="text-xs">📓</span>
              </div>
              <span className="truncate font-semibold">Notebook</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 rounded-lg"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuItem
              onClick={async () => {
                const id = await createNote();
                onNavigate?.(id);
                refreshSidebar();
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              New Note
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await createFolder("New Folder");
                refreshSidebar();
              }}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <LayoutTemplate className="mr-2 h-4 w-4" />
                From Template...
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56">
                {templates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={async () => {
                      const id = await createNoteFromTemplate(
                        template.name,
                        template.emoji,
                        JSON.stringify(template.content())
                      );
                      onNavigate?.(id);
                      refreshSidebar();
                    }}
                  >
                    <span className="mr-2">{template.emoji}</span>
                    <div className="flex flex-col">
                      <span className="text-sm">{template.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {template.description}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
