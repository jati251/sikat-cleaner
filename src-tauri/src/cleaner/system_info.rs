use crate::models::{DiskStats, MemoryStats};
use std::process::Command;
use sysinfo::{Disks, System};

pub fn get_memory_stats() -> MemoryStats {
    let mut sys = System::new_all();
    sys.refresh_memory();
    sys.refresh_cpu_all();

    let total = sys.total_memory();
    let used = sys.used_memory();
    let free = sys.free_memory();
    let available = sys.available_memory();
    let inactive = if available > free { available - free } else { 0 };

    let percentage = if total > 0 {
        (used as f64 / total as f64) * 100.0
    } else {
        0.0
    };

    let cpu_usage = sys.global_cpu_usage();

    MemoryStats {
        total_bytes: total,
        used_bytes: used,
        free_bytes: free,
        inactive_bytes: inactive,
        percentage_used: percentage,
        cpu_usage,
    }
}

pub fn get_disk_stats() -> Vec<DiskStats> {
    let disks = Disks::new_with_refreshed_list();
    let mut results = Vec::new();

    for disk in disks.list() {
        let mount_point = disk.mount_point().to_string_lossy().to_string();
        // Focus on root "/" or user volumes
        if mount_point == "/" || mount_point.starts_with("/Volumes") {
            let total = disk.total_space();
            let available = disk.available_space();
            let used = if total > available { total - available } else { 0 };
            let name = disk.name().to_string_lossy().to_string();

            results.push(DiskStats {
                total_bytes: total,
                available_bytes: available,
                used_bytes: used,
                mount_point,
                name: if name.is_empty() { "Macintosh HD".to_string() } else { name },
            });
        }
    }

    results
}

/// Run macOS purge command to safely release inactive memory cache
pub fn purge_memory() -> Result<MemoryStats, String> {
    let _ = Command::new("/usr/sbin/purge").status();
    // Return updated stats after purge
    Ok(get_memory_stats())
}

/// Flush macOS DNS cache
pub fn flush_dns_cache() -> Result<String, String> {
    let out = Command::new("dscacheutil")
        .arg("-flushcache")
        .output()
        .map_err(|e| e.to_string())?;

    if out.status.success() {
        // Also killall -HUP mDNSResponder if possible
        let _ = Command::new("killall")
            .args(["-HUP", "mDNSResponder"])
            .output();

        Ok("DNS cache flushed successfully".to_string())
    } else {
        Err(String::from_utf8_lossy(&out.stderr).to_string())
    }
}

/// Reveal item in macOS Finder
pub fn reveal_in_finder(path: &str) -> Result<(), String> {
    Command::new("open")
        .args(["-R", path])
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}
