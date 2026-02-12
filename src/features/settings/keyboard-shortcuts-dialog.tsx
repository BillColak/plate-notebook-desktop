import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const shortcuts = [
  { keys: ["⌘", "K"], description: "Command palette / Search" },
  { keys: ["⌘", "N"], description: "New note" },
  { keys: ["⌘", "Shift", "F"], description: "Toggle Focus Mode" },
  { keys: ["⌘", "Shift", "O"], description: "Toggle Outline" },
  { keys: ["⌘", "1-9"], description: "Jump to bookmark" },
  { keys: ["Esc"], description: "Exit Focus Mode" },
  { keys: ["⌘", "B"], description: "Bold" },
  { keys: ["⌘", "I"], description: "Italic" },
  { keys: ["⌘", "U"], description: "Underline" },
  { keys: ["⌘", "E"], description: "Code" },
  { keys: ["⌘", "Shift", "S"], description: "Strikethrough" },
  { keys: ["⌘", "Shift", "H"], description: "Highlight" },
  { keys: ["⌘", "Z"], description: "Undo" },
  { keys: ["⌘", "Shift", "Z"], description: "Redo" },
  { keys: ["⌘", "?"], description: "Show shortcuts" },
  { keys: ["/"], description: "Slash command menu" },
  { keys: ["#"], description: "Inline tag" },
  { keys: ["[["], description: "Wikilink" },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-shortcuts", handler);

    const down = (e: KeyboardEvent) => {
      if (e.key === "?" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);

    return () => {
      window.removeEventListener("open-shortcuts", handler);
      document.removeEventListener("keydown", down);
    };
  }, []);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {shortcuts.map((s) => (
            <div
              key={s.description}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <span className="text-muted-foreground">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
