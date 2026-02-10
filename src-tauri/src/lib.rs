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
            commands::save_note_content,
            commands::get_notes_tree,
            commands::search_notes,
            commands::delete_note,
            commands::get_recent_notes,
            commands::create_folder,
            commands::move_note,
            commands::rename_note,
            commands::toggle_favorite,
            commands::get_favorite_notes,
            commands::permanently_delete_note,
            commands::restore_note,
            commands::get_all_tags,
            commands::get_tags_for_note,
            commands::add_manual_tag,
            commands::remove_manual_tag,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
