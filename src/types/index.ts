export type NavSection =
  | "smart-scan"
  | "system-junk"
  | "developer-junk"
  | "space-lens"
  | "app-manager"
  | "performance"
  | "startup-items";

export interface CleanItem {
  id: string;
  title: string;
  category: string;
  path: string;
  size_bytes: number;
  is_safe_to_delete: boolean;
  description: string;
  icon?: string;
  selected?: boolean;
}

export interface CategorySummary {
  category: string;
  total_bytes: number;
  count: number;
  items: CleanItem[];
}

export interface ScanSummary {
  total_items: number;
  total_bytes: number;
  categories: Record<string, CategorySummary>;
  items: CleanItem[];
}

export interface CleanResult {
  success: boolean;
  reclaimed_bytes: number;
  deleted_count: number;
  failed_items: string[];
}

export interface MemoryStats {
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
  inactive_bytes: number;
  percentage_used: number;
  cpu_usage: number;
}

export interface DiskStats {
  total_bytes: number;
  available_bytes: number;
  used_bytes: number;
  mount_point: string;
  name: string;
}

export interface AppItem {
  id: string;
  name: string;
  bundle_id: string;
  app_path: string;
  app_size: number;
  leftovers_size: number;
  total_size: number;
  leftover_paths: string[];
  version: string;
  icon?: string;
}

export interface StartupItem {
  id: string;
  name: string;
  path: string;
  label: string;
  scope: "User" | "System";
  is_enabled: boolean;
}

export interface LargeFileItem {
  id: string;
  name: string;
  path: string;
  size_bytes: number;
  extension: string;
  last_modified: number;
  file_type: "video" | "archive" | "document" | "disk_image" | "audio" | "code" | "other";
}

export interface LensNode {
  id: string;
  name: string;
  path: string;
  is_dir: boolean;
  size_bytes: number;
  item_count?: number;
  extension?: string;
  file_type: "folder" | "video" | "archive" | "document" | "disk_image" | "audio" | "code" | "other";
  last_modified: number;
}

export interface LensFolderResponse {
  current_path: string;
  current_name: string;
  parent_path?: string | null;
  total_bytes: number;
  children: LensNode[];
  permission_denied?: boolean;
  error_message?: string | null;
}
