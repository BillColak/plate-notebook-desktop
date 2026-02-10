use rusqlite::{Connection, Result};
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(app_dir: PathBuf) -> Result<Self> {
        std::fs::create_dir_all(&app_dir).ok();
        let db_path = app_dir.join("notebook.db");
        let conn = Connection::open(db_path)?;

        // Enable WAL mode and foreign keys
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA foreign_keys = ON;
             PRAGMA busy_timeout = 5000;",
        )?;

        let db = Database {
            conn: Mutex::new(conn),
        };
        db.create_tables()?;
        Ok(db)
    }

    fn create_tables(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT 'Untitled',
                content TEXT DEFAULT '[]',
                plain_text TEXT DEFAULT '',
                emoji TEXT DEFAULT '📝',
                parent_id TEXT,
                is_folder INTEGER DEFAULT 0,
                is_favorite INTEGER DEFAULT 0,
                is_pinned INTEGER DEFAULT 0,
                is_trashed INTEGER DEFAULT 0,
                sort_order INTEGER DEFAULT 0,
                created_at INTEGER DEFAULT (unixepoch()),
                updated_at INTEGER DEFAULT (unixepoch()),
                trashed_at INTEGER,
                word_count INTEGER DEFAULT 0
            );

            CREATE INDEX IF NOT EXISTS idx_notes_parent ON notes(parent_id);
            CREATE INDEX IF NOT EXISTS idx_notes_favorite ON notes(is_favorite);
            CREATE INDEX IF NOT EXISTS idx_notes_trashed ON notes(is_trashed);
            CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at);
            CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned);

            CREATE TABLE IF NOT EXISTS tags (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                color TEXT DEFAULT '#6366f1',
                created_at INTEGER DEFAULT (unixepoch())
            );

            CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

            CREATE TABLE IF NOT EXISTS note_tags (
                note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
                source TEXT DEFAULT 'inline',
                UNIQUE(note_id, tag_id)
            );

            CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON note_tags(tag_id);

            -- Wikilinks table: tracks [[links]] between notes
            CREATE TABLE IF NOT EXISTS wikilinks (
                source_note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                target_note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                UNIQUE(source_note_id, target_note_id)
            );

            CREATE INDEX IF NOT EXISTS idx_wikilinks_source ON wikilinks(source_note_id);
            CREATE INDEX IF NOT EXISTS idx_wikilinks_target ON wikilinks(target_note_id);

            -- FTS5 virtual table for full-text search
            CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
                title, plain_text, content='notes', content_rowid='rowid'
            );

            -- Triggers to keep FTS in sync
            CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
                INSERT INTO notes_fts(rowid, title, plain_text)
                VALUES (new.rowid, new.title, new.plain_text);
            END;

            CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
                INSERT INTO notes_fts(notes_fts, rowid, title, plain_text)
                VALUES ('delete', old.rowid, old.title, old.plain_text);
            END;

            CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
                INSERT INTO notes_fts(notes_fts, rowid, title, plain_text)
                VALUES ('delete', old.rowid, old.title, old.plain_text);
                INSERT INTO notes_fts(rowid, title, plain_text)
                VALUES (new.rowid, new.title, new.plain_text);
            END;",
        )?;

        // New tables for flashcards, canvas, snippets, analytics
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS flashcards (
                id TEXT PRIMARY KEY,
                note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                next_review INTEGER DEFAULT (unixepoch()),
                interval REAL DEFAULT 1.0,
                ease_factor REAL DEFAULT 2.5,
                repetitions INTEGER DEFAULT 0,
                created_at INTEGER DEFAULT (unixepoch()),
                updated_at INTEGER DEFAULT (unixepoch())
            );

            CREATE INDEX IF NOT EXISTS idx_flashcards_note ON flashcards(note_id);
            CREATE INDEX IF NOT EXISTS idx_flashcards_review ON flashcards(next_review);

            CREATE TABLE IF NOT EXISTS canvas_items (
                id TEXT PRIMARY KEY,
                note_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
                x REAL DEFAULT 0.0,
                y REAL DEFAULT 0.0,
                width REAL DEFAULT 200.0,
                height REAL DEFAULT 150.0,
                created_at INTEGER DEFAULT (unixepoch())
            );

            CREATE TABLE IF NOT EXISTS canvas_connections (
                id TEXT PRIMARY KEY,
                from_item_id TEXT NOT NULL REFERENCES canvas_items(id) ON DELETE CASCADE,
                to_item_id TEXT NOT NULL REFERENCES canvas_items(id) ON DELETE CASCADE,
                created_at INTEGER DEFAULT (unixepoch())
            );

            CREATE INDEX IF NOT EXISTS idx_canvas_conn_from ON canvas_connections(from_item_id);
            CREATE INDEX IF NOT EXISTS idx_canvas_conn_to ON canvas_connections(to_item_id);

            CREATE TABLE IF NOT EXISTS snippets (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                language TEXT DEFAULT 'text',
                tags TEXT DEFAULT '',
                created_at INTEGER DEFAULT (unixepoch())
            );

            CREATE TABLE IF NOT EXISTS writing_stats (
                date TEXT PRIMARY KEY,
                words_written INTEGER DEFAULT 0,
                notes_edited INTEGER DEFAULT 0,
                time_spent_seconds INTEGER DEFAULT 0,
                created_at INTEGER DEFAULT (unixepoch())
            );",
        )?;

        // Add columns if they don't exist (migration for existing DBs)
        let _ = conn.execute_batch("ALTER TABLE notes ADD COLUMN is_pinned INTEGER DEFAULT 0;");

        Ok(())
    }
}
