
import { FileText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { getRecentNotes } from "@/actions/notes";
import { type SearchResult, searchNotes } from "@/actions/search";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";

interface RecentNote {
  id: string;
  title: string;
  emoji: string | null;
  updatedAt: Date | null;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const debouncedQuery = useDebounce(query, 200);

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
    (_noteId: string) => {
      setOpen(false);
      setQuery("");
      // TODO: wire up navigation
    },
    []
  );

  const showResults = debouncedQuery.trim().length > 0;

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <CommandInput
        onValueChange={setQuery}
        placeholder="Search notes..."
        value={query}
      />
      <CommandList>
        <CommandEmpty>
          {showResults ? "No notes found." : "Start typing to search..."}
        </CommandEmpty>
        {showResults && results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((result) => (
              <CommandItem
                key={result.noteId}
                onSelect={() => handleSelect(result.noteId)}
                value={result.noteId}
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
                value={`${note.id}-${note.title}`}
              >
                <span className="mr-2">{note.emoji ?? "📝"}</span>
                <span className="truncate">{note.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
