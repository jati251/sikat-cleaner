import React from "react";
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
  Archive,
  FileText,
  Music,
  FileCode,
  FolderArchive,
  ExternalLink,
  Trash2,
  ArrowUpDown,
} from "lucide-react";

export type LargeFileSortOption =
  | "size_desc"
  | "size_asc"
  | "name_asc"
  | "name_desc"
  | "date_desc"
  | "date_asc";

export interface SpaceLensLargeFilesListProps {
  files: LargeFileItem[];
  isLoading: boolean;
  minSizeMb: number;
  onMinSizeChange: (mb: number) => void;
  onDeleteSelected: (paths: string[]) => Promise<void>;
  isDeleting: boolean;
}

const FILE_TYPE_TABS: TabOption[] = [
  { id: "all", label: "ALL FILES" },
  { id: "video", label: "VIDEO" },
  { id: "disk_image", label: "DMG / ISO" },
  { id: "archive", label: "ARCHIVES" },
  { id: "document", label: "DOCUMENTS" },
  { id: "audio", label: "AUDIO" },
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
  const [sortBy, setSortBy] = React.useState<LargeFileSortOption>("size_desc");

  const filteredAndSortedFiles = React.useMemo(() => {
    let result = files;
    if (fileTypeFilter !== "all") {
      result = result.filter((f) => f.file_type === fileTypeFilter);
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "size_desc":
          return b.size_bytes - a.size_bytes;
        case "size_asc":
          return a.size_bytes - b.size_bytes;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "date_desc":
          return b.last_modified - a.last_modified;
        case "date_asc":
          return a.last_modified - b.last_modified;
        default:
          return 0;
      }
    });
  }, [files, fileTypeFilter, sortBy]);

  const {
    selectedIds,
    toggleItem,
    selectAll,
    clearAll,
    isAllSelected,
    totalSelectedBytes,
  } = useItemSelection<LargeFileItem>({
    items: filteredAndSortedFiles,
    getItemId: (f) => f.id,
    getItemBytes: (f) => f.size_bytes,
  });

  const handleDelete = async () => {
    const paths = filteredAndSortedFiles
      .filter((f) => selectedIds.includes(f.id))
      .map((f) => f.path);
    if (paths.length === 0) return;
    await onDeleteSelected(paths);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
      case "disk_image":
        return <Film className="h-4 w-4 text-[#ff2a6d]" />;
      case "archive":
        return <Archive className="h-4 w-4 text-[#ffb703]" />;
      case "document":
        return <FileText className="h-4 w-4 text-[#e2f1f8]" />;
      case "audio":
        return <Music className="h-4 w-4 text-[#00ff88]" />;
      case "code":
        return <FileCode className="h-4 w-4 text-[#00f0ff]" />;
      default:
        return <FolderArchive className="h-4 w-4 text-[#88a7be]" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 font-['VT323']">
      {/* Filters & Threshold Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 flex-shrink-0">
        <CategoryTabs
          tabs={FILE_TYPE_TABS}
          activeTab={fileTypeFilter}
          onChange={setFileTypeFilter}
        />

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
          {/* Threshold buttons */}
          <div className="flex items-center gap-1 bg-[#0e131b] p-1 border-2 border-[#2a3b50] text-sm">
            <span className="text-[#506882] px-1 font-['Press_Start_2P'] text-[8px]">MIN:</span>
            {MIN_SIZE_OPTIONS.map((mb) => (
              <button
                key={mb}
                type="button"
                onClick={() => onMinSizeChange(mb)}
                className={`px-2 py-0.5 font-['VT323'] text-base transition-colors cursor-pointer ${
                  minSizeMb === mb
                    ? "bg-[#00f0ff] text-[#0e131b] font-bold"
                    : "text-[#e2f1f8] hover:text-[#00f0ff]"
                }`}
              >
                &gt;{mb >= 1000 ? `${mb / 1000}GB` : `${mb}MB`}
              </button>
            ))}
          </div>

          {/* Delete Action Button */}
          <Button
            variant="danger"
            size="md"
            onClick={handleDelete}
            disabled={selectedIds.length === 0 || isDeleting}
            isLoading={isDeleting}
            className="shadow-[3px_3px_0_#380817] flex-shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            TRASH ({formatBytes(totalSelectedBytes)})
          </Button>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          <LoadingState
            title="SCANNING LARGE FILES"
            label="Inspecting disk allocations for oversized files..."
            stages={[
              "Scanning disk volumes for large file allocations...",
              "Filtering files exceeding size threshold...",
              "Inspecting archive, video, and disk image sizes...",
              "Sorting large files by storage footprint...",
            ]}
          />
        ) : filteredAndSortedFiles.length === 0 ? (
          <EmptyState
            title="NO MATCHING LARGE FILES"
            description="Try lowering the size threshold or switching file type filters."
          />
        ) : (
          <>
            {/* Header select all & sort bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 text-base text-[#e2f1f8] bg-[#0e131b] border border-[#2a3b50] gap-2.5">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  onChange={(c) => (c ? selectAll() : clearAll())}
                  id="select-filtered-lens"
                />
                <label
                  htmlFor="select-filtered-lens"
                  className="cursor-pointer text-base select-none"
                >
                  SELECT ALL ({selectedIds.length} OF {filteredAndSortedFiles.length} FILES)
                </label>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
                {/* Sort Selector */}
                <div className="flex items-center gap-1.5 bg-[#182230] border border-[#2a3b50] px-2 py-0.5">
                  <ArrowUpDown className="h-3 w-3 text-[#00f0ff]" />
                  <span className="text-[#506882] font-['Press_Start_2P'] text-[9px] uppercase">SORT:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as LargeFileSortOption)}
                    className="bg-transparent text-[#00f0ff] font-['VT323'] text-base focus:outline-none cursor-pointer"
                  >
                    <option value="size_desc" className="bg-[#0e131b] text-[#e2f1f8]">SIZE (LARGEST)</option>
                    <option value="size_asc" className="bg-[#0e131b] text-[#e2f1f8]">SIZE (SMALLEST)</option>
                    <option value="name_asc" className="bg-[#0e131b] text-[#e2f1f8]">NAME (A-Z)</option>
                    <option value="name_desc" className="bg-[#0e131b] text-[#e2f1f8]">NAME (Z-A)</option>
                    <option value="date_desc" className="bg-[#0e131b] text-[#e2f1f8]">DATE (NEWEST)</option>
                    <option value="date_asc" className="bg-[#0e131b] text-[#e2f1f8]">DATE (OLDEST)</option>
                  </select>
                </div>

                <span className="text-[#00f0ff] font-bold text-lg">
                  FOUND {filteredAndSortedFiles.length} FILES
                </span>
              </div>
            </div>

            {filteredAndSortedFiles.map((file) => {
              const isSelected = selectedIds.includes(file.id);

              return (
                <div
                  key={file.id}
                  onClick={() => toggleItem(file.id)}
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3 border-2 transition-all cursor-pointer gap-2.5 ${
                    isSelected
                      ? "bg-[#182230] border-[#00f0ff] shadow-[3px_3px_0_#062a38]"
                      : "bg-[#182230] border-[#2a3b50] hover:border-[#506882]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-0 sm:pr-4 flex-1">
                    <Checkbox checked={isSelected} onChange={() => toggleItem(file.id)} />
                    <div className="p-1.5 border border-[#2a3b50] bg-[#0e131b] flex-shrink-0">
                      {getFileIcon(file.file_type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg text-[#e2f1f8] truncate">
                          {file.name}
                        </span>
                        <Badge variant="rose">.{file.extension}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#506882] mt-0.5 flex-wrap">
                        <span>{formatTimestamp(file.last_modified)}</span>
                        <span className="truncate max-w-sm font-mono text-xs text-[#506882]">
                          {file.path}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pl-7 sm:pl-0 border-t sm:border-t-0 border-[#2a3b50]/60 pt-1.5 sm:pt-0">
                    <span className="text-xl font-bold text-[#00f0ff]">
                      {formatBytes(file.size_bytes)}
                    </span>
                    <button
                      type="button"
                      title="Reveal in Finder"
                      onClick={(e) => {
                        e.stopPropagation();
                        revealInFinder(file.path);
                      }}
                      className="p-1 border border-[#2a3b50] bg-[#0e131b] text-[#506882] hover:text-[#00f0ff] hover:border-[#00f0ff] cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
