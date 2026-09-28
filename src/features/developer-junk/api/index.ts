import { useQuery, useMutation } from "@tanstack/react-query";
import { safeInvoke } from "@/services/tauriClient";
import { ScanSummary, CleanItem } from "@/types";

export const DEVELOPER_JUNK_QUERY_KEY = ["developer-junk"] as const;

export function useDeveloperJunkQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: DEVELOPER_JUNK_QUERY_KEY,
    queryFn: async () => {
      return await safeInvoke<ScanSummary>("scan_developer_junk");
    },
    enabled,
    staleTime: 1000 * 60 * 3,
  });
}

export function useScanNodeModulesMutation() {
  return useMutation({
    mutationFn: async (rootPath: string) => {
      return await safeInvoke<CleanItem[]>("scan_project_node_modules", { rootPath });
    },
  });
}
