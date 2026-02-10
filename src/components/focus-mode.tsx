import { X } from "lucide-react";
import { useEffect } from "react";

import { useAppStore, toggleFocusMode, setFocusMode } from "@/lib/store";

export function FocusModeOverlay() {
  const { focusMode } = useAppStore();

  // Register Cmd+Shift+F and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+F to toggle
      if (e.key === "F" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        toggleFocusMode();
        return;
      }
      // Escape to exit
      if (e.key === "Escape" && focusMode) {
        e.preventDefault();
        setFocusMode(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusMode]);

  // Apply/remove focus-mode class to body
  useEffect(() => {
    if (focusMode) {
      document.body.classList.add("focus-mode");
    } else {
      document.body.classList.remove("focus-mode");
    }
    return () => {
      document.body.classList.remove("focus-mode");
    };
  }, [focusMode]);

  if (!focusMode) return null;

  return (
    <button
      type="button"
      onClick={() => setFocusMode(false)}
      className="fixed right-4 top-4 z-[100] flex items-center gap-1.5 rounded-lg bg-background/80 px-3 py-1.5 text-muted-foreground text-xs shadow-lg backdrop-blur transition-opacity hover:text-foreground focus-mode-exit"
      title="Exit Focus Mode (Esc)"
    >
      <X className="h-3.5 w-3.5" />
      Exit Focus Mode
    </button>
  );
}
