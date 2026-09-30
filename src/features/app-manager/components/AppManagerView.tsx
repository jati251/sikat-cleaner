import React from "react";
import { useApplicationsQuery, useUninstallAppMutation } from "../api";
import { AppItem, AppSortOption } from "../types";
import { useAppStore } from "@/stores/useAppStore";
import { ViewHeader } from "@/components/ui/ViewHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { formatBytes } from "@/utils/formatters";
import { revealInFinder } from "@/services/tauriClient";
import {
  Package,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Layers,
  ArrowUpDown,
} from "lucide-react";

export const AppManagerView: React.FC = () => {
  const { data: apps = [], isLoading, refetch, isRefetching } = useApplicationsQuery();
  const uninstallMutation = useUninstallAppMutation();
  const setLastReclaimed = useAppStore((state) => state.setLastReclaimed);

  const [searchQuery, setSearchQuery] = React.useState<string>("" );
  const [sortBy, setSortBy] = React.useState<AppSortOption>("size_desc");
  const [appToUninstall, setAppToUninstall] = React.useState<AppItem | null>(null);

  const filteredAndSortedApps = React.useMemo(() => {
    let result = apps;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.bundle_id.toLowerCase().includes(query)
      );
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "size_desc":
          return b.total_size - a.total_size;
        case "size_asc":
          return a.total_size - b.total_size;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "leftovers_desc":
          return b.leftovers_size - a.leftovers_size;
        default:
          return 0;
      }
    });
  }, [apps, searchQuery, sortBy]);

  const totalAppSize = React.useMemo(() => {
    return apps.reduce((acc, curr) => acc + curr.total_size, 0);
  }, [apps]);

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
    <div className="h-full flex flex-col p-4 sm:p-5 space-y-4 overflow-hidden relative font-['VT323']">
      {/* Background Fetch / Rescan Progress Bar */}
      <TopProgressBar isLoading={isRefetching} />

      {/* Header */}
      <ViewHeader
        icon={Package}
        iconColor="text-[#00f0ff]"
        iconBg="bg-[#0e131b] border-[#2a3b50]"
        title="APPLICATION UNINSTALLER"
        description="Completely remove applications along with orphaned caches, plist preferences, and Application Support."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isLoading || isRefetching}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            RE-SCAN
          </Button>
        }
      />

      {/* Search, Sort & Stats Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#506882]" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e131b] border-2 border-[#2a3b50] pl-9 pr-3 py-1.5 text-lg text-[#e2f1f8] placeholder-[#506882] focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-[#0e131b] border-2 border-[#2a3b50] px-2.5 py-1 text-base text-[#e2f1f8] flex-shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5 text-[#00f0ff]" />
            <span className="text-xs text-[#506882] font-['Press_Start_2P'] uppercase">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as AppSortOption)}
              className="bg-transparent text-[#00f0ff] text-base focus:outline-none cursor-pointer"
            >
              <option value="size_desc" className="bg-[#0e131b] text-[#e2f1f8]">SIZE (LARGEST)</option>
              <option value="size_asc" className="bg-[#0e131b] text-[#e2f1f8]">SIZE (SMALLEST)</option>
              <option value="name_asc" className="bg-[#0e131b] text-[#e2f1f8]">NAME (A-Z)</option>
              <option value="name_desc" className="bg-[#0e131b] text-[#e2f1f8]">NAME (Z-A)</option>
              <option value="leftovers_desc" className="bg-[#0e131b] text-[#e2f1f8]">LEFTOVERS (LARGEST)</option>
            </select>
          </div>
        </div>

        {/* Global Summary Count & Total */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-base text-[#e2f1f8] flex-shrink-0">
          <span>[{apps.length} APPS DETECTED]</span>
          <span className="text-[#00f0ff] font-bold text-lg">TOTAL: {formatBytes(totalAppSize)}</span>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading || isRefetching ? (
          <LoadingState
            title="SCANNING APPLICATIONS"
            label="Reading /Applications and parsing bundle trees..."
            stages={[
              "Reading /Applications and ~/Applications...",
              "Parsing Info.plist bundle signatures & versions...",
              "Analyzing Application Support & Cache footprints...",
              "Calculating leftover storage usage...",
              "Finalizing application catalog...",
            ]}
          />
        ) : filteredAndSortedApps.length === 0 ? (
          <EmptyState
            title="NO MATCHING APPS"
            description="Try searching with a different application or bundle name."
          />
        ) : (
          filteredAndSortedApps.map((app) => (
            <div
              key={app.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-2 border-[#2a3b50] bg-[#182230] hover:border-[#506882] shadow-[2px_2px_0_#06101a] transition-all gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 pr-0 sm:pr-4 flex-1">
                <div className="p-2 border border-[#2a3b50] bg-[#0e131b] text-[#00f0ff] flex-shrink-0">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg text-[#e2f1f8] truncate">
                      {app.name}
                    </span>
                    <Badge variant="neutral">v{app.version}</Badge>
                  </div>
                  <p className="text-xs text-[#506882] truncate font-mono">
                    {app.bundle_id}
                  </p>
                  {app.leftovers_size > 0 && (
                    <p className="text-sm text-[#00ff88] mt-0.5">
                      INCLUDES {formatBytes(app.leftovers_size)} ASSOCIATED LEFTOVERS
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 border-t sm:border-t-0 border-[#2a3b50]/60 pt-2 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="text-lg font-bold text-[#00f0ff] block">
                    {formatBytes(app.total_size)}
                  </span>
                  <span className="text-xs text-[#506882] block font-mono">
                    App: {formatBytes(app.app_size)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Reveal in Finder"
                    onClick={() => revealInFinder(app.app_path)}
                    className="p-1 border border-[#2a3b50] bg-[#0e131b] text-[#506882] hover:text-[#00f0ff] hover:border-[#00f0ff] cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setAppToUninstall(app)}
                    className="px-3 shadow-[2px_2px_0_#380817]"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    UNINSTALL
                  </Button>
                </div>
              </div>
            </div>
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
              ? "DEEP UNINSTALLING APPLICATION"
              : `UNINSTALL: ${appToUninstall.name}`
          }
        >
          {uninstallMutation.isPending ? (
            <div className="py-4 flex flex-col items-center text-center space-y-3 font-['VT323']">
              <div className="data-state-blocks mb-2">
                <i />
                <i />
                <i />
              </div>
              <span className="text-xs font-['Press_Start_2P'] uppercase text-[#ff2a6d]">
                DELETING BUNDLE & RESIDUALS...
              </span>
              <p className="text-lg text-[#e2f1f8]">
                Purging {appToUninstall.name} and {appToUninstall.leftover_paths.length} residual items
              </p>
              <div className="w-full max-w-xs pt-2">
                <ProgressBar indeterminate color="rose" size="sm" />
              </div>
            </div>
          ) : (
            <div className="space-y-4 font-['VT323'] text-left">
              <div className="p-3 border-2 border-[#ffb703] bg-[#0e131b] flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-[#ffb703] flex-shrink-0 mt-0.5" />
                <div className="text-base text-[#e2f1f8]">
                  <strong className="text-[#ffb703] font-['Press_Start_2P'] text-[10px] uppercase block mb-1">
                    WARNING: ACTION CANNOT BE UNDONE
                  </strong>
                  You are about to completely remove this application and all associated user data, caches, and preferences.
                </div>
              </div>

              <div className="space-y-2 text-base text-[#e2f1f8]">
                <div className="flex justify-between border-b border-[#2a3b50] pb-1">
                  <span className="text-[#506882]">APP BUNDLE:</span>
                  <span className="text-right truncate font-mono text-sm max-w-xs">{appToUninstall.app_path}</span>
                </div>
                <div className="flex justify-between border-b border-[#2a3b50] pb-1">
                  <span className="text-[#506882]">MAIN SIZE:</span>
                  <span className="text-[#00f0ff]">{formatBytes(appToUninstall.app_size)}</span>
                </div>
                <div className="flex justify-between border-b border-[#2a3b50] pb-1">
                  <span className="text-[#506882]">LEFTOVER RESIDUALS:</span>
                  <span className="text-[#00ff88]">{formatBytes(appToUninstall.leftovers_size)} ({appToUninstall.leftover_paths.length} files/dirs)</span>
                </div>
                <div className="flex justify-between pt-1 text-lg font-bold">
                  <span className="text-[#e2f1f8]">TOTAL RECLAIMABLE:</span>
                  <span className="text-[#00f0ff]">{formatBytes(appToUninstall.total_size)}</span>
                </div>
              </div>

              {appToUninstall.leftover_paths.length > 0 && (
                <div className="p-2 border border-[#2a3b50] bg-[#0e131b] max-h-28 overflow-y-auto space-y-1">
                  <span className="text-xs text-[#506882] font-['Press_Start_2P'] uppercase block">
                    DETECTED RESIDUAL PATHS:
                  </span>
                  {appToUninstall.leftover_paths.map((p) => (
                    <div key={p} className="text-xs text-[#88a7be] font-mono truncate">
                      • {p}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#2a3b50]">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setAppToUninstall(null)}
                >
                  CANCEL
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleConfirmUninstall}
                  className="px-5 shadow-[3px_3px_0_#380817]"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  CONFIRM UNINSTALL ({formatBytes(appToUninstall.total_size)})
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
