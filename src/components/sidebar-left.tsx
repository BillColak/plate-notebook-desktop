import { useEffect, useState } from "react";

import { getFavoriteNotes } from "@/actions/folders";
import { getNotesTree } from "@/actions/notes";
import { SidebarLeftClient } from "@/components/sidebar-left-client";
import { type TreeNode, buildTree } from "@/lib/tree";

export function SidebarLeft() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [favorites, setFavorites] = useState<
    { name: string; url: string; emoji: string }[]
  >([]);

  useEffect(() => {
    async function load() {
      try {
        const allNotes = await getNotesTree();
        setTree(buildTree(allNotes));

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
    }
    load();
  }, []);

  return <SidebarLeftClient favorites={favorites} tree={tree} />;
}
