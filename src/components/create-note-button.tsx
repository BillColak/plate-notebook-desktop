
import { FileText, FolderPlus } from "lucide-react";

import { createFolder } from "@/actions/folders";
import { createNote } from "@/actions/notes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function CreateNoteButton() {
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
                await createNote();
                // TODO: navigate to new note
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              New Note
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await createFolder("New Folder");
              }}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
