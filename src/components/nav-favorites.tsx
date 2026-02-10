import { MoreHorizontal, StarOff, Trash2 } from "lucide-react";

import { toggleFavorite } from "@/actions/folders";
import { deleteNote } from "@/actions/notes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { refreshSidebar } from "@/lib/store";

export function NavFavorites({
  favorites,
  onNavigate,
}: {
  favorites: {
    name: string;
    url: string;
    emoji: string;
  }[];
  onNavigate?: (noteId: string) => void;
}) {
  const { isMobile } = useSidebar();

  const getNoteId = (url: string) => {
    return url.split("/").at(-1) ?? "";
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarMenu>
        {favorites.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              title={item.name}
              onClick={() => onNavigate?.(getNoteId(item.url))}
            >
              <span>{item.emoji}</span>
              <span>{item.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isMobile ? "end" : "start"}
                className="w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
              >
                <DropdownMenuItem
                  onClick={async () => {
                    await toggleFavorite(getNoteId(item.url));
                    refreshSidebar();
                  }}
                >
                  <StarOff className="text-muted-foreground" />
                  <span>Remove from Favorites</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={async () => {
                    await deleteNote(getNoteId(item.url));
                    refreshSidebar();
                  }}
                >
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
