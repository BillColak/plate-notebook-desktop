import { useCallback, useEffect } from "react";

import { getFavoriteNotes } from "@/actions/folders";
import { getNotesTree } from "@/actions/notes";
import { SidebarLeftClient } from "@/components/sidebar-left-client";
import { buildTree } from "@/lib/tree";
import {
  useAppStore,
  setTree,
  setFavorites,
} from "@/lib/store";

export function SidebarLeft({
  onNavigate,
}: {
  onNavigate: (noteId: string) => void;
}) {
  const { sidebarRefreshKey, tree, favorites } = useAppStore();

  const load = useCallback(async () => {
    try {
      const allNotes = await getNotesTree();
      setTree(allNotes);

      const favoriteNotes = await getFavoriteNotes();
      setFavorites(
        favoriteNotes.map((n) => ({
          name: n.title,
          url: `/notes/${n.id}`,
          emoji: n.emoji ?? "📝",
        }))
      );
    } catch {
      // DB not ready yet during dev
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, sidebarRefreshKey]);

  const treeNodes = buildTree(tree);

  return (
    <SidebarLeftClient
      favorites={favorites}
      tree={treeNodes}
      onNavigate={onNavigate}
    />
  );
}
