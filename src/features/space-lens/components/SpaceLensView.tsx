import React from "react";
import { useFolderLensQuery, useLargeFilesQuery } from "../api";
import { useCleanMutation } from "@/features/smart-scan/api";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatBytes, formatTimestamp } from "@/utils/formatters";
import { safeInvoke } from "@/services/tauriClient";
import { LensNode } from "@/types";
import { SpaceLensBubbleMap } from "./SpaceLensBubbleMap";
import { SpaceLensBreadcrumbs } from "./SpaceLensBreadcrumbs";
import { SpaceLensDetailSidebar } from "./SpaceLensDetailSidebar";
import {
  PieChart,
  RefreshCw,
  Trash2,
  ExternalLink,
  Film,
  Archive,
  FileText,
  Music,
  Disc,
  FileCode,
  FolderArchive,
  CircleDot,
  ListFilter,
  AlertTriangle,
} from "lucide-react";

export const SpaceLensView: React.FC = () => {
  // Navigation & View Mode State
  const [viewMode, setViewMode] = React.useState<"bubble" | "list">("bubble");
  const [currentPath, setCurrentPath] = React.useState<string | undefined>(undefined);
  const [selectedNode, setSelectedNode] = React.useState<LensNode | null>(null);
  const [nodeToDelete, setNodeToDelete] = React.useState<LensNode | null>(null);

  // Large Files list filters
  const [minSizeMb, setMinSizeMb] = React.useState<number>(50);
  const [fileTypeFilter, setFileTypeFilter] = React.useState<string>("all");
  const [selectedListIds, setSelectedListIds] = React.useState<string[]>([]);

  // TanStack Queries & Mutations
  const {
    data: folderData,
    isLoading: isFolderLoading,
    refetch: refetchFolder,
    isRefetching: isFolderRefetching,
  } = useFolderLensQuery(currentPath);

  const {
    data: largeFiles = [],
    isLoading: isListLoading,
    refetch: refetchList,
    isRefetching: isListRefetching,
  } = useLargeFilesQuery(undefined, minSizeMb);

  const cleanMutation = useCleanMutation();
  const { setLastReclaimed } = useAppStore();

  // Navigation handlers
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

  // Delete node via safe trash
  const handleConfirmDelete = async () => {
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
      console.error(e);
    }
  };

  // Large Files list handlers
  const filteredFiles = React.useMemo(() => {
    if (fileTypeFilter === "all") return largeFiles;
    return largeFiles.filter((f) => f.file_type === fileTypeFilter);
  }, [largeFiles, fileTypeFilter]);

  const totalBytesSelected = React.useMemo(() => {
    return largeFiles
      .filter((f) => selectedListIds.includes(f.id))
      .reduce((acc, curr) => acc + curr.size_bytes, 0);
  }, [largeFiles, selectedListIds]);

  const toggleListItem = (id: string) => {
    setSelectedListIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllList = () => {
    setSelectedListIds(filteredFiles.map((f) => f.id));
  };

  const handleClearAllList = () => {
    setSelectedListIds([]);
  };

  const handleDeleteSelectedList = async () => {
    const selectedPaths = largeFiles
      .filter((f) => selectedListIds.includes(f.id))
      .map((f) => f.path);

    if (selectedPaths.length === 0) return;

    try {
      const res = await cleanMutation.mutateAsync({
        paths: selectedPaths,
        useTrash: true,
      });
      setSelectedListIds([]);
      setLastReclaimed(res.reclaimed_bytes);
      refetchList();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRevealInFinder = async (path: string) => {
    try {
      await safeInvoke("reveal_in_finder", { path });
    } catch (e) {
      console.error(e);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Film className="h-4 w-4 text-purple-400" />;
      case "disk_image":
        return <Disc className="h-4 w-4 text-pink-400" />;
      case "archive":
        return <Archive className="h-4 w-4 text-amber-400" />;
      case "document":
        return <FileText className="h-4 w-4 text-cyan-400" />;
      case "audio":
        return <Music className="h-4 w-4 text-emerald-400" />;
      case "code":
        return <FileCode className="h-4 w-4 text-indigo-400" />;
      default:
        return <FolderArchive className="h-4 w-4 text-slate-400" />;
    }
  };

  const isAllFilteredSelected =
    filteredFiles.length > 0 &&
    filteredFiles.every((f) => selectedListIds.includes(f.id));

  return (
    <div className="h-full flex flex-col p-6 space-y-4 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Space Lens
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono border border-pink-500/30">
                Interactive Visualizer
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive circle-packing bubble map. Click bubbles to inspect sizes and dive into folders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher: Bubble Map vs List */}
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
            onClick={() => (viewMode === "bubble" ? refetchFolder() : refetchList())}
            isLoading={
              viewMode === "bubble"
                ? isFolderLoading || isFolderRefetching
                : isListLoading || isListRefetching
            }
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Rescan
          </Button>
        </div>
      </div>

      {/* VIEW MODE 1: Interactive Bubble Map (CleanMyMac Style!) */}
      {viewMode === "bubble" && (
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          {/* Breadcrumbs Navigation Bar */}
          <SpaceLensBreadcrumbs
            currentPath={folderData?.current_path || "/"}
            parentPath={folderData?.parent_path}
            onNavigate={handleNavigate}
            onNavigateUp={handleNavigateUp}
            isLoading={isFolderLoading}
          />

          {/* Main Visual Arena & Detail Sidebar */}
          <div className="flex-1 flex items-stretch gap-4 min-h-0 overflow-hidden">
            {/* Interactive Bubble Map Canvas */}
            <div className="flex-1 h-full min-h-0 relative">
              {isFolderLoading ? (
                <div className="h-full w-full rounded-3xl border border-white/10 bg-slate-950/80 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-pink-400" />
                  <span className="text-sm font-medium">
                    Calculating storage bubbles across directory...
                  </span>
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

            {/* Side Detail & Actions Panel */}
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
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            {/* Type tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Files" },
                { id: "video", label: "Video" },
                { id: "disk_image", label: "DMG / ISO" },
                { id: "archive", label: "Archives / ZIP" },
                { id: "document", label: "Documents" },
                { id: "audio", label: "Audio" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFileTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    fileTypeFilter === tab.id
                      ? "bg-pink-600 text-white font-semibold"
                      : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Threshold buttons */}
              <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5 text-xs">
                <span className="text-slate-400 px-2 text-[11px]">Min Size:</span>
                {[50, 100, 500, 1000].map((mb) => (
                  <button
                    key={mb}
                    onClick={() => setMinSizeMb(mb)}
                    className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors ${
                      minSizeMb === mb
                        ? "bg-white/10 text-white font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    &gt;{mb >= 1000 ? `${mb / 1000}GB` : `${mb}MB`}
                  </button>
                ))}
              </div>

              <Button
                variant="gradient"
                size="md"
                onClick={handleDeleteSelectedList}
                disabled={selectedListIds.length === 0 || cleanMutation.isPending}
                isLoading={cleanMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Move to Trash ({formatBytes(totalBytesSelected)})
              </Button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {isListLoading ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-pink-400" />
                <span className="text-sm font-medium">Scanning for large files across your Mac...</span>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                <span className="text-base font-semibold text-white">No matching files found</span>
                <span className="text-xs text-slate-400">
                  Try lowering the minimum size threshold or adjusting file type filters.
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-900/40 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isAllFilteredSelected}
                      onChange={(c) => (c ? handleSelectAllList() : handleClearAllList())}
                      id="select-filtered-lens"
                    />
                    <label
                      htmlFor="select-filtered-lens"
                      className="cursor-pointer font-medium text-slate-300"
                    >
                      Select All ({selectedListIds.length} of {filteredFiles.length} files)
                    </label>
                  </div>
                  <span className="font-mono text-pink-300 font-semibold">
                    Found {filteredFiles.length} files
                  </span>
                </div>

                {filteredFiles.map((file) => {
                  const isSelected = selectedListIds.includes(file.id);

                  return (
                    <div
                      key={file.id}
                      onClick={() => toggleListItem(file.id)}
                      className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "bg-pink-950/20 border-pink-500/40 shadow-sm"
                          : "bg-slate-900/40 border-white/5 hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        <Checkbox checked={isSelected} onChange={() => toggleListItem(file.id)} />
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
                          {getFileIcon(file.file_type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-100 truncate">
                              {file.name}
                            </span>
                            <Badge variant="rose">.{file.extension}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span className="font-mono">{formatTimestamp(file.last_modified)}</span>
                            <span className="truncate max-w-sm font-mono text-[11px] text-slate-400">
                              {file.path}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-mono font-bold text-pink-300">
                          {formatBytes(file.size_bytes)}
                        </span>
                        <button
                          type="button"
                          title="Reveal in macOS Finder"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevealInFinder(file.path);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
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
                onClick={handleConfirmDelete}
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
