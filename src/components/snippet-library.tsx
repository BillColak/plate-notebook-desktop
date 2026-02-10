import { Code, Copy, Plus, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  createSnippet,
  deleteSnippet,
  getSnippets,
  searchSnippets,
} from "@/actions/features";
import type { SnippetData } from "@/db/schema";

export function SnippetLibrary() {
  const [snippets, setSnippets] = useState<SnippetData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<SnippetData | null>(null);
  const [loading, setLoading] = useState(true);

  // New snippet form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newLanguage, setNewLanguage] = useState("text");
  const [newTags, setNewTags] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const result = searchQuery
      ? await searchSnippets(searchQuery)
      : await getSnippets();
    setSnippets(result);
    setLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    await createSnippet(newTitle, newContent, newLanguage, newTags);
    setNewTitle("");
    setNewContent("");
    setNewLanguage("text");
    setNewTags("");
    setShowCreate(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteSnippet(id);
    if (selectedSnippet?.id === id) setSelectedSnippet(null);
    load();
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Fallback for non-secure contexts
    }
  };

  const LANGUAGES = [
    "text",
    "javascript",
    "typescript",
    "python",
    "rust",
    "html",
    "css",
    "json",
    "markdown",
    "bash",
    "sql",
    "go",
    "java",
    "cpp",
  ];

  return (
    <div className="flex h-full">
      {/* Left: snippet list */}
      <div className="flex w-80 flex-col border-r border-border">
        {/* Search */}
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search snippets…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 pl-8 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            New Snippet
          </button>
        </div>

        {/* Snippet list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-3 text-sm text-muted-foreground">Loading…</p>
          ) : snippets.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              No snippets yet. Create one!
            </p>
          ) : (
            <div className="space-y-0.5 p-1">
              {snippets.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSnippet(s)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    selectedSnippet?.id === s.id
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <Code className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.language} • {s.content.slice(0, 40)}…
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: detail/create */}
      <div className="flex-1 overflow-y-auto p-6">
        {showCreate ? (
          <div className="mx-auto max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Snippet</h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-md p-1 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Snippet title"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Language</label>
              <select
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tags</label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="comma, separated, tags"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Content</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Paste your snippet here…"
                rows={10}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newTitle.trim() || !newContent.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Save Snippet
            </button>
          </div>
        ) : selectedSnippet ? (
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selectedSnippet.title}</h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-1.5 py-0.5">
                    {selectedSnippet.language}
                  </span>
                  {selectedSnippet.tags && (
                    <>
                      {selectedSnippet.tags.split(",").map((tag) => (
                        <span
                          key={tag.trim()}
                          className="rounded bg-primary/10 px-1.5 py-0.5 text-primary"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </>
                  )}
                  <span>
                    {new Date(selectedSnippet.createdAt * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedSnippet.content)}
                  className="rounded-md p-2 hover:bg-accent"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedSnippet.id)}
                  className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                  title="Delete snippet"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <pre className="rounded-lg border border-border bg-muted/30 p-4 overflow-auto font-mono text-sm">
              <code>{selectedSnippet.content}</code>
            </pre>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Code className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="font-medium">Select a snippet</p>
              <p className="mt-1 text-sm">or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
