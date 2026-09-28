use crate::cleaner::disk_util::delete_path;
use crate::models::StartupItem;
use std::fs;
use std::path::{Path, PathBuf};

pub fn scan_startup_items() -> Vec<StartupItem> {
    let mut items = Vec::new();
    let home = dirs::home_dir();

    let scan_dirs: Vec<(PathBuf, &str)> = vec![
        (home.map(|h| h.join("Library/LaunchAgents")).unwrap_or_default(), "User"),
        (PathBuf::from("/Library/LaunchAgents"), "System"),
        (PathBuf::from("/Library/LaunchDaemons"), "System"),
    ];

    for (dir, scope) in scan_dirs {
        if !dir.exists() {
            continue;
        }

        if let Ok(entries) = fs::read_dir(&dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                let file_name = path.file_name().unwrap_or_default().to_string_lossy().to_string();

                let is_plist = file_name.ends_with(".plist");
                let is_disabled = file_name.ends_with(".disabled") || file_name.ends_with(".plist.bak");

                if is_plist || is_disabled {
                    let label = extract_plist_label(&path).unwrap_or_else(|| {
                        file_name.trim_end_matches(".disabled").trim_end_matches(".plist").to_string()
                    });

                    let friendly_name = label
                        .strip_prefix("com.")
                        .or_else(|| label.strip_prefix("org."))
                        .unwrap_or(&label)
                        .replace('.', " ");

                    items.push(StartupItem {
                        id: format!("startup-{}", path.to_string_lossy()),
                        name: capitalize_words(&friendly_name),
                        path: path.to_string_lossy().to_string(),
                        label,
                        scope: scope.to_string(),
                        is_enabled: !is_disabled,
                    });
                }
            }
        }
    }

    items.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    items
}

fn extract_plist_label(path: &Path) -> Option<String> {
    if let Ok(content) = fs::read_to_string(path) {
        let key_tag = "<key>Label</key>";
        if let Some(pos) = content.find(key_tag) {
            let remainder = &content[pos + key_tag.len()..];
            if let Some(str_start) = remainder.find("<string>") {
                let val_start = str_start + "<string>".len();
                if let Some(str_end) = remainder[val_start..].find("</string>") {
                    return Some(remainder[val_start..val_start + str_end].trim().to_string());
                }
            }
        }
    }
    None
}

fn capitalize_words(s: &str) -> String {
    s.split_whitespace()
        .map(|w| {
            let mut c = w.chars();
            match c.next() {
                None => String::new(),
                Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
            }
        })
        .collect::<Vec<String>>()
        .join(" ")
}

pub fn toggle_startup_item(path_str: &str, enable: bool) -> Result<(), String> {
    let path = PathBuf::from(path_str);
    if !path.exists() {
        return Err("File not found".to_string());
    }

    if enable && path_str.ends_with(".disabled") {
        let new_path = path_str.trim_end_matches(".disabled");
        fs::rename(&path, new_path).map_err(|e| e.to_string())?;
    } else if !enable && !path_str.ends_with(".disabled") {
        let new_path = format!("{}.disabled", path_str);
        fs::rename(&path, new_path).map_err(|e| e.to_string())?;
    }

    Ok(())
}

pub fn remove_startup_item(path_str: &str) -> Result<(), String> {
    delete_path(path_str, true)
}
