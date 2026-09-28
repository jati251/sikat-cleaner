use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

/// Calculate the total size in bytes of a file or directory recursively.
/// Skips symlinks to prevent loops and double counting.
pub fn get_path_size<P: AsRef<Path>>(path: P) -> u64 {
    let p = path.as_ref();
    if !p.exists() {
        return 0;
    }

    if p.is_file() {
        return fs::metadata(p).map(|m| m.len()).unwrap_or(0);
    }

    let mut total: u64 = 0;
    for entry in WalkDir::new(p)
        .min_depth(1)
        .max_depth(10)
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_file() {
            total += entry.metadata().map(|m| m.len()).unwrap_or(0);
        }
    }
    total
}

/// Verify that a path is safe to delete and not a critical root/system directory
pub fn is_safe_to_delete(path_str: &str) -> bool {
    let p = Path::new(path_str);
    if !p.is_absolute() {
        return false;
    }

    // Disallow critical roots and direct user home
    let forbidden = [
        "/",
        "/bin",
        "/sbin",
        "/usr",
        "/System",
        "/System/Library",
        "/Library",
        "/Applications",
        "/Users",
        "/private",
        "/etc",
        "/var",
        "/dev",
    ];

    for f in forbidden {
        if path_str == f {
            return false;
        }
    }

    if let Some(home) = dirs::home_dir() {
        if p == home {
            return false;
        }
        // Disallow direct top-level subfolders of home (e.g. ~/Library itself, ~/Desktop itself)
        let protected_home_dirs = [
            home.join("Desktop"),
            home.join("Documents"),
            home.join("Downloads"),
            home.join("Library"),
            home.join("Movies"),
            home.join("Music"),
            home.join("Pictures"),
        ];
        for ph in protected_home_dirs {
            if p == ph {
                return false;
            }
        }
    }

    true
}

/// Delete path by moving to Trash or direct removal
pub fn delete_path(path_str: &str, use_trash: bool) -> Result<(), String> {
    if !is_safe_to_delete(path_str) {
        return Err(format!("Safety guard: Refusing to delete protected path: {}", path_str));
    }

    let path = PathBuf::from(path_str);
    if !path.exists() {
        return Ok(());
    }

    if use_trash {
        match trash::delete(&path) {
            Ok(_) => Ok(()),
            Err(e) => {
                // Fallback to direct delete if trash fails (e.g. permission or special volume)
                direct_delete(&path).map_err(|err| format!("Trash & direct delete failed: {} / {}", e, err))
            }
        }
    } else {
        direct_delete(&path)
    }
}

fn direct_delete(path: &Path) -> Result<(), String> {
    if path.is_dir() {
        fs::remove_dir_all(path).map_err(|e| e.to_string())
    } else {
        fs::remove_file(path).map_err(|e| e.to_string())
    }
}
