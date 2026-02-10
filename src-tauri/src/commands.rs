use crate::db::Database;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct SqlResult {
    pub rows: Vec<Vec<serde_json::Value>>,
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

// ─── SQL Proxy (for Drizzle) ─────────────────────────────

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

    let param_refs: Vec<&dyn rusqlite::types::ToSql> = param_values.iter().map(|p| p.as_ref()).collect();

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
    // Simple base64 encoding
    use std::fmt::Write;
    let mut result = String::new();
    for byte in data {
        write!(&mut result, "{:02x}", byte).unwrap();
    }
    result
}

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
pub fn save_note_content(
    db: State<Database>,
    note_id: String,
    content: String,
    title: String,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE notes SET content = ?1, title = ?2, updated_at = unixepoch() WHERE id = ?3",
        params![content, title, note_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_notes_tree(db: State<Database>) -> Result<Vec<NoteTreeItem>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, title, parent_id, emoji, is_folder, sort_order, is_favorite
             FROM notes WHERE is_trashed = 0 ORDER BY sort_order ASC, created_at ASC",
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
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(notes)
}

#[tauri::command]
pub fn search_notes(db: State<Database>, query: String) -> Result<Vec<SearchResultItem>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

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
        .query_map(params![query], |row| {
            let id: String = row.get(0)?;
            Ok(SearchResultItem {
                note_id: id.clone(),
                id: id,
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
    Ok(())
}

#[tauri::command]
pub fn get_recent_notes(db: State<Database>) -> Result<Vec<RecentNote>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, title, emoji, updated_at FROM notes
             WHERE is_trashed = 0 AND is_folder = 0
             ORDER BY updated_at DESC LIMIT 10",
        )
        .map_err(|e| e.to_string())?;

    let notes = stmt
        .query_map([], |row| {
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

// ─── Folder Commands ─────────────────────────────────────

#[tauri::command]
pub fn create_folder(db: State<Database>, name: String) -> Result<String, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO notes (id, title, is_folder, emoji) VALUES (?1, ?2, 1, '📁')",
        params![id, name],
    )
    .map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
pub fn move_note(
    db: State<Database>,
    note_id: String,
    target_parent_id: Option<String>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE notes SET parent_id = ?1 WHERE id = ?2",
        params![target_parent_id, note_id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn rename_note(db: State<Database>, note_id: String, title: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE notes SET title = ?1 WHERE id = ?2",
        params![title, note_id],
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
pub fn permanently_delete_note(db: State<Database>, note_id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
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
        .prepare("SELECT id, name, color FROM tags ORDER BY name")
        .map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map([], |row| {
            Ok(TagInfo {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(tags)
}

#[tauri::command]
pub fn get_tags_for_note(db: State<Database>, note_id: String) -> Result<Vec<NoteTagInfo>, String> {
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
pub fn add_manual_tag(
    db: State<Database>,
    note_id: String,
    tag_name: String,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let tag_id = Uuid::new_v4().to_string();

    // Insert or get existing tag
    conn.execute(
        "INSERT OR IGNORE INTO tags (id, name) VALUES (?1, ?2)",
        params![tag_id, tag_name],
    )
    .map_err(|e| e.to_string())?;

    let actual_tag_id: String = conn
        .query_row("SELECT id FROM tags WHERE name = ?1", params![tag_name], |row| {
            row.get(0)
        })
        .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT OR IGNORE INTO note_tags (note_id, tag_id, source) VALUES (?1, ?2, 'manual')",
        params![note_id, actual_tag_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn remove_manual_tag(
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
