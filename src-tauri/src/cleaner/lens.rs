use crate::models::{LensFolderResponse, LensNode};
use rayon::prelude::*;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;
use walkdir::WalkDir;

pub fn scan_folder_lens(target_path: Option<String>) -> Result<LensFolderResponse, String> {
    let path = match target_path {
        Some(p) if !p.trim().is_empty() => {
            let p_trim = p.trim();
            if p_trim == "~" {
                dirs::home_dir().unwrap_or_else(|| PathBuf::from("/"))
            } else if p_trim.starts_with("~/") {
                if let Some(home) = dirs::home_dir() {
                    home.join(&p_trim[2..])
                } else {
                    PathBuf::from(p_trim)
                }
            } else if p_trim.starts_with('/') {
                PathBuf::from(p_trim)
            } else {
                // If it's a relative shortcut like "Downloads", "Documents", "Desktop", "Movies"
                if let Some(home) = dirs::home_dir() {
                    let candidate = home.join(p_trim);
                    if candidate.exists() {
                        candidate
                    } else {
                        PathBuf::from(p_trim)
                    }
                } else {
                    PathBuf::from(p_trim)
                }
            }
        }
        _ => dirs::home_dir().unwrap_or_else(|| PathBuf::from("/")),
    };

    let current_path_str = path.to_string_lossy().to_string();
    let current_name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| {
            if current_path_str == "/" {
                "Macintosh HD".to_string()
            } else {
                "Root".to_string()
            }
        });

    let parent_path = path
        .parent()
        .map(|p| p.to_string_lossy().to_string());

    if !path.exists() {
        return Ok(LensFolderResponse {
            current_path: current_path_str,
            current_name,
            parent_path,
            total_bytes: 0,
            children: vec![],
            permission_denied: false,
            error_message: Some(format!("Directory does not exist: {}", path.display())),
        });
    }

    let read_entries = match fs::read_dir(&path) {
        Ok(entries) => entries,
        Err(e) => {
            let is_permission = e.kind() == std::io::ErrorKind::PermissionDenied
                || e.raw_os_error() == Some(1); // EPERM (Operation not permitted)

            return Ok(LensFolderResponse {
                current_path: current_path_str,
                current_name,
                parent_path,
                total_bytes: 0,
                children: vec![],
                permission_denied: is_permission,
                error_message: Some(if is_permission {
                    "macOS requires Full Disk Access permission to view and analyze this folder.".to_string()
                } else {
                    format!("Failed to read directory: {}", e)
                }),
            });
        }
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
                // If metadata reading is restricted, still present the folder item
                Some(LensNode {
                    id: format!("dir-{}", entry_path_str),
                    name,
                    path: entry_path_str,
                    is_dir: true,
                    size_bytes: 0,
                    item_count: Some(0),
                    extension: None,
                    file_type: "folder".to_string(),
                    last_modified: 0,
                })
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
        permission_denied: false,
        error_message: None,
    })
}

fn get_dir_size(path: &Path) -> (u64, usize) {
    let mut total_size = 0u64;
    let mut item_count = 0usize;

    for entry in WalkDir::new(path)
        .min_depth(1)
        .max_depth(4)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            !name.starts_with('.')
                && name != "node_modules"
                && name != ".git"
                && name != "Containers"
                && name != "Group Containers"
        })
        .filter_map(|e| e.ok())
        .take(15_000)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_home() {
        let res = scan_folder_lens(None);
        assert!(res.is_ok());
        let folder = res.unwrap();
        assert!(!folder.current_path.is_empty());
        println!("Path: {}, Total: {}, Children count: {}", folder.current_path, folder.total_bytes, folder.children.len());
    }

    #[test]
    fn test_scan_relative_shortcut() {
        let res = scan_folder_lens(Some("Downloads".to_string()));
        assert!(res.is_ok());
        let folder = res.unwrap();
        assert!(folder.current_path.contains("Downloads"));
        println!("Downloads Path: {}, Children: {}", folder.current_path, folder.children.len());
    }

    #[test]
    fn test_scan_tilde_shortcut() {
        let res = scan_folder_lens(Some("~/Downloads".to_string()));
        assert!(res.is_ok());
        let folder = res.unwrap();
        assert!(folder.current_path.contains("Downloads"));
    }

    #[test]
    fn test_scan_non_existent() {
        let res = scan_folder_lens(Some("/does_not_exist_xyz_12345".to_string()));
        assert!(res.is_ok());
        let folder = res.unwrap();
        assert!(folder.error_message.is_some());
        assert_eq!(folder.children.len(), 0);
    }

    #[test]
    fn test_scan_protected_folder() {
        // ~/Library/Safari is protected by macOS TCC FDA
        let res = scan_folder_lens(Some("~/Library/Safari".to_string()));
        assert!(res.is_ok());
        let folder = res.unwrap();
        println!("Safari perm denied: {}, error: {:?}", folder.permission_denied, folder.error_message);
        // Either it's permission denied (true) or readable if FDA granted
    }
}
