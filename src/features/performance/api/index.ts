import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { safeInvoke } from "@/services/tauriClient";
import { MemoryStats, DiskStats } from "@/types";

export const MEMORY_STATS_QUERY_KEY = ["memory-stats"] as const;
export const DISK_STATS_QUERY_KEY = ["disk-stats"] as const;

export function useMemoryStatsQuery() {
  return useQuery({
    queryKey: MEMORY_STATS_QUERY_KEY,
    queryFn: async () => {
      return await safeInvoke<MemoryStats>("get_memory_stats");
    },
    refetchInterval: 3000, // Poll memory every 3 seconds for live dashboard
  });
}

export function useDiskStatsQuery() {
  return useQuery({
    queryKey: DISK_STATS_QUERY_KEY,
    queryFn: async () => {
      return await safeInvoke<DiskStats[]>("get_disk_stats");
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function usePurgeMemoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await safeInvoke<MemoryStats>("purge_memory");
    },
    onSuccess: (updatedStats) => {
      queryClient.setQueryData(MEMORY_STATS_QUERY_KEY, updatedStats);
    },
  });
}

export function useFlushDnsMutation() {
  return useMutation({
    mutationFn: async () => {
      return await safeInvoke<string>("flush_dns_cache");
    },
  });
}
