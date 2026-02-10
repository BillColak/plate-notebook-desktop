import {
  CalendarDays,
  Home,
  Network,
  Search,
  Trash2,
} from "lucide-react";

import { getOrCreateDailyNote } from "@/actions/wikilinks";
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
import { useAppStore, setView, setActiveNote, refreshSidebar } from "@/lib/store";

export function SidebarLeftClient({
  tree,
  favorites,
  onNavigate,
}: {
  tree: TreeNode[];
  favorites: { name: string; url: string; emoji: string }[];
  onNavigate: (noteId: string) => void;
}) {
  const { activeNoteId, view } = useAppStore();

  const navMain = [
    {
      title: "Search",
      url: "#search",
      icon: Search,
    },
    {
      title: "Home",
      url: "#home",
      icon: Home,
      isActive: view === "editor",
    },
    {
      title: "Today",
      url: "#today",
      icon: CalendarDays,
    },
    {
      title: "Graph",
      url: "#graph",
      icon: Network,
      isActive: view === "graph",
    },
  ];

  const navSecondary = [
    {
      title: "Trash",
      url: "#trash",
      icon: Trash2,
      isActive: view === "trash",
    },
  ];

  const handleNavClick = async (item: { title: string; url: string }) => {
    if (item.url === "#search") {
      window.dispatchEvent(new CustomEvent("open-search"));
    } else if (item.url === "#home") {
      setView("editor");
    } else if (item.url === "#trash") {
      setView("trash");
    } else if (item.url === "#graph") {
      setView("graph");
    } else if (item.url === "#today") {
      const today = new Date().toISOString().split("T")[0];
      const id = await getOrCreateDailyNote(today!);
      onNavigate(id);
      refreshSidebar();
    }
  };

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader>
        <CreateNoteButton onNavigate={onNavigate} />
        <NavMain items={navMain} onItemClick={handleNavClick} />
      </SidebarHeader>
      <SidebarContent>
        {favorites.length > 0 && (
          <NavFavorites favorites={favorites} onNavigate={onNavigate} />
        )}
        <NoteTree
          tree={tree}
          activeNoteId={activeNoteId}
          onNavigate={onNavigate}
        />
        <NavSecondary
          className="mt-auto"
          items={navSecondary}
          onItemClick={handleNavClick}
        />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
