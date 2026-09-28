import { useQuery } from "@tanstack/react-query";
import { safeInvoke } from "@/services/tauriClient";
import { ScanSummary } from "@/types";

export const SYSTEM_JUNK_QUERY_KEY = ["system-junk"] as const;

export function useSystemJunkQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: SYSTEM_JUNK_QUERY_KEY,
    queryFn: async () => {
      return await safeInvoke<ScanSummary>("scan_system_junk");
    },
    enabled,
    staleTime: 1000 * 60 * 3,
  });
}
