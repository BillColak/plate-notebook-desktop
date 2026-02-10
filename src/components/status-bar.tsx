import {
  BookOpen,
  Download,
  FileText,
  Globe,
  HelpCircle,
  Printer,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getNoteTags } from "@/actions/tags";
import { exportNoteMarkdown } from "@/actions/wikilinks";
import { OutlineToggleButton } from "@/components/outline-panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NoteTagInfo } from "@/db/schema";
import { useAppStore } from "@/lib/store";

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function countSentences(text: string): number {
  if (!text.trim()) return 0;
  const matches = text.match(/[.!?]+/g);
  return matches ? matches.length : 0;
}

export function StatusBar({
  wordCount,
  charCount,
  plainText,
}: {
  wordCount: number;
  charCount: number;
  plainText?: string;
}) {
  const { activeNoteId } = useAppStore();
  const [now, setNow] = useState(new Date());
  const [noteTags, setNoteTags] = useState<NoteTagInfo[]>([]);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Load note tags
  useEffect(() => {
    if (activeNoteId) {
      getNoteTags(activeNoteId).then(setNoteTags);
    } else {
      setNoteTags([]);
    }
  }, [activeNoteId, wordCount]); // re-fetch when content changes (wordCount proxy)

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const sentenceCount = plainText ? countSentences(plainText) : 0;

  const handleExportMarkdown = async () => {
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

  const handleExportPDF = () => {
    // Add print-friendly styles temporarily
    document.body.classList.add("print-export");
    window.print();
    document.body.classList.remove("print-export");
  };

  const handleExportHTML = () => {
    if (!activeNoteId) return;
    const editorEl = document.querySelector("[data-plate-editor]");
    if (!editorEl) return;
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Exported Note</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 720px; margin: 2em auto; padding: 0 1em; line-height: 1.6; color: #1a1a1a; }
  h1 { font-size: 2em; margin-bottom: 0.5em; }
  h2 { font-size: 1.5em; margin-top: 1.5em; }
  h3 { font-size: 1.2em; margin-top: 1.2em; }
  blockquote { border-left: 3px solid #ddd; padding-left: 1em; color: #555; margin: 1em 0; }
  code { background: #f5f5f5; padding: 0.15em 0.3em; border-radius: 3px; }
  pre { background: #f5f5f5; padding: 1em; border-radius: 6px; overflow-x: auto; }
</style>
</head>
<body>
${editorEl.innerHTML}
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `note-${activeNoteId.slice(0, 8)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShortcuts = () => {
    window.dispatchEvent(new CustomEvent("open-shortcuts"));
  };

  return (
    <div className="flex h-7 shrink-0 items-center justify-between border-t bg-background/50 px-4 text-muted-foreground text-xs backdrop-blur">
      <div className="flex items-center gap-3">
        <span>
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
        <span>{charCount} chars</span>
        <span>{sentenceCount} sentences</span>
        <span className="flex items-center gap-0.5">
          <BookOpen className="h-3 w-3" />
          {readingTime} min read
        </span>
        {noteTags.length > 0 && (
          <div className="flex items-center gap-1">
            {noteTags.slice(0, 4).map((tag) => (
              <span
                key={tag.tagId}
                className="rounded bg-accent px-1.5 py-0 text-[10px]"
              >
                #{tag.tagName}
              </span>
            ))}
            {noteTags.length > 4 && (
              <span className="text-[10px] opacity-60">+{noteTags.length - 4}</span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="opacity-60">{formatTime(now)}</span>
        <OutlineToggleButton />
        {activeNoteId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-accent"
                title="Export options"
              >
                <Download className="h-3 w-3" />
                <span>Export</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleExportMarkdown}>
                <FileText className="mr-2 h-3.5 w-3.5" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <Printer className="mr-2 h-3.5 w-3.5" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportHTML}>
                <Globe className="mr-2 h-3.5 w-3.5" />
                Export as HTML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
