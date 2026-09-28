import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { safeInvoke } from "@/services/tauriClient";
import { AppItem } from "@/types";

export const APPLICATIONS_QUERY_KEY = ["applications"] as const;

export function useApplicationsQuery() {
  return useQuery({
    queryKey: APPLICATIONS_QUERY_KEY,
    queryFn: async () => {
      return await safeInvoke<AppItem[]>("scan_applications");
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUninstallAppMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appPath,
      leftoverPaths,
    }: {
      appPath: string;
      leftoverPaths: string[];
    }) => {
      return await safeInvoke<void>("uninstall_app", {
        appPath,
        leftoverPaths,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["system-junk"] });
      queryClient.invalidateQueries({ queryKey: ["smart-scan"] });
      queryClient.invalidateQueries({ queryKey: ["disk-stats"] });
    },
  });
}
