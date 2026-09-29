import React from "react";
import { motion } from "motion/react";
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
  badgeVariant?: "neutral" | "cyan" | "purple" | "emerald";
  selectedBorderColor?: string;
  selectedBgColor?: string;
  variant?: "card" | "flush";
  showCategoryBadge?: boolean;
}

export const CleanItemRow: React.FC<CleanItemRowProps> = ({
  item,
  isSelected,
  onToggle,
  index = 0,
  badgeVariant = "neutral",
  selectedBorderColor = "border-purple-500/40",
  selectedBgColor = "bg-purple-950/20",
  variant = "card",
  showCategoryBadge = true,
}) => {
  const isFlush = variant === "flush";

  return (
    <motion.div
      initial={{ opacity: 0, y: isFlush ? 0 : 8, x: isFlush ? -4 : 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.25) }}
      whileHover={{ x: 3, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      onClick={() => onToggle(item.id)}
      className={`group flex items-center justify-between transition-colors duration-150 cursor-pointer ${
        isFlush
          ? `px-5 py-3 ${isSelected ? selectedBgColor : ""}`
          : `p-3.5 rounded-2xl border ${
              isSelected
                ? `${selectedBgColor} ${selectedBorderColor} shadow-sm`
                : "bg-slate-900/40 border-white/5 hover:border-white/10"
            }`
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <Checkbox checked={isSelected} onChange={() => onToggle(item.id)} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-100 truncate">{item.title}</span>
            {showCategoryBadge && item.category && (
              <Badge variant={badgeVariant}>{item.category}</Badge>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{item.description}</p>
          )}
          <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">{item.path}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-mono font-bold text-slate-200">
          {formatBytes(item.size_bytes)}
        </span>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          title="Reveal in macOS Finder"
          onClick={(e) => {
            e.stopPropagation();
            revealInFinder(item.path);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ExternalLink className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};
