import React from "react";
import { motion } from "motion/react";
import { useApplicationsQuery, useUninstallAppMutation } from "../api";
import { useAppStore } from "@/stores/useAppStore";
import { ViewHeader } from "@/components/ui/ViewHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { useOperationProgress } from "@/hooks/useOperationProgress";
import { formatBytes } from "@/utils/formatters";
import { revealInFinder } from "@/services/tauriClient";
import { AppItem } from "@/types";
import { Package, RefreshCw, Search, ExternalLink, Trash2, AlertTriangle, Layers } from "lucide-react";

export const AppManagerView: React.FC = () => {
  const { data: apps = [], isLoading, refetch, isRefetching } = useApplicationsQuery();
  const uninstallMutation = useUninstallAppMutation();
  const { setLastReclaimed } = useAppStore();

  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [appToUninstall, setAppToUninstall] = React.useState<AppItem | null>(null);

  const filteredApps = React.useMemo(() => {
    if (!searchQuery.trim()) return apps;
    const query = searchQuery.toLowerCase();
    return apps.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.bundle_id.toLowerCase().includes(query)
    );
  }, [apps, searchQuery]);

  const totalAppSize = React.useMemo(() => {
    return apps.reduce((acc, curr) => acc + curr.total_size, 0);
  }, [apps]);

  const { progress: uninstallProgress, currentStage: uninstallStage } = useOperationProgress({
    isRunning: uninstallMutation.isPending,
    stages: [
      `Closing active processes for ${appToUninstall?.name || "app"}...`,
      "Removing application bundle from /Applications...",
      "Sweeping Library remnants & Application Support...",
      "Cleaning preference plists and cached logs...",
      "Finalizing deep uninstallation...",
    ],
  });

  const handleConfirmUninstall = async () => {
    if (!appToUninstall) return;

    try {
      await uninstallMutation.mutateAsync({
        appPath: appToUninstall.app_path,
        leftoverPaths: appToUninstall.leftover_paths,
      });
      const reclaimed = appToUninstall.total_size;
      setAppToUninstall(null);
      setLastReclaimed(reclaimed);
      refetch();
    } catch (e) {
      console.error("Uninstall failed:", e);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-5 overflow-hidden relative">
      {/* Background Fetch / Rescan Progress Bar */}
      <TopProgressBar isLoading={isRefetching} color="indigo" />

      {/* Shared Header */}
      <ViewHeader
        icon={Package}
        iconColor="text-indigo-400"
        iconBg="bg-indigo-500/20 border-indigo-500/30"
        title="App Uninstaller & Leftover Cleaner"
        description="Completely remove applications along with leftover caches, preferences, and Library data."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isLoading || isRefetching}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Rescan
          </Button>
        }
      />

      {/* Search & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search installed applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>{apps.length} Applications Detected</span>
          <span className="text-indigo-300 font-bold">Total: {formatBytes(totalAppSize)}</span>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading || isRefetching ? (
          <LoadingState
            title="Scanning Installed Applications"
            label="Reading /Applications directory..."
            stages={[
              "Reading /Applications and ~/Applications...",
              "Parsing Info.plist bundle signatures & versions...",
              "Analyzing Application Support & Cache footprints...",
              "Calculating leftover storage usage...",
              "Finalizing application catalog...",
            ]}
            accentColor="indigo"
            icon={Package}
          />
        ) : filteredApps.length === 0 ? (
          <EmptyState
            title="No matching applications found"
            description="Try searching with a different application or bundle name."
          />
        ) : (
          filteredApps.map((app, idx) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.25) }}
              whileHover={{ x: 3, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-slate-900/40 hover:border-white/10 transition-colors duration-150"
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex-shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100 truncate">
                      {app.name}
                    </span>
                    <Badge variant="neutral">v{app.version}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                    {app.bundle_id}
                  </p>
                  {app.leftovers_size > 0 && (
                    <p className="text-[11px] text-amber-400/90 mt-0.5">
                      Includes {formatBytes(app.leftovers_size)} of associated leftover data
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-indigo-300 block">
                    {formatBytes(app.total_size)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    App: {formatBytes(app.app_size)}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  title="Reveal in macOS Finder"
                  onClick={() => revealInFinder(app.app_path)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                </motion.button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setAppToUninstall(app)}
                  className="px-3"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Deep Uninstall
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Confirmation & Progress Modal */}
      {appToUninstall && (
        <Modal
          isOpen={Boolean(appToUninstall)}
          onClose={() => {
            if (!uninstallMutation.isPending) setAppToUninstall(null);
          }}
          title={
            uninstallMutation.isPending
              ? "Deep Uninstalling Application"
              : `Completely Uninstall ${appToUninstall.name}?`
          }
        >
          {uninstallMutation.isPending ? (
            <div className="py-6 flex flex-col items-center text-center space-y-4">
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-500/30 absolute"
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Trash2 className="h-6 w-6 animate-pulse" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Uninstalling {appToUninstall.name}
                </h4>
                <p className="text-xs text-indigo-300 font-mono h-4">
                  {uninstallStage}
                </p>
              </div>

              <div className="w-full space-y-1.5 pt-2">
                <ProgressBar value={uninstallProgress} color="indigo" size="md" />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Deep clean in progress</span>
                  <span className="text-indigo-300 font-bold">{uninstallProgress}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-400" />
                <span>
                  The application bundle and all its associated preference files, caches, and Library state will be moved to the Trash.
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Items to be removed:
                </span>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1 font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto">
                  <div>• {appToUninstall.app_path} ({formatBytes(appToUninstall.app_size)})</div>
                  {appToUninstall.leftover_paths.map((p) => (
                    <div key={p}>• {p}</div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setAppToUninstall(null)}
                  disabled={uninstallMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleConfirmUninstall}
                  isLoading={uninstallMutation.isPending}
                >
                  Uninstall & Clean ({formatBytes(appToUninstall.total_size)})
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
