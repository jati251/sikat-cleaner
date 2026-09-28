import { useQuery } from "@tanstack/react-query";
import { safeInvoke } from "@/services/tauriClient";
import { LargeFileItem, LensFolderResponse } from "@/types";

export const LARGE_FILES_QUERY_KEY = ["large-files"] as const;
export const FOLDER_LENS_QUERY_KEY = ["folder-lens"] as const;

export function useLargeFilesQuery(targetDir?: string, minSizeMb: number = 50) {
  return useQuery({
    queryKey: [...LARGE_FILES_QUERY_KEY, targetDir, minSizeMb],
    queryFn: async () => {
      return await safeInvoke<LargeFileItem[]>("scan_large_files", {
        targetDir: targetDir || null,
        minSizeMb,
      });
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useFolderLensQuery(targetPath?: string) {
  return useQuery({
    queryKey: [...FOLDER_LENS_QUERY_KEY, targetPath],
    queryFn: async () => {
      return await safeInvoke<LensFolderResponse>("scan_folder_lens", {
        targetPath: targetPath || null,
      });
    },
    staleTime: 1000 * 60 * 2,
  });
}
