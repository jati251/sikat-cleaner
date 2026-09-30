export interface StartupItem {
  id: string;
  name: string;
  path: string;
  label: string;
  scope: "User" | "System";
  is_enabled: boolean;
}

export interface ToggleStartupItemPayload {
  path: string;
  enable: boolean;
}

export type StartupSortOption =
  | "name_asc"
  | "name_desc"
  | "status_active"
  | "status_disabled"
  | "scope_user";
