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
  Disc,
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
    if (node.is_dir) return <Folder className="h-6 w-6 text-purple-400" />;
    switch (node.file_type) {
      case "video":
        return <Film className="h-6 w-6 text-pink-400" />;
      case "disk_image":
        return <Disc className="h-6 w-6 text-rose-400" />;
      case "archive":
        return <Archive className="h-6 w-6 text-amber-400" />;
      case "audio":
        return <Music className="h-6 w-6 text-emerald-400" />;
      case "code":
        return <FileCode className="h-6 w-6 text-cyan-400" />;
      case "document":
        return <FileText className="h-6 w-6 text-indigo-400" />;
      default:
        return <File className="h-6 w-6 text-slate-400" />;
    }
  };

  if (!selectedNode) {
    return (
      <div className="w-80 h-full rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Info className="h-4 w-4 text-cyan-400" />
            <span>Folder Overview</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <HardDrive className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-white truncate">{currentName}</h4>
                <p className="text-xs font-mono text-slate-400 truncate">{currentPath}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Folder Total</span>
                <span className="font-mono font-bold text-purple-300 text-sm">
                  {formatBytes(totalBytes)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Contents</span>
                <span className="font-mono font-bold text-white text-sm">
                  {itemCount} items
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <span className="font-semibold text-cyan-300 block">Interactive Bubble Map:</span>
            <p className="text-slate-400 text-[11px]">
              • Bubble size represents storage consumed on disk.
            </p>
            <p className="text-slate-400 text-[11px]">
              • <strong className="text-slate-200">Click</strong> any bubble to inspect its details and actions.
            </p>
            <p className="text-slate-400 text-[11px]">
              • <strong className="text-slate-200">Double-click</strong> or click <strong className="text-purple-300">Dive In</strong> to explore subdirectories!
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleRevealInFinder(currentPath)}
          className="w-full mt-4"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Reveal Folder in Finder
        </Button>
      </div>
    );
  }

  const percent = totalBytes > 0 ? (selectedNode.size_bytes / totalBytes) * 100 : 0;

  return (
    <div className="w-80 h-full rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 flex flex-col justify-between flex-shrink-0 animate-in fade-in duration-150">
      <div className="space-y-4 overflow-y-auto pr-1">
        {/* Header Icon + Name */}
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex-shrink-0">
            {getNodeIcon(selectedNode)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={selectedNode.is_dir ? "purple" : "cyan"}>
                {selectedNode.is_dir ? "Folder" : selectedNode.file_type}
              </Badge>
              {selectedNode.extension && (
                <span className="text-[10px] font-mono text-slate-400">
                  .{selectedNode.extension}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-white break-words leading-snug">
              {selectedNode.name}
            </h3>
          </div>
        </div>

        {/* Big Size Metric Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-black border border-purple-500/20 space-y-2">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
            Occupied Storage
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-cyan-300">
              {formatBytes(selectedNode.size_bytes)}
            </span>
            <span className="text-xs font-mono font-bold text-purple-300">
              {percent.toFixed(1)}% of folder
            </span>
          </div>

          {/* Mini progress bar showing percentage of parent folder */}
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>

        {/* Metadata Details */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
          {selectedNode.is_dir && (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 text-[11px]">Sub-items Count</span>
              <span className="font-mono font-bold">
                {selectedNode.item_count ? `${selectedNode.item_count} items` : "Scanning..."}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 text-[11px]">Last Modified</span>
            <span className="font-mono text-[11px]">
              {formatTimestamp(selectedNode.last_modified)}
            </span>
          </div>

          <div className="pt-2 border-t border-white/5">
            <span className="text-slate-400 text-[10px] uppercase font-mono block mb-1">
              Path
            </span>
            <p className="text-[11px] font-mono text-slate-300 break-all select-text bg-black/30 p-2 rounded-xl border border-white/5">
              {selectedNode.path}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-white/10 mt-auto">
        {selectedNode.is_dir && (
          <Button
            variant="gradient"
            size="md"
            onClick={() => onDiveIn(selectedNode)}
            className="w-full"
          >
            <CornerDownRight className="h-4 w-4" />
            Dive In (Open Subfolder)
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleRevealInFinder(selectedNode.path)}
            className="flex-1"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Reveal in Finder
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDeleteNode(selectedNode)}
            disabled={isDeleting}
            isLoading={isDeleting}
            className="flex-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Move to Trash
          </Button>
        </div>
      </div>
    </div>
  );
};
