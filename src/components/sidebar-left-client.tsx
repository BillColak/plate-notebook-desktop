
import { Home, Search, Sparkles, Trash2 } from "lucide-react";

import { CreateNoteButton } from "@/components/create-note-button";
import { NavFavorites } from "@/components/nav-favorites";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NoteTree } from "@/components/note-tree";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { TreeNode } from "@/lib/tree";

const navMain = [
  {
    title: "Search",
    url: "#search",
    icon: Search,
  },
  {
    title: "Ask AI",
    url: "#",
    icon: Sparkles,
  },
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
];

const navSecondary = [
  {
    title: "Trash",
    url: "/trash",
    icon: Trash2,
  },
];

export function SidebarLeftClient({
  tree,
  favorites,
}: {
  tree: TreeNode[];
  favorites: { name: string; url: string; emoji: string }[];
}) {
  return (
    <Sidebar className="border-r-0">
      <SidebarHeader>
        <CreateNoteButton />
        <NavMain items={navMain} />
      </SidebarHeader>
      <SidebarContent>
        {favorites.length > 0 && <NavFavorites favorites={favorites} />}
        <NoteTree tree={tree} />
        <NavSecondary className="mt-auto" items={navSecondary} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
