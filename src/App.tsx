import type { TElement } from "platejs";
import { useState } from "react";

import { PlateEditor } from "@/components/plate-editor";
import { Providers } from "@/components/providers";
import { SearchDialog } from "@/components/search-dialog";
import { SidebarLeft } from "@/components/sidebar-left";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const defaultValue: TElement[] = [
  {
    type: "h1",
    children: [{ text: "Welcome to Plate Notebook" }],
  },
  {
    type: "p",
    children: [
      {
        text: "Start writing here. This is your Obsidian-like notebook powered by Plate.js and Tauri.",
      },
    ],
  },
];

export default function App() {
  const [activeNoteId] = useState<string | null>(null);

  return (
    <Providers>
      <SidebarProvider>
        <SidebarLeft />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <div className="flex-1 overflow-auto">
              {activeNoteId ? (
                <PlateEditor
                  initialValue={defaultValue}
                  noteId={activeNoteId}
                />
              ) : (
                <PlateEditor
                  initialValue={defaultValue}
                  noteId="scratch"
                />
              )}
            </div>
          </div>
        </SidebarInset>
        <SearchDialog />
      </SidebarProvider>
    </Providers>
  );
}
