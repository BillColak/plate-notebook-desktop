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
        Ok(())
    }
}
