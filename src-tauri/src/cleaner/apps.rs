use crate::cleaner::disk_util::{delete_path, get_path_size};
use crate::models::AppItem;
use std::fs;
use std::path::{Path, PathBuf};

pub fn scan_applications() -> Vec<AppItem> {
    let mut apps: Vec<AppItem> = Vec::new();
    let app_dirs = [
        PathBuf::from("/Applications"),
        dirs::home_dir().map(|h| h.join("Applications")).unwrap_or_default(),
    ];

    for base_dir in &app_dirs {
        if !base_dir.exists() {
            continue;
        }

        if let Ok(entries) = fs::read_dir(base_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() && path.extension().map(|e| e == "app").unwrap_or(false) {
                    if let Some(app) = inspect_app_bundle(&path) {
                        apps.push(app);
                    }
                }
            }
        }
    }

    // Sort apps alphabetically
    apps.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    apps
}

fn inspect_app_bundle(app_path: &Path) -> Option<AppItem> {
    let file_stem = app_path.file_stem()?.to_string_lossy().to_string();
    
    // Don't show critical system apps in uninstaller to prevent accidents
    let protected_system_apps = [
        "Finder",
        "Safari",
        "System Settings",
        "App Store",
        "Calculator",
        "Calendar",
        "Contacts",
        "Maps",
        "Messages",
        "Music",
        "Photos",
        "Shortcuts",
        "Utilities",
    ];
    if protected_system_apps.contains(&file_stem.as_str()) {
        return None;
    }

    let info_plist = app_path.join("Contents/Info.plist");
    let mut bundle_id = String::new();
    let mut version = "1.0".to_string();
    let mut app_name = file_stem.clone();

    if info_plist.exists() {
        if let Ok(content) = fs::read_to_string(&info_plist) {
            // Fast plist parsing for standard keys
            if let Some(bid) = extract_plist_string(&content, "CFBundleIdentifier") {
                bundle_id = bid;
            }
            if let Some(ver) = extract_plist_string(&content, "CFBundleShortVersionString") {
                version = ver;
            }
            if let Some(name) = extract_plist_string(&content, "CFBundleDisplayName") {
                app_name = name;
            } else if let Some(name) = extract_plist_string(&content, "CFBundleName") {
                app_name = name;
            }
        }
    }

    if bundle_id.is_empty() {
        bundle_id = format!("com.local.{}", file_stem.to_lowercase().replace(' ', ""));
    }

    let app_size = get_path_size(app_path);
    let (leftover_paths, leftovers_size) = find_app_leftovers(&app_name, &bundle_id);

    Some(AppItem {
        id: format!("app-{}", bundle_id),
        name: app_name,
        bundle_id,
        app_path: app_path.to_string_lossy().to_string(),
        app_size,
        leftovers_size,
        total_size: app_size + leftovers_size,
        leftover_paths,
        version,
        icon: None,
    })
}

fn extract_plist_string(content: &str, key: &str) -> Option<String> {
    let key_tag = format!("<key>{}</key>", key);
    if let Some(pos) = content.find(&key_tag) {
        let remainder = &content[pos + key_tag.len()..];
        if let Some(str_start) = remainder.find("<string>") {
            let val_start = str_start + "<string>".len();
            if let Some(str_end) = remainder[val_start..].find("</string>") {
                return Some(remainder[val_start..val_start + str_end].trim().to_string());
            }
        }
    }
    None
}

/// Find associated data in ~/Library for an application
fn find_app_leftovers(name: &str, bundle_id: &str) -> (Vec<String>, u64) {
    let mut paths = Vec::new();
    let mut total_size: u64 = 0;
    let home = match dirs::home_dir() {
        Some(h) => h,
        None => return (paths, 0),
    };

    let library = home.join("Library");
    let candidates = [
        library.join("Application Support").join(name),
        library.join("Application Support").join(bundle_id),
        library.join("Caches").join(bundle_id),
        library.join("Preferences").join(format!("{}.plist", bundle_id)),
        library.join("Saved Application State").join(format!("{}.savedState", bundle_id)),
        library.join("HTTPStorages").join(bundle_id),
        library.join("WebKit").join(bundle_id),
        library.join("Logs").join(name),
    ];

    for candidate in &candidates {
        if candidate.exists() {
            let size = get_path_size(candidate);
            paths.push(candidate.to_string_lossy().to_string());
            total_size += size;
        }
    }

    (paths, total_size)
}

/// Completely uninstalls an application bundle and removes all its leftovers
pub fn uninstall_app(app_path: &str, leftover_paths: &[String]) -> Result<(), String> {
    // 1. Move the .app bundle to trash
    delete_path(app_path, true)?;

    // 2. Remove associated leftover paths
    for p in leftover_paths {
        let _ = delete_path(p, true);
    }

    Ok(())
}
