use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanItem {
    pub id: String,
    pub title: String,
    pub category: String,
    pub path: String,
    pub size_bytes: u64,
    pub is_safe_to_delete: bool,
    pub description: String,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategorySummary {
    pub category: String,
    pub total_bytes: u64,
    pub count: usize,
    pub items: Vec<CleanItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanSummary {
    pub total_items: usize,
    pub total_bytes: u64,
    pub categories: HashMap<String, CategorySummary>,
    pub items: Vec<CleanItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanResult {
    pub success: bool,
    pub reclaimed_bytes: u64,
    pub deleted_count: usize,
    pub failed_items: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryStats {
    pub total_bytes: u64,
    pub used_bytes: u64,
    pub free_bytes: u64,
    pub inactive_bytes: u64,
    pub percentage_used: f64,
    pub cpu_usage: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskStats {
    pub total_bytes: u64,
    pub available_bytes: u64,
    pub used_bytes: u64,
    pub mount_point: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppItem {
    pub id: String,
    pub name: String,
    pub bundle_id: String,
    pub app_path: String,
    pub app_size: u64,
    pub leftovers_size: u64,
    pub total_size: u64,
    pub leftover_paths: Vec<String>,
    pub version: String,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartupItem {
    pub id: String,
    pub name: String,
    pub path: String,
    pub label: String,
    pub scope: String, // "User" or "System"
    pub is_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LargeFileItem {
    pub id: String,
    pub name: String,
    pub path: String,
    pub size_bytes: u64,
    pub extension: String,
    pub last_modified: i64,
    pub file_type: String, // "video", "archive", "document", "disk_image", "audio", "code", "other"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LensNode {
    pub id: String,
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size_bytes: u64,
    pub item_count: Option<usize>,
    pub extension: Option<String>,
    pub file_type: String, // "folder", "video", "archive", "document", "disk_image", "audio", "code", "other"
    pub last_modified: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LensFolderResponse {
    pub current_path: String,
    pub current_name: String,
    pub parent_path: Option<String>,
    pub total_bytes: u64,
    pub children: Vec<LensNode>,
}
