mod commands;
mod db;

use db::Database;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("failed to get app data dir");
            let database = Database::new(app_dir).expect("failed to initialize database");
            app.manage(database);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::execute_sql,
            commands::create_note,
            commands::get_note,
            commands::save_note_content,
            commands::get_notes_tree,
            commands::get_most_recent_note,
            commands::search_notes,
            commands::delete_note,
            commands::get_recent_notes,
            commands::create_folder,
            commands::move_note,
            commands::rename_note,
            commands::toggle_favorite,
            commands::toggle_pin,
            commands::get_favorite_notes,
            commands::get_trashed_notes,
            commands::permanently_delete_note,
            commands::restore_note,
            commands::get_all_tags,
            commands::get_note_tags,
            commands::sync_inline_tags,
            commands::add_manual_tag,
            commands::remove_tag,
            commands::sync_wikilinks,
            commands::get_backlinks,
            commands::get_all_note_titles,
            commands::find_note_by_title,
            commands::get_graph_data,
            commands::get_or_create_daily_note,
            commands::export_note_markdown,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
