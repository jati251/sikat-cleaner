use crate::cleaner::disk_util::{get_path_size, is_safe_to_delete};
use crate::cleaner::system_junk::build_summary;
use crate::models::{CleanItem, ScanSummary};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

pub fn scan_developer_junk() -> ScanSummary {
    let mut items: Vec<CleanItem> = Vec::new();
    let home = match dirs::home_dir() {
        Some(h) => h,
        None => return ScanSummary {
            total_items: 0,
            total_bytes: 0,
            categories: HashMap::new(),
            items: Vec::new(),
        },
    };

    // 1. Xcode DerivedData
    let derived_data = home.join("Library/Developer/Xcode/DerivedData");
    if derived_data.exists() {
        if let Ok(entries) = fs::read_dir(&derived_data) {
            for entry in entries.flatten() {
                let path = entry.path();
                let name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                if name.starts_with('.') {
                    continue;
                }
                let size = get_path_size(&path);
                if size > 1024 * 1024 {
                    let path_str = path.to_string_lossy().to_string();
                    let safe = is_safe_to_delete(&path_str);
                    items.push(CleanItem {
                        id: format!("xcode-dd-{}", name),
                        title: format!("Xcode DerivedData: {}", name),
                        category: "Xcode Junk".to_string(),
                        path: path_str,
                        size_bytes: size,
                        is_safe_to_delete: safe,
                        description: "Intermediary build artifacts, indexes, and logs from Xcode".to_string(),
                        icon: Some("hammer".to_string()),
                    });
                }
            }
        }
    }

    // 2. Xcode iOS DeviceSupport
    let device_support = home.join("Library/Developer/Xcode/iOS DeviceSupport");
    if device_support.exists() {
        let size = get_path_size(&device_support);
        if size > 1024 * 1024 {
            let path_str = device_support.to_string_lossy().to_string();
            items.push(CleanItem {
                id: "xcode-device-support".to_string(),
                title: "iOS Device Support Symbols".to_string(),
                category: "Xcode Junk".to_string(),
                path: path_str,
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Symbol files for previously connected physical iOS devices".to_string(),
                icon: Some("smartphone".to_string()),
            });
        }
    }

    // 3. Xcode CoreSimulator Caches
    let sim_cache = home.join("Library/Developer/CoreSimulator/Caches");
    if sim_cache.exists() {
        let size = get_path_size(&sim_cache);
        if size > 1024 * 1024 {
            let path_str = sim_cache.to_string_lossy().to_string();
            items.push(CleanItem {
                id: "xcode-simulator-cache".to_string(),
                title: "iOS Simulator Caches".to_string(),
                category: "Xcode Junk".to_string(),
                path: path_str,
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Runtime caches and runtime assets for iOS simulators".to_string(),
                icon: Some("monitor".to_string()),
            });
        }
    }

    // 4. CocoaPods & Carthage
    let cocoapods_cache = home.join("Library/Caches/CocoaPods");
    if cocoapods_cache.exists() {
        let size = get_path_size(&cocoapods_cache);
        if size > 1024 * 1024 {
            items.push(CleanItem {
                id: "cocoapods-cache".to_string(),
                title: "CocoaPods Cache".to_string(),
                category: "Package Managers".to_string(),
                path: cocoapods_cache.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Cached downloaded podspecs and git repository clones".to_string(),
                icon: Some("package".to_string()),
            });
        }
    }

    // 5. Android & Gradle Caches
    let gradle_cache = home.join(".gradle/caches");
    if gradle_cache.exists() {
        let size = get_path_size(&gradle_cache);
        if size > 1024 * 1024 {
            items.push(CleanItem {
                id: "gradle-cache".to_string(),
                title: "Gradle Dependency Cache".to_string(),
                category: "Package Managers".to_string(),
                path: gradle_cache.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Downloaded jars, aars, and build scripts in ~/.gradle".to_string(),
                icon: Some("code-2".to_string()),
            });
        }
    }

    let android_build_cache = home.join(".android/build-cache");
    if android_build_cache.exists() {
        let size = get_path_size(&android_build_cache);
        if size > 1024 * 1024 {
            items.push(CleanItem {
                id: "android-build-cache".to_string(),
                title: "Android Build Cache".to_string(),
                category: "Package Managers".to_string(),
                path: android_build_cache.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Android Studio / SDK build cache in ~/.android".to_string(),
                icon: Some("smartphone".to_string()),
            });
        }
    }

    // 6. Homebrew Cache
    let brew_cache = home.join("Library/Caches/Homebrew");
    if brew_cache.exists() {
        let size = get_path_size(&brew_cache);
        if size > 1024 * 1024 {
            items.push(CleanItem {
                id: "homebrew-cache".to_string(),
                title: "Homebrew Download Cache".to_string(),
                category: "Package Managers".to_string(),
                path: brew_cache.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Cached bottle downloads and git repositories in Homebrew".to_string(),
                icon: Some("beer".to_string()),
            });
        }
    }

    // 7. Rust Cargo Cache
    let cargo_registry_cache = home.join(".cargo/registry/cache");
    if cargo_registry_cache.exists() {
        let size = get_path_size(&cargo_registry_cache);
        if size > 1024 * 1024 {
            items.push(CleanItem {
                id: "cargo-registry-cache".to_string(),
                title: "Rust Cargo Crates Cache".to_string(),
                category: "Package Managers".to_string(),
                path: cargo_registry_cache.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Cached downloaded .crate archives in ~/.cargo/registry".to_string(),
                icon: Some("box".to_string()),
            });
        }
    }

    // 8. Node / NPM / PNPM / Yarn / Bun Caches
    let npm_cache = home.join(".npm/_cacache");
    if npm_cache.exists() {
        let size = get_path_size(&npm_cache);
        if size > 1024 * 1024 {
            items.push(CleanItem {
                id: "npm-cacache".to_string(),
                title: "NPM Global Cache".to_string(),
                category: "Package Managers".to_string(),
                path: npm_cache.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Locally cached npm packages and shasums in ~/.npm".to_string(),
                icon: Some("layers".to_string()),
            });
        }
    }

    let pnpm_cache = home.join("Library/Caches/pnpm");
    if pnpm_cache.exists() {
        let size = get_path_size(&pnpm_cache);
        if size > 1024 * 1024 {
            items.push(CleanItem {
                id: "pnpm-cache".to_string(),
                title: "PNPM Global Cache".to_string(),
                category: "Package Managers".to_string(),
                path: pnpm_cache.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Cached downloaded package tarballs for pnpm".to_string(),
                icon: Some("layers".to_string()),
            });
        }
    }

    let yarn_cache = home.join(".yarn/cache");
    if yarn_cache.exists() {
        let size = get_path_size(&yarn_cache);
        if size > 1024 * 1024 {
            items.push(CleanItem {
                id: "yarn-cache".to_string(),
                title: "Yarn Global Cache".to_string(),
                category: "Package Managers".to_string(),
                path: yarn_cache.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Cached packages in ~/.yarn/cache".to_string(),
                icon: Some("layers".to_string()),
            });
        }
    }

    // 9. Python / Pip
    let pip_cache = home.join("Library/Caches/pip");
    if pip_cache.exists() {
        let size = get_path_size(&pip_cache);
        if size > 1024 * 1024 {
            items.push(CleanItem {
                id: "pip-cache".to_string(),
                title: "Python Pip Cache".to_string(),
                category: "Package Managers".to_string(),
                path: pip_cache.to_string_lossy().to_string(),
                size_bytes: size,
                is_safe_to_delete: true,
                description: "Cached wheels and tarballs in ~/Library/Caches/pip".to_string(),
                icon: Some("terminal".to_string()),
            });
        }
    }

    build_summary(items)
}

/// Scan specific project directories for node_modules
pub fn scan_project_node_modules(root_path: &str) -> Vec<CleanItem> {
    let mut results = Vec::new();
    let root = Path::new(root_path);
    if !root.exists() || !root.is_dir() {
        return results;
    }

    // Search max 4 levels deep to find node_modules folders
    for entry in WalkDir::new(root)
        .min_depth(1)
        .max_depth(5)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            // Don't recurse inside .git or already found node_modules
            name != ".git" && (e.depth() == 0 || name != "node_modules")
        })
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_dir() && entry.file_name() == "node_modules" {
            let p = entry.path();
            let size = get_path_size(p);
            if size > 1024 * 1024 {
                let parent_name = p.parent().and_then(|pp| pp.file_name()).map(|f| f.to_string_lossy().to_string()).unwrap_or_else(|| "project".to_string());
                let path_str = p.to_string_lossy().to_string();
                results.push(CleanItem {
                    id: format!("node-modules-{}", path_str),
                    title: format!("node_modules in {}", parent_name),
                    category: "Project Dependencies".to_string(),
                    path: path_str,
                    size_bytes: size,
                    is_safe_to_delete: true,
                    description: format!("Can be safely re-installed with npm/pnpm/yarn install ({})", parent_name),
                    icon: Some("folder-git".to_string()),
                });
            }
        }
    }

    results
}
