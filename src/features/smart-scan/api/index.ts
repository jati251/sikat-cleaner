import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { safeInvoke } from "@/services/tauriClient";
import { ScanSummary, CleanResult } from "@/types";

export const SMART_SCAN_QUERY_KEY = ["smart-scan"] as const;

export function useSmartScanQuery(enabled: boolean = false) {
  return useQuery({
    queryKey: SMART_SCAN_QUERY_KEY,
    queryFn: async () => {
      return await safeInvoke<ScanSummary>("run_smart_scan");
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useCleanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paths, useTrash = true }: { paths: string[]; useTrash?: boolean }) => {
      return await safeInvoke<CleanResult>("clean_items", { paths, useTrash });
    },
    onSuccess: () => {
      // Invalidate scans and memory stats
      queryClient.invalidateQueries({ queryKey: SMART_SCAN_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["system-junk"] });
      queryClient.invalidateQueries({ queryKey: ["developer-junk"] });
      queryClient.invalidateQueries({ queryKey: ["memory-stats"] });
      queryClient.invalidateQueries({ queryKey: ["disk-stats"] });
    },
  });
}
