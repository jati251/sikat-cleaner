import { invoke } from "@tauri-apps/api/core";

/**
 * Checks if the code is executing inside a Tauri webview
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && Boolean("__TAURI_INTERNALS__" in window);
}

/**
 * Typesafe invoke wrapper with graceful fallback for dev/browser preview
 */
export async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauriEnvironment()) {
    return await invoke<T>(cmd, args);
  }

  // Fallback mocks for browser preview / development when running outside Tauri window
  console.warn(`[Tauri Mock] Command invoked in browser environment: ${cmd}`, args);
  return getMockDataForCommand<T>(cmd, args);
}

function getMockDataForCommand<T>(cmd: string, _args?: Record<string, unknown>): T {
  switch (cmd) {
    case "get_memory_stats":
      return {
        total_bytes: 17179869184, // 16 GB
        used_bytes: 10737418240,  // 10 GB
        free_bytes: 2147483648,   // 2 GB
        inactive_bytes: 4294967296, // 4 GB
        percentage_used: 62.5,
        cpu_usage: 18.4,
      } as unknown as T;

    case "get_disk_stats":
      return [
        {
          total_bytes: 500000000000,
          available_bytes: 185000000000,
          used_bytes: 315000000000,
          mount_point: "/",
          name: "Macintosh HD",
        },
      ] as unknown as T;

    case "scan_system_junk":
    case "run_smart_scan":
      return {
        total_items: 8,
        total_bytes: 4820000000,
        categories: {
          "User Application Caches": {
            category: "User Application Caches",
            total_bytes: 2650000000,
            count: 4,
            items: [
              {
                id: "user-cache-chrome",
                title: "Cache: Google Chrome",
                category: "User Application Caches",
                path: "/Users/user/Library/Caches/Google/Chrome",
                size_bytes: 1450000000,
                is_safe_to_delete: true,
                description: "Web assets, media caches, and scripts",
                icon: "app-cache",
              },
              {
                id: "user-cache-spotify",
                title: "Cache: Spotify Music",
                category: "User Application Caches",
                path: "/Users/user/Library/Caches/com.spotify.client",
                size_bytes: 820000000,
                is_safe_to_delete: true,
                description: "Cached offline tracks and album art",
                icon: "app-cache",
              },
              {
                id: "user-cache-slack",
                title: "Cache: Slack",
                category: "User Application Caches",
                path: "/Users/user/Library/Caches/com.tinyspeck.slackmacgap",
                size_bytes: 380000000,
                is_safe_to_delete: true,
                description: "Message media and workspace caches",
                icon: "app-cache",
              },
            ],
          },
          "System Logs": {
            category: "System Logs",
            total_bytes: 750000000,
            count: 2,
            items: [
              {
                id: "user-logs-all",
                title: "User Logs & Diagnostics",
                category: "System Logs",
                path: "/Users/user/Library/Logs",
                size_bytes: 520000000,
                is_safe_to_delete: true,
                description: "Application crash logs and debug traces",
                icon: "logs",
              },
              {
                id: "system-diag-reports",
                title: "Diagnostic Reports & Crash Dumps",
                category: "System Logs",
                path: "/Library/Logs/DiagnosticReports",
                size_bytes: 230000000,
                is_safe_to_delete: true,
                description: "macOS system crash and spin dumps",
                icon: "alert-circle",
              },
            ],
          },
          "Trash Bins": {
            category: "Trash Bins",
            total_bytes: 1420000000,
            count: 1,
            items: [
              {
                id: "macos-trash-bin",
                title: "Trash Bin",
                category: "Trash Bins",
                path: "/Users/user/.Trash",
                size_bytes: 1420000000,
                is_safe_to_delete: true,
                description: "Deleted files currently sitting in macOS Trash",
                icon: "trash-2",
              },
            ],
          },
        },
        items: [
          {
            id: "user-cache-chrome",
            title: "Cache: Google Chrome",
            category: "User Application Caches",
            path: "/Users/user/Library/Caches/Google/Chrome",
            size_bytes: 1450000000,
            is_safe_to_delete: true,
            description: "Web assets, media caches, and scripts",
          },
          {
            id: "user-cache-spotify",
            title: "Cache: Spotify Music",
            category: "User Application Caches",
            path: "/Users/user/Library/Caches/com.spotify.client",
            size_bytes: 820000000,
            is_safe_to_delete: true,
            description: "Cached offline tracks and album art",
          },
          {
            id: "macos-trash-bin",
            title: "Trash Bin",
            category: "Trash Bins",
            path: "/Users/user/.Trash",
            size_bytes: 1420000000,
            is_safe_to_delete: true,
            description: "Deleted files in macOS Trash",
          },
        ],
      } as unknown as T;

    case "scan_developer_junk":
      return {
        total_items: 5,
        total_bytes: 12400000000,
        categories: {
          "Xcode Junk": {
            category: "Xcode Junk",
            total_bytes: 7800000000,
            count: 2,
            items: [
              {
                id: "xcode-dd-1",
                title: "Xcode DerivedData: MyProject",
                category: "Xcode Junk",
                path: "/Users/user/Library/Developer/Xcode/DerivedData/MyProject",
                size_bytes: 5200000000,
                is_safe_to_delete: true,
                description: "Build indexes, intermediates, and module cache",
              },
              {
                id: "xcode-device-support",
                title: "iOS Device Support Symbols",
                category: "Xcode Junk",
                path: "/Users/user/Library/Developer/Xcode/iOS DeviceSupport",
                size_bytes: 2600000000,
                is_safe_to_delete: true,
                description: "Physical iOS device debug symbols",
              },
            ],
          },
          "Package Managers": {
            category: "Package Managers",
            total_bytes: 4600000000,
            count: 3,
            items: [
              {
                id: "homebrew-cache",
                title: "Homebrew Download Cache",
                category: "Package Managers",
                path: "/Users/user/Library/Caches/Homebrew",
                size_bytes: 2100000000,
                is_safe_to_delete: true,
                description: "Cached bottle downloads",
              },
              {
                id: "npm-cacache",
                title: "NPM Global Cache",
                category: "Package Managers",
                path: "/Users/user/.npm/_cacache",
                size_bytes: 1400000000,
                is_safe_to_delete: true,
                description: "Locally cached npm package tarballs",
              },
              {
                id: "cargo-registry-cache",
                title: "Rust Cargo Crates Cache",
                category: "Package Managers",
                path: "/Users/user/.cargo/registry/cache",
                size_bytes: 1100000000,
                is_safe_to_delete: true,
                description: "Cached .crate archives",
              },
            ],
          },
        },
        items: [],
      } as unknown as T;

    case "scan_applications":
      return [
        {
          id: "app-com.tinyspeck.slackmacgap",
          name: "Slack",
          bundle_id: "com.tinyspeck.slackmacgap",
          app_path: "/Applications/Slack.app",
          app_size: 420000000,
          leftovers_size: 1250000000,
          total_size: 1670000000,
          leftover_paths: [
            "/Users/user/Library/Application Support/Slack",
            "/Users/user/Library/Caches/com.tinyspeck.slackmacgap",
          ],
          version: "4.38.125",
        },
        {
          id: "app-com.spotify.client",
          name: "Spotify",
          bundle_id: "com.spotify.client",
          app_path: "/Applications/Spotify.app",
          app_size: 320000000,
          leftovers_size: 2100000000,
          total_size: 2420000000,
          leftover_paths: [
            "/Users/user/Library/Application Support/Spotify",
            "/Users/user/Library/Caches/com.spotify.client",
          ],
          version: "1.2.35",
        },
      ] as unknown as T;

    case "scan_startup_items":
      return [
        {
          id: "startup-google-keystone",
          name: "Google Keystone",
          path: "/Users/user/Library/LaunchAgents/com.google.keystone.agent.plist",
          label: "com.google.keystone.agent",
          scope: "User",
          is_enabled: true,
        },
        {
          id: "startup-spotify-webhelper",
          name: "Spotify Web Helper",
          path: "/Users/user/Library/LaunchAgents/com.spotify.webhelper.plist",
          label: "com.spotify.webhelper",
          scope: "User",
          is_enabled: false,
        },
      ] as unknown as T;

    case "scan_folder_lens": {
      const targetPath = ((_args?.target_path || _args?.targetPath) as string) || "/Users/user";

      if (targetPath.includes("Downloads")) {
        return {
          current_path: "/Users/user/Downloads",
          current_name: "Downloads",
          parent_path: "/Users/user",
          total_bytes: 18200000000,
          children: [
            {
              id: "file-xcode-dmg",
              name: "Xcode_16_Beta.dmg",
              path: "/Users/user/Downloads/Xcode_16_Beta.dmg",
              is_dir: false,
              size_bytes: 6200000000,
              extension: "dmg",
              file_type: "disk_image",
              last_modified: Date.now() / 1000 - 3600,
            },
            {
              id: "file-docker-dmg",
              name: "Docker.dmg",
              path: "/Users/user/Downloads/Docker.dmg",
              is_dir: false,
              size_bytes: 4100000000,
              extension: "dmg",
              file_type: "disk_image",
              last_modified: Date.now() / 1000 - 12000,
            },
            {
              id: "file-screencast",
              name: "Demo_Recording_4K.mov",
              path: "/Users/user/Downloads/Demo_Recording_4K.mov",
              is_dir: false,
              size_bytes: 3800000000,
              extension: "mov",
              file_type: "video",
              last_modified: Date.now() / 1000 - 86400,
            },
            {
              id: "file-archive-zip",
              name: "Large_Backup_Assets.zip",
              path: "/Users/user/Downloads/Large_Backup_Assets.zip",
              is_dir: false,
              size_bytes: 2500000000,
              extension: "zip",
              file_type: "archive",
              last_modified: Date.now() / 1000 - 180000,
            },
            {
              id: "file-node-pkg",
              name: "node-v22.4.0.pkg",
              path: "/Users/user/Downloads/node-v22.4.0.pkg",
              is_dir: false,
              size_bytes: 1600000000,
              extension: "pkg",
              file_type: "archive",
              last_modified: Date.now() / 1000 - 240000,
            },
          ],
        } as unknown as T;
      }

      if (targetPath.includes("Documents")) {
        return {
          current_path: "/Users/user/Documents",
          current_name: "Documents",
          parent_path: "/Users/user",
          total_bytes: 7400000000,
          children: [
            {
              id: "dir-work-docs",
              name: "Client_Projects",
              path: "/Users/user/Documents/Client_Projects",
              is_dir: true,
              size_bytes: 3900000000,
              item_count: 142,
              file_type: "folder",
              last_modified: Date.now() / 1000 - 7200,
            },
            {
              id: "dir-finances",
              name: "Financial_Reports",
              path: "/Users/user/Documents/Financial_Reports",
              is_dir: true,
              size_bytes: 2100000000,
              item_count: 48,
              file_type: "folder",
              last_modified: Date.now() / 1000 - 86400 * 3,
            },
            {
              id: "file-database-backup",
              name: "database_dump.sql",
              path: "/Users/user/Documents/database_dump.sql",
              is_dir: false,
              size_bytes: 1400000000,
              extension: "sql",
              file_type: "code",
              last_modified: Date.now() / 1000 - 86400 * 10,
            },
          ],
        } as unknown as T;
      }

      if (targetPath.includes("Library")) {
        return {
          current_path: "/Users/user/Library",
          current_name: "Library",
          parent_path: "/Users/user",
          total_bytes: 48500000000,
          children: [
            {
              id: "dir-caches",
              name: "Caches",
              path: "/Users/user/Library/Caches",
              is_dir: true,
              size_bytes: 24200000000,
              item_count: 890,
              file_type: "folder",
              last_modified: Date.now() / 1000 - 300,
            },
            {
              id: "dir-app-support",
              name: "Application Support",
              path: "/Users/user/Library/Application Support",
              is_dir: true,
              size_bytes: 16100000000,
              item_count: 1250,
              file_type: "folder",
              last_modified: Date.now() / 1000 - 1200,
            },
            {
              id: "dir-developer",
              name: "Developer",
              path: "/Users/user/Library/Developer",
              is_dir: true,
              size_bytes: 8200000000,
              item_count: 640,
              file_type: "folder",
              last_modified: Date.now() / 1000 - 600,
            },
          ],
        } as unknown as T;
      }

      if (targetPath.includes("CODE")) {
        return {
          current_path: "/Users/user/CODE",
          current_name: "CODE",
          parent_path: "/Users/user",
          total_bytes: 34700000000,
          children: [
            {
              id: "dir-personal",
              name: "PERSONAL",
              path: "/Users/user/CODE/PERSONAL",
              is_dir: true,
              size_bytes: 18400000000,
              item_count: 320,
              file_type: "folder",
              last_modified: Date.now() / 1000 - 3600,
            },
            {
              id: "dir-work",
              name: "work-projects",
              path: "/Users/user/CODE/work-projects",
              is_dir: true,
              size_bytes: 12100000000,
              item_count: 512,
              file_type: "folder",
              last_modified: Date.now() / 1000 - 7200,
            },
            {
              id: "dir-sandbox",
              name: "node-sandbox",
              path: "/Users/user/CODE/node-sandbox",
              is_dir: true,
              size_bytes: 4200000000,
              item_count: 140,
              file_type: "folder",
              last_modified: Date.now() / 1000 - 86400,
            },
          ],
        } as unknown as T;
      }

      if (targetPath.includes("PERSONAL")) {
        return {
          current_path: "/Users/user/CODE/PERSONAL",
          current_name: "PERSONAL",
          parent_path: "/Users/user/CODE",
          total_bytes: 18400000000,
          children: [
            {
              id: "dir-tauri",
              name: "tauri-projects",
              path: "/Users/user/CODE/PERSONAL/tauri-projects",
              is_dir: true,
              size_bytes: 9800000000,
              item_count: 4,
              file_type: "folder",
              last_modified: Date.now() / 1000 - 1800,
            },
            {
              id: "dir-react",
              name: "react-apps",
              path: "/Users/user/CODE/PERSONAL/react-apps",
              is_dir: true,
              size_bytes: 5200000000,
              item_count: 6,
              file_type: "folder",
              last_modified: Date.now() / 1000 - 9000,
            },
            {
              id: "dir-experiments",
              name: "experiments",
              path: "/Users/user/CODE/PERSONAL/experiments",
              is_dir: true,
              size_bytes: 3400000000,
              item_count: 12,
              file_type: "folder",
              last_modified: Date.now() / 1000 - 20000,
            },
          ],
        } as unknown as T;
      }

      return {
        current_path: "/Users/user",
        current_name: "user",
        parent_path: "/Users",
        total_bytes: 124500000000,
        children: [
          {
            id: "dir-library",
            name: "Library",
            path: "/Users/user/Library",
            is_dir: true,
            size_bytes: 48500000000,
            item_count: 4200,
            file_type: "folder",
            last_modified: Date.now() / 1000 - 100,
          },
          {
            id: "dir-code",
            name: "CODE",
            path: "/Users/user/CODE",
            is_dir: true,
            size_bytes: 34700000000,
            item_count: 972,
            file_type: "folder",
            last_modified: Date.now() / 1000 - 300,
          },
          {
            id: "dir-downloads",
            name: "Downloads",
            path: "/Users/user/Downloads",
            is_dir: true,
            size_bytes: 18200000000,
            item_count: 85,
            file_type: "folder",
            last_modified: Date.now() / 1000 - 1200,
          },
          {
            id: "dir-movies",
            name: "Movies",
            path: "/Users/user/Movies",
            is_dir: true,
            size_bytes: 12600000000,
            item_count: 14,
            file_type: "folder",
            last_modified: Date.now() / 1000 - 36000,
          },
          {
            id: "dir-documents",
            name: "Documents",
            path: "/Users/user/Documents",
            is_dir: true,
            size_bytes: 7400000000,
            item_count: 320,
            file_type: "folder",
            last_modified: Date.now() / 1000 - 4500,
          },
          {
            id: "file-installer-dmg",
            name: "Xcode_16_Beta.dmg",
            path: "/Users/user/Downloads/Xcode_16_Beta.dmg",
            is_dir: false,
            size_bytes: 3100000000,
            extension: "dmg",
            file_type: "disk_image",
            last_modified: Date.now() / 1000 - 86400,
          },
        ],
      } as unknown as T;
    }

    case "clean_items":
      return {
        success: true,
        reclaimed_bytes: 3820000000,
        deleted_count: 5,
        failed_items: [],
      } as unknown as T;

    case "purge_memory":
      return {
        total_bytes: 17179869184,
        used_bytes: 6442450944,
        free_bytes: 7516192768,
        inactive_bytes: 3221225472,
        percentage_used: 37.5,
        cpu_usage: 12.0,
      } as unknown as T;

    case "check_full_disk_access":
      return true as unknown as T;

    case "open_full_disk_access_settings":
      return undefined as unknown as T;

    default:
      return {} as T;
  }
}
