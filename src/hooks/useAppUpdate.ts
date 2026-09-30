import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  checkForAppUpdate,
  downloadAndInstallUpdate,
  relaunchApp,
  AppUpdateInfo,
} from "@/services/updaterService";

export const APP_UPDATE_QUERY_KEY = ["app-update"] as const;

export interface UseAppUpdateOptions {
  enabled?: boolean;
}

export function useAppUpdate(options: UseAppUpdateOptions = {}) {
  const { enabled = false } = options;
  const [downloadProgress, setDownloadProgress] = React.useState({ downloaded: 0, total: 0 });
  const [isReadyToRestart, setIsReadyToRestart] = React.useState(false);

  const query = useQuery<AppUpdateInfo, Error>({
    queryKey: APP_UPDATE_QUERY_KEY,
    queryFn: () => checkForAppUpdate(),
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      await downloadAndInstallUpdate((downloaded, total) => {
        setDownloadProgress({ downloaded, total });
      });
    },
    onSuccess: () => {
      setIsReadyToRestart(true);
    },
  });

  const restartMutation = useMutation({
    mutationFn: async () => {
      await relaunchApp();
    },
  });

  return {
    updateInfo: query.data ?? null,
    isChecking: query.isLoading || query.isFetching,
    checkError: query.error?.message ?? null,
    recheck: query.refetch,
    downloadUpdate: downloadMutation.mutateAsync,
    isDownloading: downloadMutation.isPending,
    downloadError: downloadMutation.error?.message ?? null,
    downloadProgress,
    isReadyToRestart,
    relaunch: restartMutation.mutateAsync,
    isRelaunching: restartMutation.isPending,
  };
}
