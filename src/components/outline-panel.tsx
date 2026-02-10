import { List, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAppStore, toggleOutline, setOutlineOpen } from "@/lib/store";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
  index: number;
}

function extractHeadings(value: unknown[]): HeadingItem[] {
  const headings: HeadingItem[] = [];
  if (!Array.isArray(value)) return headings;

  for (let i = 0; i < value.length; i++) {
    const node = value[i] as { type?: string; children?: { text?: string }[]; id?: string };
    if (!node?.type) continue;

    let level = 0;
    if (node.type === "h1") level = 1;
    else if (node.type === "h2") level = 2;
    else if (node.type === "h3") level = 3;

    if (level > 0 && node.children) {
      const text = node.children
        .filter((c): c is { text: string } => typeof c?.text === "string")
        .map((c) => c.text)
        .join("")
        .trim();

      if (text) {
        headings.push({
          id: node.id ?? `heading-${i}`,
          text,
          level,
          index: i,
        });
      }
    }
  }

  return headings;
}

export function OutlinePanel({
  editorValue,
}: {
  editorValue: unknown[];
}) {
  const { outlineOpen } = useAppStore();
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  const headings = useMemo(() => extractHeadings(editorValue), [editorValue]);

  // Cmd+Shift+O to toggle outline
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "O" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        toggleOutline();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for custom toggle event
  useEffect(() => {
    const handler = () => toggleOutline();
    window.addEventListener("toggle-outline", handler);
    return () => window.removeEventListener("toggle-outline", handler);
  }, []);

  if (!outlineOpen) return null;

  const handleClick = (heading: HeadingItem) => {
    setActiveHeading(heading.id);
    // Try to scroll to the heading element in the editor
    const editorEl = document.querySelector("[data-plate-editor]");
    if (editorEl) {
      const allBlocks = editorEl.querySelectorAll("[data-block-id]");
      const targetBlock = allBlocks[heading.index];
      if (targetBlock) {
        targetBlock.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    // Fallback: try to find heading by text content
    const headingEls = document.querySelectorAll("h1, h2, h3");
    for (const el of headingEls) {
      if (el.textContent?.trim() === heading.text) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
    }
  };

  return (
    <div className="fixed right-4 top-14 z-50 w-64 rounded-lg border bg-background/95 shadow-lg backdrop-blur animate-in fade-in slide-in-from-right-2">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <List className="h-4 w-4" />
          Outline
        </div>
        <button
          type="button"
          onClick={() => setOutlineOpen(false)}
          className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {headings.length === 0 ? (
          <p className="px-2 py-1 text-muted-foreground text-xs">
            No headings found. Add H1, H2, or H3 headings to see the outline.
          </p>
        ) : (
          <div className="space-y-0.5">
            {headings.map((heading) => (
              <button
                key={`${heading.index}-${heading.text}`}
                type="button"
                onClick={() => handleClick(heading)}
                className={`w-full truncate rounded px-2 py-1 text-left text-xs transition-colors hover:bg-accent ${
                  activeHeading === heading.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
                style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
              >
                <span className="mr-1 text-[10px] opacity-50">
                  H{heading.level}
                </span>
                {heading.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Outline toggle button for the toolbar/sidebar
export function OutlineToggleButton() {
  const { outlineOpen } = useAppStore();

  return (
    <button
      type="button"
      onClick={toggleOutline}
      className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${
        outlineOpen ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent"
      }`}
      title="Toggle Outline (⌘⇧O)"
    >
      <List className="h-3 w-3" />
      Outline
    </button>
  );
}
