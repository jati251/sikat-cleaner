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

export interface UninstallAppPayload {
  appPath: string;
  leftoverPaths: string[];
}

export type AppSortOption =
  | "size_desc"
  | "size_asc"
  | "name_asc"
  | "name_desc"
  | "leftovers_desc";
