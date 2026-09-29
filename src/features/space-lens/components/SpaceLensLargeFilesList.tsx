import React from "react";
import { motion } from "motion/react";
import { LargeFileItem } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { CategoryTabs, TabOption } from "@/components/ui/CategoryTabs";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useItemSelection } from "@/hooks/useItemSelection";
import { formatBytes, formatTimestamp } from "@/utils/formatters";
import { revealInFinder } from "@/services/tauriClient";
import {
  Film,
  Disc,
  Archive,
  FileText,
  Music,
  FileCode,
  FolderArchive,
  ExternalLink,
  Trash2,
} from "lucide-react";

export interface SpaceLensLargeFilesListProps {
  files: LargeFileItem[];
  isLoading: boolean;
  minSizeMb: number;
  onMinSizeChange: (mb: number) => void;
  onDeleteSelected: (paths: string[]) => Promise<void>;
  isDeleting: boolean;
}

const FILE_TYPE_TABS: TabOption[] = [
  { id: "all", label: "All Files" },
  { id: "video", label: "Video" },
  { id: "disk_image", label: "DMG / ISO" },
  { id: "archive", label: "Archives / ZIP" },
  { id: "document", label: "Documents" },
  { id: "audio", label: "Audio" },
];

const MIN_SIZE_OPTIONS = [50, 100, 500, 1000];

export const SpaceLensLargeFilesList: React.FC<SpaceLensLargeFilesListProps> = ({
  files,
  isLoading,
  minSizeMb,
  onMinSizeChange,
  onDeleteSelected,
  isDeleting,
}) => {
  const [fileTypeFilter, setFileTypeFilter] = React.useState<string>("all");

  const filteredFiles = React.useMemo(() => {
    if (fileTypeFilter === "all") return files;
    return files.filter((f) => f.file_type === fileTypeFilter);
  }, [files, fileTypeFilter]);

  const {
    selectedIds,
    toggleItem,
    selectAll,
    clearAll,
    isAllSelected,
    totalSelectedBytes,
  } = useItemSelection<LargeFileItem>({
    items: filteredFiles,
    getItemId: (f) => f.id,
    getItemBytes: (f) => f.size_bytes,
  });

  const handleDelete = async () => {
    const paths = filteredFiles
      .filter((f) => selectedIds.includes(f.id))
      .map((f) => f.path);
    if (paths.length === 0) return;
    await onDeleteSelected(paths);
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

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <CategoryTabs
          tabs={FILE_TYPE_TABS}
          activeTab={fileTypeFilter}
          onChange={setFileTypeFilter}
          accentColor="pink"
        />

        <div className="flex items-center gap-3">
          {/* Threshold buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5 text-xs">
            <span className="text-slate-400 px-2 text-[11px]">Min Size:</span>
            {MIN_SIZE_OPTIONS.map((mb) => (
              <button
                key={mb}
                onClick={() => onMinSizeChange(mb)}
                className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors cursor-pointer ${
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
            onClick={handleDelete}
            disabled={selectedIds.length === 0 || isDeleting}
            isLoading={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            Move to Trash ({formatBytes(totalSelectedBytes)})
          </Button>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          <LoadingState
            title="Scanning Large Files"
            label="Scanning for large files across your Mac..."
            stages={[
              "Scanning disk volumes for large file allocations...",
              "Filtering files exceeding size threshold...",
              "Inspecting archive, video, and disk image sizes...",
              "Sorting large files by storage footprint...",
            ]}
            accentColor="rose"
          />
        ) : filteredFiles.length === 0 ? (
          <EmptyState
            title="No matching files found"
            description="Try lowering the minimum size threshold or adjusting file type filters."
          />
        ) : (
          <>
            <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-900/40 rounded-xl">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  onChange={(c) => (c ? selectAll() : clearAll())}
                  id="select-filtered-lens"
                />
                <label
                  htmlFor="select-filtered-lens"
                  className="cursor-pointer font-medium text-slate-300"
                >
                  Select All ({selectedIds.length} of {filteredFiles.length} files)
                </label>
              </div>
              <span className="font-mono text-pink-300 font-semibold">
                Found {filteredFiles.length} files
              </span>
            </div>

            {filteredFiles.map((file, idx) => {
              const isSelected = selectedIds.includes(file.id);

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.25) }}
                  whileHover={{ x: 3, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  onClick={() => toggleItem(file.id)}
                  className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-pink-950/20 border-pink-500/40 shadow-sm"
                      : "bg-slate-900/40 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <Checkbox checked={isSelected} onChange={() => toggleItem(file.id)} />
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
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      title="Reveal in macOS Finder"
                      onClick={(e) => {
                        e.stopPropagation();
                        revealInFinder(file.path);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
