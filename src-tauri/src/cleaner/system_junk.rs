use crate::cleaner::disk_util::{get_path_size, is_safe_to_delete};
use crate::models::{CategorySummary, CleanItem, ScanSummary};
use rayon::prelude::*;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

pub fn scan_system_junk() -> ScanSummary {
    let mut items: Vec<CleanItem> = Vec::new();
    let home = match dirs::home_dir() {
        Some(h) => h,
        None => return empty_summary(),
    };

    // 1. User Application Caches (~/Library/Caches)
    let user_caches = home.join("Library/Caches");
    if user_caches.exists() {
        if let Ok(entries) = fs::read_dir(&user_caches) {
            let dir_entries: Vec<_> = entries.flatten().collect();
            let cache_items: Vec<CleanItem> = dir_entries
                .into_par_iter()
                .filter_map(|entry| {
                    let path = entry.path();
                    let file_name = path
                        .file_name()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .to_string();

                    // Skip hidden files
                    if file_name.starts_with('.') {
                        return None;
                    }

                    let size = get_path_size(&path);
                    if size > 1024 * 512 {
                        // Only show caches > 512KB for relevance
                        let path_str = path.to_string_lossy().to_string();
                        let safe = is_safe_to_delete(&path_str);
                        Some(CleanItem {
                            id: format!("user-cache-{}", file_name),
                            title: format!("Cache: {}", friendly_cache_name(&file_name)),
                            category: "User Application Caches".to_string(),
                            path: path_str,
                            size_bytes: size,
                            is_safe_to_delete: safe,
                            description: format!("Cached temporary data for {}", file_name),
                            icon: Some("app-cache".to_string()),
                        })
                    } else {
                        None
                    }
                })
                .collect();
            items.extend(cache_items);
        }
    }


    // 2. User Logs (~/Library/Logs)
    let user_logs = home.join("Library/Logs");
    if user_logs.exists() {
        let size = get_path_size(&user_logs);
        if size > 0 {
            let path_str = user_logs.to_string_lossy().to_string();
            items.push(CleanItem {
                id: "user-logs-all".to_string(),
                title: "User Logs & Diagnostics".to_string(),
                category: "System Logs".to_string(),
                path: path_str,
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Application crash logs and debug traces in ~/Library/Logs".to_string(),
                icon: Some("logs".to_string()),
            });
        }
    }

    // 3. System Diagnostic Reports (/Library/Logs/DiagnosticReports)
    let diag_reports = PathBuf::from("/Library/Logs/DiagnosticReports");
    if diag_reports.exists() {
        let size = get_path_size(&diag_reports);
        if size > 0 {
            items.push(CleanItem {
                id: "system-diag-reports".to_string(),
                title: "Diagnostic Reports & Crash Dumps".to_string(),
                category: "System Logs".to_string(),
                path: diag_reports.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "macOS system crash and spin dumps".to_string(),
                icon: Some("alert-circle".to_string()),
            });
        }
    }

    // 4. Trash Bin (~/.Trash)
    let trash = home.join(".Trash");
    if trash.exists() {
        let size = get_path_size(&trash);
        if size > 0 {
            items.push(CleanItem {
                id: "macos-trash-bin".to_string(),
                title: "Trash Bin".to_string(),
                category: "Trash Bins".to_string(),
                path: trash.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Deleted files currently sitting in macOS Trash".to_string(),
                icon: Some("trash-2".to_string()),
            });
        }
    }

    // 5. Apple Mail Cache
    let mail_cache = home.join("Library/Containers/com.apple.mail/Data/Library/Caches");
    if mail_cache.exists() {
        let size = get_path_size(&mail_cache);
        if size > 1024 * 1024 {
            items.push(CleanItem {
                id: "apple-mail-cache".to_string(),
                title: "Apple Mail Cached Data".to_string(),
                category: "User Application Caches".to_string(),
                path: mail_cache.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Temporary offline attachments and mail database caches".to_string(),
                icon: Some("mail".to_string()),
            });
        }
    }

    // 6. QuickLook Thumbnail Cache
    let ql_cache = home.join("Library/Caches/com.apple.QuickLook.thumbnailcache");
    if ql_cache.exists() {
        let size = get_path_size(&ql_cache);
        if size > 1024 * 1024 {
            items.push(CleanItem {
                id: "quicklook-thumbnails".to_string(),
                title: "QuickLook Thumbnail Cache".to_string(),
                category: "User Application Caches".to_string(),
                path: ql_cache.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Cached preview thumbnails for images and documents".to_string(),
                icon: Some("image".to_string()),
            });
        }
    }

    build_summary(items)
}

fn friendly_cache_name(folder_name: &str) -> String {
    if folder_name.starts_with("com.google.") {
        return "Google Chrome / Services".to_string();
    }
    if folder_name.starts_with("company.thebrowser.") {
        return "Arc Browser".to_string();
    }
    if folder_name.starts_with("com.apple.Safari") {
        return "Safari Browser".to_string();
    }
    if folder_name.starts_with("com.brave.") {
        return "Brave Browser".to_string();
    }
    if folder_name.starts_with("com.spotify.") {
        return "Spotify Music".to_string();
    }
    if folder_name.starts_with("com.tinyspeck.slackmacgap") {
        return "Slack".to_string();
    }
    if folder_name.starts_with("com.microsoft.VSCode") {
        return "Visual Studio Code".to_string();
    }
    if folder_name.starts_with("com.docker.") {
        return "Docker Desktop".to_string();
    }
    
    // Fallback: strip com. or org. prefix if clean
    if let Some(stripped) = folder_name.strip_prefix("com.") {
        return stripped.replace('.', " ");
    }
    folder_name.to_string()
}

fn empty_summary() -> ScanSummary {
    ScanSummary {
        total_items: 0,
        total_bytes: 0,
        categories: HashMap::new(),
        items: Vec::new(),
    }
}

pub fn build_summary(items: Vec<CleanItem>) -> ScanSummary {
    let mut categories: HashMap<String, CategorySummary> = HashMap::new();
    let mut total_bytes: u64 = 0;

    for item in &items {
        total_bytes += item.size_bytes;
        let entry = categories.entry(item.category.clone()).or_insert_with(|| CategorySummary {
            category: item.category.clone(),
            total_bytes: 0,
            count: 0,
            items: Vec::new(),
        });
        entry.total_bytes += item.size_bytes;
        entry.count += 1;
        entry.items.push(item.clone());
    }

    ScanSummary {
        total_items: items.len(),
        total_bytes,
        categories,
        items,
    }
}
