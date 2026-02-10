import {
  BookOpen,
  CalendarDays,
  Eye,
  FileText,
  FolderPlus,
  Moon,
  Network,
  Palette,
  Sun,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { createFolder } from "@/actions/folders";
import { createNote, getRecentNotes } from "@/actions/notes";
import { searchNotes } from "@/actions/search";
import { getOrCreateDailyNote } from "@/actions/wikilinks";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { RecentNote, SearchResult } from "@/db/schema";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useAppStore,
  setView,
  toggleFocusMode,
  toggleTheme,
  toggleOutline,
  refreshSidebar,
} from "@/lib/store";

interface CommandEntry {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void | Promise<void>;
}

export function SearchDialog({
  onNavigate,
}: {
  onNavigate?: (noteId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const debouncedQuery = useDebounce(query, 200);
  const { theme } = useAppStore();

  const commands: CommandEntry[] = [
    {
      id: "new-note",
      label: "New Note",
      shortcut: "⌘N",
      icon: <FileText className="mr-2 h-4 w-4 shrink-0" />,
      action: async () => {
        const id = await createNote();
        onNavigate?.(id);
        refreshSidebar();
      },
    },
    {
      id: "new-folder",
      label: "New Folder",
      icon: <FolderPlus className="mr-2 h-4 w-4 shrink-0" />,
      action: async () => {
        await createFolder("New Folder");
        refreshSidebar();
      },
    },
    {
      id: "toggle-focus",
      label: "Toggle Focus Mode",
      shortcut: "⌘⇧F",
      icon: <Eye className="mr-2 h-4 w-4 shrink-0" />,
      action: () => toggleFocusMode(),
    },
    {
      id: "open-graph",
      label: "Open Graph View",
      icon: <Network className="mr-2 h-4 w-4 shrink-0" />,
      action: () => setView("graph"),
    },
    {
      id: "toggle-theme",
      label: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      icon:
        theme === "dark" ? (
          <Sun className="mr-2 h-4 w-4 shrink-0" />
        ) : (
          <Moon className="mr-2 h-4 w-4 shrink-0" />
        ),
      action: () => toggleTheme(),
    },
    {
      id: "open-today",
      label: "Open Today's Note",
      icon: <CalendarDays className="mr-2 h-4 w-4 shrink-0" />,
      action: async () => {
        const today = new Date().toISOString().split("T")[0]!;
        const id = await getOrCreateDailyNote(today);
        onNavigate?.(id);
        refreshSidebar();
      },
    },
    {
      id: "open-trash",
      label: "Open Trash",
      icon: <Trash2 className="mr-2 h-4 w-4 shrink-0" />,
      action: () => setView("trash"),
    },
    {
      id: "toggle-outline",
      label: "Toggle Outline Panel",
      shortcut: "⌘⇧O",
      icon: <BookOpen className="mr-2 h-4 w-4 shrink-0" />,
      action: () => toggleOutline(),
    },
    {
      id: "open-shortcuts",
      label: "Keyboard Shortcuts",
      shortcut: "⌘?",
      icon: <Palette className="mr-2 h-4 w-4 shrink-0" />,
      action: () =>
        window.dispatchEvent(new CustomEvent("open-shortcuts")),
    },
  ];

  // Filter commands based on query
  const filteredCommands = query.trim()
    ? commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  // Cmd+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Listen for custom "open-search" event from sidebar
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-search", handler);
    return () => window.removeEventListener("open-search", handler);
  }, []);

  // Load recent notes when dialog opens
  useEffect(() => {
    if (open) {
      getRecentNotes().then(setRecentNotes);
    }
  }, [open]);

  // Search on debounced query change
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    searchNotes(debouncedQuery).then(setResults);
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (noteId: string) => {
      setOpen(false);
      setQuery("");
      onNavigate?.(noteId);
    },
    [onNavigate]
  );

  const handleCommandSelect = useCallback(
    (cmd: CommandEntry) => {
      setOpen(false);
      setQuery("");
      cmd.action();
    },
    []
  );

  const showResults = debouncedQuery.trim().length > 0;

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <CommandInput
        onValueChange={setQuery}
        placeholder="Search notes or type a command..."
        value={query}
      />
      <CommandList>
        <CommandEmpty>
          {showResults ? "No notes or commands found." : "Start typing to search..."}
        </CommandEmpty>
        {showResults && results.length > 0 && (
          <CommandGroup heading="Notes">
            {results.map((result) => (
              <CommandItem
                key={result.noteId}
                onSelect={() => handleSelect(result.noteId)}
                value={`note-${result.noteId}`}
              >
                <FileText className="mr-2 h-4 w-4 shrink-0" />
                <div className="flex min-w-0 flex-col">
                  <span
                    className="truncate text-sm"
                    dangerouslySetInnerHTML={{ __html: result.title }}
                  />
                  <span
                    className="truncate text-muted-foreground text-xs"
                    dangerouslySetInnerHTML={{ __html: result.snippet }}
                  />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {!showResults && recentNotes.length > 0 && (
          <CommandGroup heading="Recent Notes">
            {recentNotes.map((note) => (
              <CommandItem
                key={note.id}
                onSelect={() => handleSelect(note.id)}
                value={`recent-${note.id}-${note.title}`}
              >
                <span className="mr-2">{note.emoji ?? "📝"}</span>
                <span className="truncate">{note.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {filteredCommands.length > 0 && (
          <>
            {(showResults && results.length > 0) || (!showResults && recentNotes.length > 0) ? (
              <CommandSeparator />
            ) : null}
            <CommandGroup heading="Commands">
              {filteredCommands.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => handleCommandSelect(cmd)}
                  value={`cmd-${cmd.id}-${cmd.label}`}
                >
                  {cmd.icon}
                  <span className="flex-1">{cmd.label}</span>
                  {cmd.shortcut && (
                    <span className="ml-auto text-muted-foreground text-xs">
                      {cmd.shortcut}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
