use crate::models::{LensFolderResponse, LensNode};
use rayon::prelude::*;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;
use walkdir::WalkDir;

pub fn scan_folder_lens(target_path: Option<String>) -> Result<LensFolderResponse, String> {
    let path = match target_path {
        Some(p) if !p.trim().is_empty() => PathBuf::from(p),
        _ => dirs::home_dir().unwrap_or_else(|| PathBuf::from("/")),
    };

    if !path.exists() {
        return Err(format!("Path does not exist: {}", path.display()));
    }

    let current_path_str = path.to_string_lossy().to_string();
    let current_name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "Root".to_string());

    let parent_path = path
        .parent()
        .map(|p| p.to_string_lossy().to_string());

    let read_entries = match fs::read_dir(&path) {
        Ok(entries) => entries,
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    };

    let entries_vec: Vec<fs::DirEntry> = read_entries
        .filter_map(|e| e.ok())
        .filter(|e| {
            let name = e.file_name().to_string_lossy().to_string();
            !name.starts_with('.') && name != "$RECYCLE.BIN"
        })
        .collect();

    let children: Vec<LensNode> = entries_vec
        .into_par_iter()
        .filter_map(|entry| {
            let entry_path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            let entry_path_str = entry_path.to_string_lossy().to_string();

            if let Ok(meta) = entry.metadata() {
                let modified = meta
                    .modified()
                    .ok()
                    .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                    .map(|d| d.as_secs() as i64)
                    .unwrap_or(0);

                if meta.is_dir() {
                    let (size, count) = get_dir_size(&entry_path);
                    Some(LensNode {
                        id: format!("dir-{}", entry_path_str),
                        name,
                        path: entry_path_str,
                        is_dir: true,
                        size_bytes: size,
                        item_count: Some(count),
                        extension: None,
                        file_type: "folder".to_string(),
                        last_modified: modified,
                    })
                } else if meta.is_file() {
                    let ext = entry_path
                        .extension()
                        .map(|e| e.to_string_lossy().to_lowercase())
                        .unwrap_or_default();
                    let file_type = categorize_extension(&ext);
                    Some(LensNode {
                        id: format!("file-{}", entry_path_str),
                        name,
                        path: entry_path_str,
                        is_dir: false,
                        size_bytes: meta.len(),
                        item_count: None,
                        extension: if ext.is_empty() { None } else { Some(ext) },
                        file_type,
                        last_modified: modified,
                    })
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect();

    let mut sorted_children = children;
    sorted_children.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));

    let total_bytes = sorted_children.iter().map(|c| c.size_bytes).sum();

    Ok(LensFolderResponse {
        current_path: current_path_str,
        current_name,
        parent_path,
        total_bytes,
        children: sorted_children,
    })
}

fn get_dir_size(path: &Path) -> (u64, usize) {
    let mut total_size = 0u64;
    let mut item_count = 0usize;

    for entry in WalkDir::new(path)
        .min_depth(1)
        .max_depth(8)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            !name.starts_with('.')
        })
        .filter_map(|e| e.ok())
    {
        item_count += 1;
        if entry.file_type().is_file() {
            if let Ok(meta) = entry.metadata() {
                total_size += meta.len();
            }
        }
    }

    (total_size, item_count)
}

fn categorize_extension(ext: &str) -> String {
    match ext {
        "mp4" | "mov" | "mkv" | "avi" | "webm" | "m4v" => "video".to_string(),
        "dmg" | "iso" | "img" | "sparseimage" => "disk_image".to_string(),
        "zip" | "tar" | "gz" | "7z" | "rar" | "pkg" | "xz" | "bz2" => "archive".to_string(),
        "mp3" | "wav" | "flac" | "m4a" | "aac" | "ogg" => "audio".to_string(),
        "pdf" | "psd" | "ai" | "sketch" | "fig" | "doc" | "docx" | "pages" | "xls" | "xlsx" | "ppt" | "pptx" => "document".to_string(),
        "ts" | "tsx" | "js" | "jsx" | "rs" | "go" | "py" | "c" | "cpp" | "json" | "toml" | "yaml" | "yml" | "html" | "css" => "code".to_string(),
        _ => "other".to_string(),
    }
}
