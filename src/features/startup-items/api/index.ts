import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { safeInvoke } from "@/services/tauriClient";
import { StartupItem } from "@/types";

export const STARTUP_ITEMS_QUERY_KEY = ["startup-items"] as const;

export function useStartupItemsQuery() {
  return useQuery({
    queryKey: STARTUP_ITEMS_QUERY_KEY,
    queryFn: async () => {
      return await safeInvoke<StartupItem[]>("scan_startup_items");
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useToggleStartupItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ path, enable }: { path: string; enable: boolean }) => {
      return await safeInvoke<void>("toggle_startup_item", { path, enable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STARTUP_ITEMS_QUERY_KEY });
    },
  });
}

export function useRemoveStartupItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (path: string) => {
      return await safeInvoke<void>("remove_startup_item", { path });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STARTUP_ITEMS_QUERY_KEY });
    },
  });
}
