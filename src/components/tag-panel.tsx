
import { Hash, Plus, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import {
  addManualTag,
  getAllTags,
  getTagsForNote,
  removeManualTag,
} from "@/actions/tags";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

interface NoteTagInfo {
  tagId: string;
  tagName: string;
  tagColor: string | null;
  source: string | null;
}

interface TagInfo {
  id: string;
  name: string;
}

export function TagPanel({ noteId }: { noteId: string }) {
  const [noteTags, setNoteTags] = useState<NoteTagInfo[]>([]);
  const [allTags, setAllTags] = useState<TagInfo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getTagsForNote(noteId).then(setNoteTags);
    getAllTags().then(setAllTags);
  }, [noteId]);

  const handleAddTag = (name: string) => {
    const trimmed = name.trim().toLowerCase();

    if (!trimmed) {
      return;
    }

    startTransition(async () => {
      await addManualTag(noteId, trimmed);
      const updated = await getTagsForNote(noteId);
      setNoteTags(updated);
      const updatedAll = await getAllTags();
      setAllTags(updatedAll);
      setInputValue("");
      setShowInput(false);
    });
  };

  const handleRemoveTag = (tagId: string) => {
    startTransition(async () => {
      await removeManualTag(noteId, tagId);
      const updated = await getTagsForNote(noteId);
      setNoteTags(updated);
    });
  };

  const suggestions = allTags.filter(
    (t) =>
      t.name.includes(inputValue.toLowerCase()) &&
      !noteTags.some((nt) => nt.tagName === t.name)
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tags</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="space-y-2 px-2">
          {noteTags.length === 0 && !showInput && (
            <p className="text-muted-foreground text-xs">
              No tags. Use #hashtags in your note or add manually.
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {noteTags.map((tag) => (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-xs"
                key={tag.tagId}
              >
                <Hash className="h-3 w-3 text-muted-foreground" />
                {tag.tagName}
                {tag.source === "manual" && (
                  <button
                    className="ml-0.5 rounded hover:text-destructive"
                    disabled={isPending}
                    onClick={() => handleRemoveTag(tag.tagId)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {showInput ? (
            <div className="relative">
              <input
                autoFocus
                className="h-7 w-full rounded-md border bg-transparent px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTag(inputValue);
                  }

                  if (e.key === "Escape") {
                    setShowInput(false);
                    setInputValue("");
                  }
                }}
                placeholder="Tag name..."
                type="text"
                value={inputValue}
              />
              {inputValue && suggestions.length > 0 && (
                <div className="absolute top-8 z-10 w-full rounded-md border bg-popover shadow-md">
                  {suggestions.slice(0, 5).map((tag) => (
                    <button
                      className="flex w-full items-center gap-1 px-2 py-1 text-xs hover:bg-accent"
                      key={tag.id}
                      onClick={() => handleAddTag(tag.name)}
                      type="button"
                    >
                      <Hash className="h-3 w-3" />
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              className="flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
              onClick={() => setShowInput(true)}
              type="button"
            >
              <Plus className="h-3 w-3" />
              Add tag
            </button>
          )}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
