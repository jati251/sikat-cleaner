pub mod cleaner;
pub mod models;

use models::{
    AppItem, CleanResult, DiskStats, LargeFileItem, LensFolderResponse, MemoryStats, ScanSummary,
    StartupItem,
};

#[tauri::command]
fn get_memory_stats() -> MemoryStats {
    cleaner::system_info::get_memory_stats()
}

#[tauri::command]
fn get_disk_stats() -> Vec<DiskStats> {
    cleaner::system_info::get_disk_stats()
}

#[tauri::command]
fn purge_memory() -> Result<MemoryStats, String> {
    cleaner::system_info::purge_memory()
}

#[tauri::command]
fn flush_dns_cache() -> Result<String, String> {
    cleaner::system_info::flush_dns_cache()
}

#[tauri::command]
fn scan_system_junk() -> ScanSummary {
    cleaner::system_junk::scan_system_junk()
}

#[tauri::command]
fn scan_developer_junk() -> ScanSummary {
    cleaner::dev_junk::scan_developer_junk()
}

#[tauri::command]
fn scan_project_node_modules(root_path: String) -> Vec<models::CleanItem> {
    cleaner::dev_junk::scan_project_node_modules(&root_path)
}

#[tauri::command]
fn scan_applications() -> Vec<AppItem> {
    cleaner::apps::scan_applications()
}

#[tauri::command]
fn uninstall_app(app_path: String, leftover_paths: Vec<String>) -> Result<(), String> {
    cleaner::apps::uninstall_app(&app_path, &leftover_paths)
}

#[tauri::command]
fn scan_large_files(target_dir: Option<String>, min_size_mb: Option<u64>) -> Vec<LargeFileItem> {
    cleaner::large_files::scan_large_files(target_dir, min_size_mb)
}

#[tauri::command]
fn scan_folder_lens(target_path: Option<String>) -> Result<LensFolderResponse, String> {
    cleaner::lens::scan_folder_lens(target_path)
}

#[tauri::command]
fn scan_startup_items() -> Vec<StartupItem> {
    cleaner::startup::scan_startup_items()
}

#[tauri::command]
fn toggle_startup_item(path: String, enable: bool) -> Result<(), String> {
    cleaner::startup::toggle_startup_item(&path, enable)
}

#[tauri::command]
fn remove_startup_item(path: String) -> Result<(), String> {
    cleaner::startup::remove_startup_item(&path)
}

#[tauri::command]
fn run_smart_scan() -> ScanSummary {
    cleaner::run_smart_scan()
}

#[tauri::command]
fn clean_items(paths: Vec<String>, use_trash: bool) -> CleanResult {
    cleaner::clean_items(paths, use_trash)
}

#[tauri::command]
fn reveal_in_finder(path: String) -> Result<(), String> {
    cleaner::system_info::reveal_in_finder(&path)
}

#[tauri::command]
fn check_full_disk_access() -> bool {
    cleaner::system_info::check_full_disk_access()
}

#[tauri::command]
fn open_full_disk_access_settings() -> Result<(), String> {
    cleaner::system_info::open_full_disk_access_settings()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_memory_stats,
            get_disk_stats,
            purge_memory,
            flush_dns_cache,
            scan_system_junk,
            scan_developer_junk,
            scan_project_node_modules,
            scan_applications,
            uninstall_app,
            scan_large_files,
            scan_folder_lens,
            scan_startup_items,
            toggle_startup_item,
            remove_startup_item,
            run_smart_scan,
            clean_items,
            reveal_in_finder,
            check_full_disk_access,
            open_full_disk_access_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
