import React from "react";
import { useFolderLensQuery, useLargeFilesQuery, useFullDiskAccessQuery } from "../api";
import { useCleanMutation } from "@/features/smart-scan/api";
import { useAppStore } from "@/stores/useAppStore";
import { ViewHeader } from "@/components/ui/ViewHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { OperationProgressModal } from "@/components/ui/OperationProgressModal";
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
    <div className="h-full flex flex-col p-5 space-y-4 overflow-hidden relative font-['VT323']">
      {/* Background Fetch / Rescan Progress Bar */}
      <TopProgressBar
        isLoading={isFolderRefetching || isListRefetching}
      />

      {/* Delete Progress Modal */}
      <OperationProgressModal
        isOpen={cleanMutation.isPending}
        title="MOVING ITEM TO TRASH"
        stage="Deleting selected item via macOS Finder trash..."
        indeterminate={true}
        subdetail={nodeToDelete ? nodeToDelete.path : undefined}
      />

      {/* Top Header */}
      <ViewHeader
        icon={PieChart}
        iconColor="text-[#00f0ff]"
        iconBg="bg-[#0e131b] border-[#2a3b50]"
        title="SPACE LENS VISUALIZER"
        description="Interactive circle-packing bubble map. Inspect sizes and dive into folders."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#0e131b] p-0.5 border-2 border-[#2a3b50]">
              <button
                type="button"
                onClick={() => setViewMode("bubble")}
                className={`px-3 py-1 font-['Press_Start_2P'] text-[9px] uppercase transition-all cursor-pointer ${
                  viewMode === "bubble"
                    ? "bg-[#00f0ff] text-[#0e131b] shadow-[1px_1px_0_#062a38] font-bold"
                    : "text-[#e2f1f8] hover:text-[#00f0ff]"
                }`}
              >
                <CircleDot className="h-3 w-3 inline mr-1" />
                BUBBLE
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 font-['Press_Start_2P'] text-[9px] uppercase transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#00f0ff] text-[#0e131b] shadow-[1px_1px_0_#062a38] font-bold"
                    : "text-[#e2f1f8] hover:text-[#00f0ff]"
                }`}
              >
                <ListFilter className="h-3 w-3 inline mr-1" />
                LIST
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
              <RefreshCw className="h-3 w-3 mr-1" />
              RE-SCAN
            </Button>
          </div>
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
            <div className="flex items-center justify-between px-3 py-1.5 border-2 border-[#00f0ff] bg-[#0e131b] text-[#00f0ff] flex-shrink-0 text-base">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#00f0ff] flex-shrink-0" />
                <span>
                  FULL DISK ACCESS RECOMMENDED: macOS requires disk access to calculate deep system files.
                </span>
              </div>
              <button
                type="button"
                onClick={openFullDiskAccessSettings}
                className="text-[#e2f1f8] hover:text-[#00f0ff] font-['Press_Start_2P'] text-[8px] underline ml-3 flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                <span>OPEN SETTINGS</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex-1 flex items-stretch gap-4 min-h-0 overflow-hidden">
            <div className="flex-1 h-full min-h-0 relative">
              {isFolderLoading || isFolderRefetching ? (
                <LoadingState
                  title="COMPUTING SPACE LENS"
                  label={`Scanning storage in ${currentPath || "Home"}...`}
                  stages={[
                    `Traversing directory hierarchy for ${currentPath || "Home"}...`,
                    "Aggregating file sizes and subdirectory weights...",
                    "Computing packing coordinates...",
                    "Generating interactive storage visualization...",
                  ]}
                />
              ) : isPermissionDenied ? (
                <SpaceLensPermissionDenied
                  currentPath={folderData?.current_path || currentPath}
                  onRescan={handleRescanFolder}
                  onGoHome={() => handleNavigate("~")}
                />
              ) : hasFolderError ? (
                <div className="h-full w-full border-2 border-[#2a3b50] bg-[#0e131b] flex flex-col items-center justify-center text-center p-6 gap-3">
                  <div className="p-3 border border-[#ff2a6d] bg-[#0e131b] text-[#ff2a6d]">
                    <FolderX className="h-8 w-8" />
                  </div>
                  <h3 className="font-['Press_Start_2P'] text-xs text-[#ff2a6d]">
                    CANNOT READ FOLDER
                  </h3>
                  <p className="text-base text-[#e2f1f8] max-w-sm">
                    {folderData?.error_message || (folderError ? String(folderError) : "An unknown error occurred")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="secondary" size="sm" onClick={handleRescanFolder}>
                      RETRY
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleNavigate("~")}>
                      GO TO HOME
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
          title={`MOVE TO TRASH: ${nodeToDelete.name}`}
        >
          <div className="space-y-4 font-['VT323']">
            <div className="flex items-start gap-2 p-2 border-2 border-[#ff2a6d] bg-[#0e131b] text-[#ff2a6d] text-base">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>
                {nodeToDelete.is_dir
                  ? "This will move this folder and all its contents to your macOS Trash."
                  : "This will move the selected file to your macOS Trash."}
              </span>
            </div>

            <div className="p-3 border border-[#2a3b50] bg-[#0e131b] space-y-1 text-base text-[#e2f1f8]">
              <div>PATH: {nodeToDelete.path}</div>
              <div>SIZE: {formatBytes(nodeToDelete.size_bytes)}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setNodeToDelete(null)}
                disabled={cleanMutation.isPending}
              >
                CANCEL
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmDeleteNode}
                isLoading={cleanMutation.isPending}
              >
                CONFIRM TRASH ({formatBytes(nodeToDelete.size_bytes)})
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
