import React from "react";
import { useFolderLensQuery, useLargeFilesQuery, useFullDiskAccessQuery } from "../api";
import { useCleanMutation } from "@/features/smart-scan/api";
import { useAppStore } from "@/stores/useAppStore";
import { ViewHeader } from "@/components/ui/ViewHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { OperationProgressModal } from "@/components/ui/OperationProgressModal";
import { useOperationProgress } from "@/hooks/useOperationProgress";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatBytes } from "@/utils/formatters";
import { openFullDiskAccessSettings } from "@/services/tauriClient";
import { LensNode } from "@/types";
import { SpaceLensBubbleMap } from "./SpaceLensBubbleMap";
import { SpaceLensBreadcrumbs } from "./SpaceLensBreadcrumbs";
import { SpaceLensDetailSidebar } from "./SpaceLensDetailSidebar";
import { SpaceLensPermissionDenied } from "./SpaceLensPermissionDenied";
import { SpaceLensLargeFilesList } from "./SpaceLensLargeFilesList";
import {
  PieChart,
  RefreshCw,
  CircleDot,
  ListFilter,
  AlertTriangle,
  FolderX,
  ExternalLink,
  Trash2,
} from "lucide-react";

export const SpaceLensView: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<"bubble" | "list">("bubble");
  const [currentPath, setCurrentPath] = React.useState<string | undefined>(undefined);
  const [selectedNode, setSelectedNode] = React.useState<LensNode | null>(null);
  const [nodeToDelete, setNodeToDelete] = React.useState<LensNode | null>(null);
  const [minSizeMb, setMinSizeMb] = React.useState<number>(50);

  const { data: hasFullDiskAccess = true, refetch: refetchFda } = useFullDiskAccessQuery();
  const cleanMutation = useCleanMutation();
  const { setLastReclaimed } = useAppStore();

  const {
    data: folderData,
    isLoading: isFolderLoading,
    refetch: refetchFolder,
    isRefetching: isFolderRefetching,
    error: folderError,
    isError: isFolderError,
  } = useFolderLensQuery(currentPath);

  const {
    data: largeFiles = [],
    isLoading: isListLoading,
    refetch: refetchList,
    isRefetching: isListRefetching,
  } = useLargeFilesQuery(undefined, minSizeMb);

  const isPermissionDenied = Boolean(
    folderData?.permission_denied ||
    (folderError && String(folderError).toLowerCase().includes("permission")) ||
    (folderError && String(folderError).toLowerCase().includes("operation not permitted"))
  );

  const hasFolderError = Boolean(
    isFolderError ||
    (folderData?.error_message && !folderData?.permission_denied)
  );

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setSelectedNode(null);
  };

  const handleNavigateUp = () => {
    if (folderData?.parent_path) {
      setCurrentPath(folderData.parent_path);
      setSelectedNode(null);
    }
  };

  const handleDiveIn = (node: LensNode) => {
    if (node.is_dir) {
      setCurrentPath(node.path);
      setSelectedNode(null);
    }
  };

  const handleRescanFolder = () => {
    refetchFolder();
    refetchFda();
  };

  const { progress: deleteProgress, currentStage: deleteStage } = useOperationProgress({
    isRunning: cleanMutation.isPending,
    stages: [
      "Checking filesystem item locks...",
      "Moving item(s) to macOS Trash...",
      "Re-indexing storage bubble trees...",
      "Complete!",
    ],
  });

  const handleConfirmDeleteNode = async () => {
    if (!nodeToDelete) return;
    try {
      const res = await cleanMutation.mutateAsync({
        paths: [nodeToDelete.path],
        useTrash: true,
      });
      setLastReclaimed(res.reclaimed_bytes);
      setNodeToDelete(null);
      setSelectedNode(null);
      refetchFolder();
    } catch (e) {
      console.error("Delete node error:", e);
    }
  };

  const handleDeleteSelectedLargeFiles = async (paths: string[]) => {
    try {
      const res = await cleanMutation.mutateAsync({
        paths,
        useTrash: true,
      });
      setLastReclaimed(res.reclaimed_bytes);
      refetchList();
    } catch (e) {
      console.error("Delete large files error:", e);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-4 overflow-hidden relative">
      {/* Background Fetch / Rescan Progress Bar */}
      <TopProgressBar
        isLoading={isFolderRefetching || isListRefetching}
        color="rose"
      />

      {/* Delete Progress Modal */}
      <OperationProgressModal
        isOpen={cleanMutation.isPending}
        title="Moving to macOS Trash"
        stage={deleteStage}
        progress={deleteProgress}
        color="rose"
        icon={Trash2}
        subdetail={nodeToDelete ? nodeToDelete.path : undefined}
      />

      {/* Top Header */}
      <ViewHeader
        icon={PieChart}
        iconColor="text-pink-400"
        iconBg="bg-pink-500/20 border-pink-500/30"
        title={
          <>
            Space Lens
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono border border-pink-500/30 font-medium">
              Interactive Visualizer
            </span>
          </>
        }
        description="Interactive circle-packing bubble map. Click bubbles to inspect sizes and dive into folders."
        actions={
          <>
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setViewMode("bubble")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "bubble"
                    ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CircleDot className="h-3.5 w-3.5" />
                Bubble Map
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "list"
                    ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ListFilter className="h-3.5 w-3.5" />
                Large Files List
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => (viewMode === "bubble" ? handleRescanFolder() : refetchList())}
              isLoading={
                viewMode === "bubble"
                  ? isFolderLoading || isFolderRefetching
                  : isListLoading || isListRefetching
              }
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Rescan
            </Button>
          </>
        }
      />

      {/* VIEW MODE 1: Interactive Bubble Map */}
      {viewMode === "bubble" && (
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          <SpaceLensBreadcrumbs
            currentPath={folderData?.current_path || "/"}
            parentPath={folderData?.parent_path}
            onNavigate={handleNavigate}
            onNavigateUp={handleNavigateUp}
            isLoading={isFolderLoading}
          />

          {!hasFullDiskAccess && !isPermissionDenied && (
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex-shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Full Disk Access recommended:</strong> macOS requires permission to scan system caches and user documents.
                </span>
              </div>
              <button
                onClick={openFullDiskAccessSettings}
                className="text-amber-300 hover:text-white font-semibold underline underline-offset-2 ml-3 flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                <span>Grant in Settings</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex-1 flex items-stretch gap-4 min-h-0 overflow-hidden">
            <div className="flex-1 h-full min-h-0 relative">
              {isFolderLoading || isFolderRefetching ? (
                <LoadingState
                  title="Analyzing Space Lens"
                  label={`Scanning storage in ${currentPath || "Home"}...`}
                  stages={[
                    `Traversing directory hierarchy for ${currentPath || "Home"}...`,
                    "Aggregating file sizes and subdirectory weights...",
                    "Computing D3 packing algorithm coordinates...",
                    "Generating interactive visual storage bubbles...",
                  ]}
                  accentColor="rose"
                  icon={PieChart}
                />
              ) : isPermissionDenied ? (
                <SpaceLensPermissionDenied
                  currentPath={folderData?.current_path || currentPath}
                  onRescan={handleRescanFolder}
                  onGoHome={() => handleNavigate("~")}
                />
              ) : hasFolderError ? (
                <div className="h-full w-full rounded-3xl border border-white/10 bg-slate-950/80 flex flex-col items-center justify-center text-center p-6 gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <FolderX className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Cannot Read Folder</h3>
                  <p className="text-xs text-slate-400 max-w-sm font-mono">
                    {folderData?.error_message || (folderError ? String(folderError) : "An unknown error occurred")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="secondary" size="sm" onClick={handleRescanFolder}>
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Retry
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleNavigate("~")}>
                      Go to Home
                    </Button>
                  </div>
                </div>
              ) : (
                <SpaceLensBubbleMap
                  nodes={folderData?.children || []}
                  totalBytes={folderData?.total_bytes || 0}
                  currentPath={folderData?.current_path || "/"}
                  selectedNodeId={selectedNode?.id || null}
                  onSelectNode={(node) => setSelectedNode(node)}
                  onDiveIn={handleDiveIn}
                />
              )}
            </div>

            <SpaceLensDetailSidebar
              selectedNode={selectedNode}
              totalBytes={folderData?.total_bytes || 0}
              itemCount={folderData?.children?.length || 0}
              currentName={folderData?.current_name || "Root"}
              currentPath={folderData?.current_path || "/"}
              onDiveIn={handleDiveIn}
              onDeleteNode={(node) => setNodeToDelete(node)}
              isDeleting={cleanMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Large Files List */}
      {viewMode === "list" && (
        <SpaceLensLargeFilesList
          files={largeFiles}
          isLoading={isListLoading || isListRefetching}
          minSizeMb={minSizeMb}
          onMinSizeChange={setMinSizeMb}
          onDeleteSelected={handleDeleteSelectedLargeFiles}
          isDeleting={cleanMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {nodeToDelete && (
        <Modal
          isOpen={Boolean(nodeToDelete)}
          onClose={() => setNodeToDelete(null)}
          title={`Move ${nodeToDelete.name} to Trash?`}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-400" />
              <span>
                {nodeToDelete.is_dir
                  ? "This will move this folder and all its contents to your macOS Trash. You can still recover it from Trash if needed."
                  : "This will move the selected file to your macOS Trash."}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1 font-mono text-[11px] text-slate-300">
              <div>Path: {nodeToDelete.path}</div>
              <div>Size: {formatBytes(nodeToDelete.size_bytes)}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setNodeToDelete(null)}
                disabled={cleanMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmDeleteNode}
                isLoading={cleanMutation.isPending}
              >
                Move to Trash ({formatBytes(nodeToDelete.size_bytes)})
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
