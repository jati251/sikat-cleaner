use crate::cleaner::disk_util::is_safe_to_delete;
use crate::models::LargeFileItem;
use std::path::PathBuf;
use std::time::UNIX_EPOCH;
use walkdir::WalkDir;

pub fn scan_large_files(target_dir: Option<String>, min_size_mb: Option<u64>) -> Vec<LargeFileItem> {
    let mut files = Vec::new();
    let min_bytes = min_size_mb.unwrap_or(50) * 1024 * 1024; // Default 50MB

    let base_paths: Vec<PathBuf> = if let Some(custom) = target_dir {
        vec![PathBuf::from(custom)]
    } else if let Some(home) = dirs::home_dir() {
        vec![
            home.join("Downloads"),
            home.join("Documents"),
            home.join("Movies"),
            home.join("Desktop"),
        ]
    } else {
        return files;
    };

    for base in base_paths {
        if !base.exists() {
            continue;
        }

        for entry in WalkDir::new(&base)
            .min_depth(1)
            .max_depth(8)
            .follow_links(false)
            .into_iter()
            .filter_entry(|e| {
                let name = e.file_name().to_string_lossy();
                // Skip hidden directories and git internals
                !name.starts_with('.') && name != "node_modules"
            })
            .filter_map(|e| e.ok())
        {
            if entry.file_type().is_file() {
                if let Ok(meta) = entry.metadata() {
                    let size = meta.len();
                    if size >= min_bytes {
                        let path = entry.path();
                        let path_str = path.to_string_lossy().to_string();
                        if is_safe_to_delete(&path_str) {
                            let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                            let ext = path.extension().unwrap_or_default().to_string_lossy().to_lowercase();
                            let modified = meta.modified()
                                .ok()
                                .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                                .map(|d| d.as_secs() as i64)
                                .unwrap_or(0);

                            let file_type = categorize_extension(&ext);

                            files.push(LargeFileItem {
                                id: format!("large-{}", path_str),
                                name,
                                path: path_str,
                                size_bytes: size,
                                extension: ext,
                                last_modified: modified,
                                file_type,
                            });
                        }
                    }
                }
            }
        }
    }

    // Sort largest first
    files.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));
    files
}

fn categorize_extension(ext: &str) -> String {
    match ext {
        "mp4" | "mov" | "mkv" | "avi" | "webm" | "m4v" => "video".to_string(),
        "dmg" | "iso" | "img" | "sparseimage" => "disk_image".to_string(),
        "zip" | "tar" | "gz" | "7z" | "rar" | "pkg" | "xz" | "bz2" => "archive".to_string(),
        "mp3" | "wav" | "flac" | "m4a" | "aac" | "ogg" => "audio".to_string(),
        "pdf" | "psd" | "ai" | "sketch" | "fig" | "doc" | "docx" => "document".to_string(),
        "sqlite" | "db" | "dump" | "sql" => "code".to_string(),
        _ => "other".to_string(),
    }
}
