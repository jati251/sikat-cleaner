import React from "react";
import { Checkbox } from "./Checkbox";
import { Badge } from "./Badge";
import { formatBytes } from "@/utils/formatters";
import { revealInFinder } from "@/services/tauriClient";
import { CleanItem } from "@/types";
import { ExternalLink } from "lucide-react";

export interface CleanItemRowProps {
  item: CleanItem;
  isSelected: boolean;
  onToggle: (id: string) => void;
  index?: number;
  badgeVariant?: "neutral" | "cyan" | "purple" | "emerald" | "amber" | "rose";
  selectedBorderColor?: string;
  selectedBgColor?: string;
  variant?: "card" | "flush";
  showCategoryBadge?: boolean;
}

export const CleanItemRow: React.FC<CleanItemRowProps> = ({
  item,
  isSelected,
  onToggle,
  badgeVariant = "cyan",
  variant = "card",
  showCategoryBadge = true,
}) => {
  const isFlush = variant === "flush";

  return (
    <div
      onClick={() => onToggle(item.id)}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between transition-all cursor-pointer gap-2 ${
        isFlush
          ? `px-4 py-2.5 border-b border-[#2a3b50] ${isSelected ? "bg-[#202e40]" : "hover:bg-[#182230]"}`
          : `p-3 rounded-none border-2 ${
              isSelected
                ? "bg-[#182230] border-[#00f0ff] shadow-[3px_3px_0_#062a38]"
                : "bg-[#182230] border-[#2a3b50] hover:border-[#506882]"
            }`
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 pr-0 sm:pr-4 flex-1">
        <Checkbox checked={isSelected} onChange={() => onToggle(item.id)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-['VT323'] text-[#e2f1f8] truncate tracking-wide">
              {item.title}
            </span>
            {showCategoryBadge && item.category && (
              <Badge variant={badgeVariant}>{item.category}</Badge>
            )}
          </div>
          {item.description && (
            <p className="text-sm font-['VT323'] text-[#88a7be] truncate">{item.description}</p>
          )}
          <p className="text-[10px] font-mono text-[#506882] truncate mt-0.5">{item.path}</p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pl-7 sm:pl-0 border-t sm:border-t-0 border-[#2a3b50]/60 pt-1.5 sm:pt-0">
        <span className="text-xl font-['VT323'] text-[#00f0ff] font-bold">
          {formatBytes(item.size_bytes)}
        </span>
        <button
          type="button"
          title="Reveal in Finder"
          onClick={(e) => {
            e.stopPropagation();
            revealInFinder(item.path);
          }}
          className="p-1 border border-[#2a3b50] bg-[#0e131b] text-[#88a7be] hover:text-[#00f0ff] hover:border-[#00f0ff] cursor-pointer"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
