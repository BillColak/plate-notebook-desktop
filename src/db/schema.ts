import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ─── Notes ───────────────────────────────────────────────

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull().default("Untitled"),
    content: text("content", { mode: "json" }),
    plainText: text("plain_text").default(""),
    emoji: text("emoji").default("📝"),
    parentId: text("parent_id"),
    isFolder: integer("is_folder", { mode: "boolean" }).default(false),
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    isTrashed: integer("is_trashed", { mode: "boolean" }).default(false),
    sortOrder: integer("sort_order").default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`
    ),
    trashedAt: integer("trashed_at", { mode: "timestamp" }),
    wordCount: integer("word_count").default(0),
  },
  (table) => [
    index("idx_notes_parent").on(table.parentId),
    index("idx_notes_favorite").on(table.isFavorite),
    index("idx_notes_trashed").on(table.isTrashed),
    index("idx_notes_updated").on(table.updatedAt),
  ]
);

// ─── Tags ────────────────────────────────────────────────

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    color: text("color").default("#6366f1"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(unixepoch())`
    ),
  },
  (table) => [uniqueIndex("idx_tags_name").on(table.name)]
);

// ─── Note ↔ Tag Junction ────────────────────────────────

export const noteTags = sqliteTable(
  "note_tags",
  {
    noteId: text("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    source: text("source", { enum: ["inline", "manual"] }).default("inline"),
  },
  (table) => [
    uniqueIndex("idx_note_tags_unique").on(table.noteId, table.tagId),
    index("idx_note_tags_tag").on(table.tagId),
  ]
);

// ─── Types ───────────────────────────────────────────────

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NoteTag = typeof noteTags.$inferSelect;
