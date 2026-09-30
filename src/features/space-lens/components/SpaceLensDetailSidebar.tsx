import React from "react";
import { LensNode } from "@/types";
import { formatBytes, formatTimestamp } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { safeInvoke } from "@/services/tauriClient";
import {
  Folder,
  Film,
  Archive,
  FileText,
  Music,
  FileCode,
  File,
  ExternalLink,
  Trash2,
  CornerDownRight,
  HardDrive,
  Info,
} from "lucide-react";

interface SpaceLensDetailSidebarProps {
  selectedNode: LensNode | null;
  totalBytes: number;
  itemCount: number;
  currentName: string;
  currentPath: string;
  onDiveIn: (node: LensNode) => void;
  onDeleteNode: (node: LensNode) => void;
  isDeleting: boolean;
}

export const SpaceLensDetailSidebar: React.FC<SpaceLensDetailSidebarProps> = ({
  selectedNode,
  totalBytes,
  itemCount,
  currentName,
  currentPath,
  onDiveIn,
  onDeleteNode,
  isDeleting,
}) => {
  const handleRevealInFinder = async (path: string) => {
    try {
      await safeInvoke("reveal_in_finder", { path });
    } catch (e) {
      console.error(e);
    }
  };

  const getNodeIcon = (node: LensNode) => {
    if (node.is_dir) return <Folder className="h-5 w-5 text-[#00f0ff]" />;
    switch (node.file_type) {
      case "video":
      case "disk_image":
        return <Film className="h-5 w-5 text-[#ff2a6d]" />;
      case "archive":
        return <Archive className="h-5 w-5 text-[#ffb703]" />;
      case "audio":
        return <Music className="h-5 w-5 text-[#00ff88]" />;
      case "code":
        return <FileCode className="h-5 w-5 text-[#00f0ff]" />;
      case "document":
        return <FileText className="h-5 w-5 text-[#e2f1f8]" />;
      default:
        return <File className="h-5 w-5 text-[#88a7be]" />;
    }
  };

  if (!selectedNode) {
    return (
      <div className="w-80 h-full border-2 border-[#2a3b50] bg-[#182230] shadow-[3px_3px_0_#06101a] p-4 flex flex-col justify-between flex-shrink-0 font-['VT323']">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#506882] text-sm uppercase">
            <Info className="h-4 w-4 text-[#00f0ff]" />
            <span>FOLDER OVERVIEW</span>
          </div>

          <div className="p-3 border-2 border-[#2a3b50] bg-[#0e131b] space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-[#2a3b50] bg-[#182230] text-[#00f0ff]">
                <HardDrive className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-['Press_Start_2P'] text-[10px] text-[#00f0ff] truncate">{currentName}</h4>
                <p className="text-xs text-[#506882] truncate font-mono mt-0.5">{currentPath}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2a3b50] grid grid-cols-2 gap-2 text-base">
              <div>
                <span className="text-[#506882] block text-xs">TOTAL SIZE</span>
                <span className="text-[#00f0ff] font-bold text-lg">
                  {formatBytes(totalBytes)}
                </span>
              </div>
              <div>
                <span className="text-[#506882] block text-xs">ITEMS COUNT</span>
                <span className="text-[#00ff88] font-bold text-lg">
                  {itemCount} items
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 border border-[#2a3b50] bg-[#0e131b] text-[#e2f1f8] space-y-1 text-base">
            <span className="text-[#00f0ff] block font-['Press_Start_2P'] text-[9px]">INTERACTIVE BUBBLE MAP:</span>
            <p className="text-[#88a7be] text-sm">
              • Bubble diameter reflects disk space weight.
            </p>
            <p className="text-[#88a7be] text-sm">
              • Click any bubble to view metadata and deletion options.
            </p>
            <p className="text-[#88a7be] text-sm">
              • Click "Dive In" to explore interior directories.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleRevealInFinder(currentPath)}
          className="w-full mt-4"
        >
          <ExternalLink className="h-3.5 w-3.5 mr-1" />
          REVEAL IN FINDER
        </Button>
      </div>
    );
  }

  const percent = totalBytes > 0 ? (selectedNode.size_bytes / totalBytes) * 100 : 0;

  return (
    <div className="w-80 h-full border-2 border-[#2a3b50] bg-[#182230] shadow-[3px_3px_0_#06101a] p-4 flex flex-col justify-between flex-shrink-0 font-['VT323']">
      <div className="space-y-3 overflow-y-auto pr-1">
        {/* Header Icon + Name */}
        <div className="flex items-start gap-3">
          <div className="p-2 border border-[#2a3b50] bg-[#0e131b] flex-shrink-0">
            {getNodeIcon(selectedNode)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={selectedNode.is_dir ? "cyan" : "emerald"}>
                {selectedNode.is_dir ? "FOLDER" : selectedNode.file_type}
              </Badge>
              {selectedNode.extension && (
                <span className="text-xs font-mono text-[#506882]">
                  .{selectedNode.extension}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-[#e2f1f8] break-words leading-tight">
              {selectedNode.name}
            </h3>
          </div>
        </div>

        {/* Big Size Metric Card */}
        <div className="p-3 border-2 border-[#2a3b50] bg-[#0e131b] space-y-1">
          <span className="text-[9px] text-[#506882] font-['Press_Start_2P'] uppercase block">
            OCCUPIED SPACE
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#00f0ff]">
              {formatBytes(selectedNode.size_bytes)}
            </span>
            <span className="text-lg text-[#00ff88] font-bold">
              {percent.toFixed(1)}% of folder
            </span>
          </div>

          <div className="h-2 w-full bg-[#182230] border border-[#2a3b50] p-0.5">
            <div
              className="h-full bg-[#00f0ff]"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>

        {/* Metadata Details */}
        <div className="p-2.5 border border-[#2a3b50] bg-[#0e131b] space-y-1.5 text-base text-[#e2f1f8]">
          {selectedNode.is_dir && (
            <div className="flex items-center justify-between">
              <span className="text-[#506882]">SUB-ITEMS COUNT:</span>
              <span className="font-bold text-[#00ff88]">
                {selectedNode.item_count ? `${selectedNode.item_count} items` : "--"}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[#506882]">LAST MODIFIED:</span>
            <span>{formatTimestamp(selectedNode.last_modified)}</span>
          </div>

          <div className="pt-1.5 border-t border-[#2a3b50]">
            <span className="text-[#506882] text-xs block mb-0.5">PATH:</span>
            <p className="text-xs font-mono text-[#e2f1f8] break-all select-text bg-[#182230] p-1.5 border border-[#2a3b50]">
              {selectedNode.path}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-3 border-t-2 border-[#2a3b50] mt-auto">
        {selectedNode.is_dir && (
          <Button
            variant="primary"
            size="md"
            onClick={() => onDiveIn(selectedNode)}
            className="w-full shadow-[2px_2px_0_#062a38]"
          >
            <CornerDownRight className="h-3.5 w-3.5 mr-1" />
            DIVE IN (EXPLORE)
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleRevealInFinder(selectedNode.path)}
            className="flex-1"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            FINDER
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDeleteNode(selectedNode)}
            disabled={isDeleting}
            isLoading={isDeleting}
            className="flex-1"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            TRASH
          </Button>
        </div>
      </div>
    </div>
  );
};
