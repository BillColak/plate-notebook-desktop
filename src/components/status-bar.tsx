import { Download, HelpCircle } from "lucide-react";

import { exportNoteMarkdown } from "@/actions/wikilinks";
import { useAppStore } from "@/lib/store";

export function StatusBar({
  wordCount,
  charCount,
}: {
  wordCount: number;
  charCount: number;
}) {
  const { activeNoteId } = useAppStore();

  const handleExport = async () => {
    if (!activeNoteId) return;
    const markdown = await exportNoteMarkdown(activeNoteId);
    if (!markdown) return;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `note-${activeNoteId.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShortcuts = () => {
    window.dispatchEvent(new CustomEvent("open-shortcuts"));
  };

  return (
    <div className="flex h-7 shrink-0 items-center justify-between border-t bg-background/50 px-4 text-muted-foreground text-xs backdrop-blur">
      <div className="flex items-center gap-4">
        <span>
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
        <span>{charCount} chars</span>
      </div>
      <div className="flex items-center gap-2">
        {activeNoteId && (
          <button
            type="button"
            className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-accent"
            onClick={handleExport}
            title="Export to Markdown"
          >
            <Download className="h-3 w-3" />
            <span>Export</span>
          </button>
        )}
        <button
          type="button"
          className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-accent"
          onClick={handleShortcuts}
          title="Keyboard shortcuts"
        >
          <HelpCircle className="h-3 w-3" />
          <span>Shortcuts</span>
        </button>
      </div>
    </div>
  );
}
