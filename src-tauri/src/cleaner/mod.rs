pub mod apps;
pub mod dev_junk;
pub mod disk_util;
pub mod large_files;
pub mod lens;
pub mod startup;
pub mod system_info;
pub mod system_junk;

use crate::cleaner::disk_util::delete_path;
use crate::models::{CleanItem, CleanResult, ScanSummary};

pub fn run_smart_scan() -> ScanSummary {
    let sys_summary = system_junk::scan_system_junk();
    let dev_summary = dev_junk::scan_developer_junk();

    let mut combined_items: Vec<CleanItem> = Vec::new();
    combined_items.extend(sys_summary.items);
    combined_items.extend(dev_summary.items);

    system_junk::build_summary(combined_items)
}

pub fn clean_items(paths: Vec<String>, use_trash: bool) -> CleanResult {
    let mut reclaimed_bytes: u64 = 0;
    let mut deleted_count: usize = 0;
    let mut failed_items: Vec<String> = Vec::new();

    for path_str in paths {
        let size = disk_util::get_path_size(&path_str);
        match delete_path(&path_str, use_trash) {
            Ok(_) => {
                reclaimed_bytes += size;
                deleted_count += 1;
            }
            Err(e) => {
                failed_items.push(format!("{}: {}", path_str, e));
            }
        }
    }

    CleanResult {
        success: failed_items.is_empty(),
        reclaimed_bytes,
        deleted_count,
        failed_items,
    }
}
