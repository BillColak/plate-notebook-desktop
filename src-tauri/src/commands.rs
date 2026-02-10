use crate::db::Database;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

// ─── Data Types ──────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct SqlResult {
    pub rows: Vec<Vec<serde_json::Value>>,
}

#[derive(Debug, Serialize)]
pub struct NoteData {
    pub id: String,
    pub title: String,
    pub content: Option<String>,
    #[serde(rename = "plainText")]
    pub plain_text: Option<String>,
    pub emoji: Option<String>,
    #[serde(rename = "parentId")]
    pub parent_id: Option<String>,
    #[serde(rename = "isFolder")]
    pub is_folder: bool,
    #[serde(rename = "isFavorite")]
    pub is_favorite: bool,
    #[serde(rename = "isPinned")]
    pub is_pinned: bool,
    #[serde(rename = "isTrashed")]
    pub is_trashed: bool,
    #[serde(rename = "sortOrder")]
    pub sort_order: i64,
    #[serde(rename = "createdAt")]
    pub created_at: Option<i64>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<i64>,
    #[serde(rename = "trashedAt")]
    pub trashed_at: Option<i64>,
    #[serde(rename = "wordCount")]
    pub word_count: i64,
}

#[derive(Debug, Serialize)]
pub struct NoteTreeItem {
    pub id: String,
    pub title: String,
    #[serde(rename = "parentId")]
    pub parent_id: Option<String>,
    pub emoji: Option<String>,
    #[serde(rename = "isFolder")]
    pub is_folder: bool,
    pub position: i64,
    #[serde(rename = "isFavorite")]
    pub is_favorite: bool,
    #[serde(rename = "isPinned")]
    pub is_pinned: bool,
}

#[derive(Debug, Serialize)]
pub struct SearchResultItem {
    pub id: String,
    pub title: String,
    pub snippet: String,
    #[serde(rename = "noteId")]
    pub note_id: String,
}

#[derive(Debug, Serialize)]
pub struct RecentNote {
    pub id: String,
    pub title: String,
    pub emoji: Option<String>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct TagInfo {
    pub id: String,
    pub name: String,
    pub color: Option<String>,
    #[serde(rename = "noteCount")]
    pub note_count: i64,
}

#[derive(Debug, Serialize)]
pub struct NoteTagInfo {
    #[serde(rename = "tagId")]
    pub tag_id: String,
    #[serde(rename = "tagName")]
    pub tag_name: String,
    #[serde(rename = "tagColor")]
    pub tag_color: Option<String>,
    pub source: String,
}

#[derive(Debug, Serialize)]
pub struct FavoriteNote {
    pub id: String,
    pub title: String,
    pub emoji: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct TrashedNote {
    pub id: String,
    pub title: String,
    pub emoji: Option<String>,
    #[serde(rename = "trashedAt")]
    pub trashed_at: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct BacklinkItem {
    pub id: String,
    pub title: String,
    pub emoji: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct GraphNode {
    pub id: String,
    pub title: String,
    pub emoji: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct GraphEdge {
    pub source: String,
    pub target: String,
    #[serde(rename = "edgeType")]
    pub edge_type: String, // "wikilink" or "tag"
}

#[derive(Debug, Serialize)]
pub struct GraphData {
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<GraphEdge>,
}

#[derive(Debug, Serialize)]
pub struct NoteTitleItem {
    pub id: String,
    pub title: String,
}

// ─── SQL Proxy ───────────────────────────────────────────

#[tauri::command]
pub fn execute_sql(
    db: State<Database>,
    sql: String,
    params: Vec<serde_json::Value>,
    method: String,
) -> Result<SqlResult, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let param_values: Vec<Box<dyn rusqlite::types::ToSql>> = params
        .iter()
        .map(|v| -> Box<dyn rusqlite::types::ToSql> {
            match v {
                serde_json::Value::Null => Box::new(rusqlite::types::Null),
                serde_json::Value::Bool(b) => Box::new(*b),
                serde_json::Value::Number(n) => {
                    if let Some(i) = n.as_i64() {
                        Box::new(i)
                    } else if let Some(f) = n.as_f64() {
                        Box::new(f)
                    } else {
                        Box::new(n.to_string())
                    }
                }
                serde_json::Value::String(s) => Box::new(s.clone()),
                _ => Box::new(v.to_string()),
            }
        })
        .collect();

    let param_refs: Vec<&dyn rusqlite::types::ToSql> =
        param_values.iter().map(|p| p.as_ref()).collect();

    if method == "run" {
        conn.execute(&sql, param_refs.as_slice())
            .map_err(|e| e.to_string())?;
        return Ok(SqlResult { rows: vec![] });
    }

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let column_count = stmt.column_count();

    let rows: Vec<Vec<serde_json::Value>> = stmt
        .query_map(param_refs.as_slice(), |row| {
            let mut values = Vec::with_capacity(column_count);
            for i in 0..column_count {
                let val: rusqlite::Result<rusqlite::types::Value> = row.get(i);
                let json_val = match val {
                    Ok(rusqlite::types::Value::Null) => serde_json::Value::Null,
                    Ok(rusqlite::types::Value::Integer(n)) => serde_json::json!(n),
                    Ok(rusqlite::types::Value::Real(f)) => serde_json::json!(f),
                    Ok(rusqlite::types::Value::Text(s)) => serde_json::json!(s),
                    Ok(rusqlite::types::Value::Blob(b)) => {
                        serde_json::json!(base64_encode(&b))
                    }
                    Err(_) => serde_json::Value::Null,
                };
                values.push(json_val);
            }
            Ok(values)
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    if method == "get" {
        return Ok(SqlResult {
            rows: rows.into_iter().take(1).collect(),
        });
    }

    Ok(SqlResult { rows })
}

fn base64_encode(data: &[u8]) -> String {
    use std::fmt::Write;
    let mut result = String::new();
    for byte in data {
        write!(&mut result, "{:02x}", byte).unwrap();
    }
    result
}

// ─── Helper to read a full note row ─────────────────────

fn read_note_data(row: &rusqlite::Row) -> rusqlite::Result<NoteData> {
    Ok(NoteData {
        id: row.get(0)?,
        title: row.get(1)?,
        content: row.get(2)?,
        plain_text: row.get(3)?,
        emoji: row.get(4)?,
        parent_id: row.get(5)?,
        is_folder: row.get::<_, i64>(6)? != 0,
        is_favorite: row.get::<_, i64>(7)? != 0,
        is_pinned: row.get::<_, i64>(8)? != 0,
        is_trashed: row.get::<_, i64>(9)? != 0,
        sort_order: row.get(10)?,
        created_at: row.get(11)?,
        updated_at: row.get(12)?,
        trashed_at: row.get(13)?,
        word_count: row.get(14)?,
    })
}

const NOTE_COLUMNS: &str = "id, title, content, plain_text, emoji, parent_id, is_folder, is_favorite, is_pinned, is_trashed, sort_order, created_at, updated_at, trashed_at, word_count";

// ─── Note Commands ───────────────────────────────────────

#[tauri::command]
pub fn create_note(db: State<Database>, parent_id: Option<String>) -> Result<String, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO notes (id, title, content, parent_id) VALUES (?1, ?2, ?3, ?4)",
        params![id, "Untitled", "[]", parent_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
pub fn get_note(db: State<Database>, note_id: String) -> Result<NoteData, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let sql = format!("SELECT {} FROM notes WHERE id = ?1", NOTE_COLUMNS);
    conn.query_row(&sql, params![note_id], read_note_data)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_note_content(
    db: State<Database>,
    note_id: String,
    content: String,
    title: String,
    plain_text: String,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let word_count = plain_text.split_whitespace().count() as i64;

    conn.execute(
        "UPDATE notes SET content = ?1, title = ?2, plain_text = ?3, word_count = ?4, updated_at = unixepoch() WHERE id = ?5",
        params![content, title, plain_text, word_count, note_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_notes_tree(db: State<Database>) -> Result<Vec<NoteTreeItem>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, title, parent_id, emoji, is_folder, sort_order, is_favorite, is_pinned
             FROM notes WHERE is_trashed = 0 ORDER BY is_pinned DESC, sort_order ASC, created_at ASC",
        )
        .map_err(|e| e.to_string())?;

    let notes = stmt
        .query_map([], |row| {
            Ok(NoteTreeItem {
                id: row.get(0)?,
                title: row.get(1)?,
                parent_id: row.get(2)?,
                emoji: row.get(3)?,
                is_folder: row.get::<_, i64>(4)? != 0,
                position: row.get(5)?,
                is_favorite: row.get::<_, i64>(6)? != 0,
                is_pinned: row.get::<_, i64>(7)? != 0,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(notes)
}

#[tauri::command]
pub fn get_most_recent_note(db: State<Database>) -> Result<Option<NoteData>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let sql = format!(
        "SELECT {} FROM notes WHERE is_trashed = 0 AND is_folder = 0 ORDER BY updated_at DESC LIMIT 1",
        NOTE_COLUMNS
    );
    match conn.query_row(&sql, [], read_note_data) {
        Ok(note) => Ok(Some(note)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn search_notes(db: State<Database>, query: String) -> Result<Vec<SearchResultItem>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Sanitize query for FTS5
    let sanitized = query.replace('"', "").trim().to_string();
    if sanitized.is_empty() {
        return Ok(vec![]);
    }
    let fts_query = format!("\"{}\"*", sanitized);

    let mut stmt = conn
        .prepare(
            "SELECT n.id, highlight(notes_fts, 0, '<mark>', '</mark>') as title,
                    snippet(notes_fts, 1, '<mark>', '</mark>', '...', 32) as snippet
             FROM notes_fts
             JOIN notes n ON n.rowid = notes_fts.rowid
             WHERE notes_fts MATCH ?1 AND n.is_trashed = 0
             ORDER BY rank
             LIMIT 20",
        )
        .map_err(|e| e.to_string())?;

    let results = stmt
        .query_map(params![fts_query], |row| {
            let id: String = row.get(0)?;
            Ok(SearchResultItem {
                note_id: id.clone(),
                id,
                title: row.get(1)?,
                snippet: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(results)
}

#[tauri::command]
pub fn delete_note(db: State<Database>, note_id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE notes SET is_trashed = 1, trashed_at = unixepoch() WHERE id = ?1",
        params![note_id],
    )
    .map_err(|e| e.to_string())?;
    // Also trash children
    conn.execute(
        "UPDATE notes SET is_trashed = 1, trashed_at = unixepoch() WHERE parent_id = ?1",
        params![note_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_recent_notes(db: State<Database>, limit: Option<i64>) -> Result<Vec<RecentNote>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let lim = limit.unwrap_or(10);
    let mut stmt = conn
        .prepare(
            "SELECT id, title, emoji, updated_at FROM notes
             WHERE is_trashed = 0 AND is_folder = 0
             ORDER BY updated_at DESC LIMIT ?1",
        )
        .map_err(|e| e.to_string())?;

    let notes = stmt
        .query_map(params![lim], |row| {
            Ok(RecentNote {
                id: row.get(0)?,
                title: row.get(1)?,
                emoji: row.get(2)?,
                updated_at: row.get::<_, Option<i64>>(3)?.map(|t| t.to_string()),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(notes)
}

// ─── Template Command ────────────────────────────────────

#[tauri::command]
pub fn create_note_from_template(
    db: State<Database>,
    title: String,
    emoji: String,
    content: String,
) -> Result<String, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();

    // Extract plain text for FTS
    let plain_text = extract_plain_text_from_json(&content);
    let word_count = plain_text.split_whitespace().count() as i64;

    conn.execute(
        "INSERT INTO notes (id, title, content, emoji, plain_text, word_count) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, title, content, emoji, plain_text, word_count],
    )
    .map_err(|e| e.to_string())?;

    Ok(id)
}

/// Simple JSON-based plain text extraction for templates
fn extract_plain_text_from_json(content: &str) -> String {
    // Parse the JSON content and extract text nodes
    if let Ok(nodes) = serde_json::from_str::<Vec<serde_json::Value>>(content) {
        let mut parts = Vec::new();
        fn walk(node: &serde_json::Value, parts: &mut Vec<String>) {
            if let Some(text) = node.get("text").and_then(|t| t.as_str()) {
                parts.push(text.to_string());
            }
            if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
                for child in children {
                    walk(child, parts);
                }
            }
        }
        for node in &nodes {
            walk(node, &mut parts);
        }
        parts.join(" ").trim().to_string()
    } else {
        String::new()
    }
}

// ─── Folder Commands ─────────────────────────────────────

#[tauri::command]
pub fn create_folder(
    db: State<Database>,
    name: String,
    parent_id: Option<String>,
) -> Result<String, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO notes (id, title, is_folder, emoji, parent_id) VALUES (?1, ?2, 1, '📁', ?3)",
        params![id, name, parent_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
pub fn move_note(
    db: State<Database>,
    note_id: String,
    new_parent_id: Option<String>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE notes SET parent_id = ?1 WHERE id = ?2",
        params![new_parent_id, note_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn rename_note(db: State<Database>, note_id: String, new_title: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE notes SET title = ?1, updated_at = unixepoch() WHERE id = ?2",
        params![new_title, note_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn toggle_favorite(db: State<Database>, note_id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE notes SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?1",
        params![note_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn toggle_pin(db: State<Database>, note_id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE notes SET is_pinned = CASE WHEN is_pinned = 1 THEN 0 ELSE 1 END WHERE id = ?1",
        params![note_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_favorite_notes(db: State<Database>) -> Result<Vec<FavoriteNote>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, title, emoji FROM notes WHERE is_favorite = 1 AND is_trashed = 0")
        .map_err(|e| e.to_string())?;

    let notes = stmt
        .query_map([], |row| {
            Ok(FavoriteNote {
                id: row.get(0)?,
                title: row.get(1)?,
                emoji: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(notes)
}

#[tauri::command]
pub fn get_trashed_notes(db: State<Database>) -> Result<Vec<TrashedNote>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, title, emoji, trashed_at FROM notes
             WHERE is_trashed = 1 ORDER BY trashed_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let notes = stmt
        .query_map([], |row| {
            Ok(TrashedNote {
                id: row.get(0)?,
                title: row.get(1)?,
                emoji: row.get(2)?,
                trashed_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(notes)
}

#[tauri::command]
pub fn permanently_delete_note(db: State<Database>, note_id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM wikilinks WHERE source_note_id = ?1 OR target_note_id = ?1",
        params![note_id],
    )
    .map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM note_tags WHERE note_id = ?1",
        params![note_id],
    )
    .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM notes WHERE id = ?1", params![note_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn restore_note(db: State<Database>, note_id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE notes SET is_trashed = 0, trashed_at = NULL WHERE id = ?1",
        params![note_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ─── Tag Commands ────────────────────────────────────────

#[tauri::command]
pub fn get_all_tags(db: State<Database>) -> Result<Vec<TagInfo>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT t.id, t.name, t.color, COUNT(nt.note_id) as note_count
             FROM tags t
             LEFT JOIN note_tags nt ON nt.tag_id = t.id
             LEFT JOIN notes n ON n.id = nt.note_id AND n.is_trashed = 0
             GROUP BY t.id
             ORDER BY t.name",
        )
        .map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map([], |row| {
            Ok(TagInfo {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                note_count: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(tags)
}

#[tauri::command]
pub fn get_note_tags(db: State<Database>, note_id: String) -> Result<Vec<NoteTagInfo>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT t.id, t.name, t.color, nt.source
             FROM note_tags nt JOIN tags t ON t.id = nt.tag_id
             WHERE nt.note_id = ?1",
        )
        .map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map(params![note_id], |row| {
            Ok(NoteTagInfo {
                tag_id: row.get(0)?,
                tag_name: row.get(1)?,
                tag_color: row.get(2)?,
                source: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(tags)
}

#[tauri::command]
pub fn sync_inline_tags(
    db: State<Database>,
    note_id: String,
    tag_names: Vec<String>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Remove old inline tags for this note
    conn.execute(
        "DELETE FROM note_tags WHERE note_id = ?1 AND source = 'inline'",
        params![note_id],
    )
    .map_err(|e| e.to_string())?;

    // Insert new inline tags
    for name in &tag_names {
        let tag_id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT OR IGNORE INTO tags (id, name) VALUES (?1, ?2)",
            params![tag_id, name],
        )
        .map_err(|e| e.to_string())?;

        let actual_tag_id: String = conn
            .query_row("SELECT id FROM tags WHERE name = ?1", params![name], |row| {
                row.get(0)
            })
            .map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT OR IGNORE INTO note_tags (note_id, tag_id, source) VALUES (?1, ?2, 'inline')",
            params![note_id, actual_tag_id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn add_manual_tag(
    db: State<Database>,
    note_id: String,
    tag_name: String,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let tag_id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT OR IGNORE INTO tags (id, name) VALUES (?1, ?2)",
        params![tag_id, tag_name],
    )
    .map_err(|e| e.to_string())?;

    let actual_tag_id: String = conn
        .query_row(
            "SELECT id FROM tags WHERE name = ?1",
            params![tag_name],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT OR IGNORE INTO note_tags (note_id, tag_id, source) VALUES (?1, ?2, 'manual')",
        params![note_id, actual_tag_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn remove_tag(
    db: State<Database>,
    note_id: String,
    tag_id: String,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM note_tags WHERE note_id = ?1 AND tag_id = ?2",
        params![note_id, tag_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

// ─── Wikilink Commands ───────────────────────────────────

#[tauri::command]
pub fn sync_wikilinks(
    db: State<Database>,
    note_id: String,
    target_titles: Vec<String>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Remove old wikilinks from this note
    conn.execute(
        "DELETE FROM wikilinks WHERE source_note_id = ?1",
        params![note_id],
    )
    .map_err(|e| e.to_string())?;

    // Insert new wikilinks
    for title in &target_titles {
        // Find note by title (case-insensitive)
        let target_id: Option<String> = conn
            .query_row(
                "SELECT id FROM notes WHERE LOWER(title) = LOWER(?1) AND is_trashed = 0 AND id != ?2 LIMIT 1",
                params![title, note_id],
                |row| row.get(0),
            )
            .ok();

        if let Some(tid) = target_id {
            conn.execute(
                "INSERT OR IGNORE INTO wikilinks (source_note_id, target_note_id) VALUES (?1, ?2)",
                params![note_id, tid],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn get_backlinks(db: State<Database>, note_id: String) -> Result<Vec<BacklinkItem>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT n.id, n.title, n.emoji FROM wikilinks w
             JOIN notes n ON n.id = w.source_note_id
             WHERE w.target_note_id = ?1 AND n.is_trashed = 0",
        )
        .map_err(|e| e.to_string())?;

    let backlinks = stmt
        .query_map(params![note_id], |row| {
            Ok(BacklinkItem {
                id: row.get(0)?,
                title: row.get(1)?,
                emoji: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(backlinks)
}

#[tauri::command]
pub fn get_all_note_titles(db: State<Database>) -> Result<Vec<NoteTitleItem>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, title FROM notes WHERE is_trashed = 0 AND is_folder = 0 ORDER BY title")
        .map_err(|e| e.to_string())?;

    let titles = stmt
        .query_map([], |row| {
            Ok(NoteTitleItem {
                id: row.get(0)?,
                title: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(titles)
}

#[tauri::command]
pub fn find_note_by_title(db: State<Database>, title: String) -> Result<Option<String>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    match conn.query_row(
        "SELECT id FROM notes WHERE LOWER(title) = LOWER(?1) AND is_trashed = 0 LIMIT 1",
        params![title],
        |row| row.get::<_, String>(0),
    ) {
        Ok(id) => Ok(Some(id)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

// ─── Graph Command ───────────────────────────────────────

#[tauri::command]
pub fn get_graph_data(db: State<Database>) -> Result<GraphData, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Get all non-trashed, non-folder notes
    let mut node_stmt = conn
        .prepare("SELECT id, title, emoji FROM notes WHERE is_trashed = 0 AND is_folder = 0")
        .map_err(|e| e.to_string())?;

    let nodes: Vec<GraphNode> = node_stmt
        .query_map([], |row| {
            Ok(GraphNode {
                id: row.get(0)?,
                title: row.get(1)?,
                emoji: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    // Get wikilink edges
    let mut link_stmt = conn
        .prepare(
            "SELECT w.source_note_id, w.target_note_id FROM wikilinks w
             JOIN notes s ON s.id = w.source_note_id AND s.is_trashed = 0
             JOIN notes t ON t.id = w.target_note_id AND t.is_trashed = 0",
        )
        .map_err(|e| e.to_string())?;

    let mut edges: Vec<GraphEdge> = link_stmt
        .query_map([], |row| {
            Ok(GraphEdge {
                source: row.get(0)?,
                target: row.get(1)?,
                edge_type: "wikilink".to_string(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    // Get tag-based edges (notes sharing same tag)
    let mut tag_edge_stmt = conn
        .prepare(
            "SELECT DISTINCT nt1.note_id, nt2.note_id
             FROM note_tags nt1
             JOIN note_tags nt2 ON nt1.tag_id = nt2.tag_id AND nt1.note_id < nt2.note_id
             JOIN notes n1 ON n1.id = nt1.note_id AND n1.is_trashed = 0 AND n1.is_folder = 0
             JOIN notes n2 ON n2.id = nt2.note_id AND n2.is_trashed = 0 AND n2.is_folder = 0",
        )
        .map_err(|e| e.to_string())?;

    let tag_edges: Vec<GraphEdge> = tag_edge_stmt
        .query_map([], |row| {
            Ok(GraphEdge {
                source: row.get(0)?,
                target: row.get(1)?,
                edge_type: "tag".to_string(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    edges.extend(tag_edges);

    Ok(GraphData { nodes, edges })
}

// ─── Daily Note Command ──────────────────────────────────

#[tauri::command]
pub fn get_or_create_daily_note(db: State<Database>, date: String) -> Result<String, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Check if a note with this date as title already exists
    let existing: Option<String> = conn
        .query_row(
            "SELECT id FROM notes WHERE title = ?1 AND is_trashed = 0 LIMIT 1",
            params![date],
            |row| row.get(0),
        )
        .ok();

    if let Some(id) = existing {
        return Ok(id);
    }

    // Create new daily note
    let id = Uuid::new_v4().to_string();
    let content = format!(
        r#"[{{"type":"h1","children":[{{"text":"{}"}}]}},{{"type":"p","children":[{{"text":""}}]}}]"#,
        date
    );

    conn.execute(
        "INSERT INTO notes (id, title, content, emoji) VALUES (?1, ?2, ?3, '📅')",
        params![id, date, content],
    )
    .map_err(|e| e.to_string())?;

    Ok(id)
}

// ─── Export Command ──────────────────────────────────────

#[tauri::command]
pub fn export_note_markdown(db: State<Database>, note_id: String) -> Result<String, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let (title, plain_text): (String, String) = conn
        .query_row(
            "SELECT title, COALESCE(plain_text, '') FROM notes WHERE id = ?1",
            params![note_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|e| e.to_string())?;

    // Simple markdown export: title as H1 + plain text content
    let md = format!("# {}\n\n{}", title, plain_text);
    Ok(md)
}
