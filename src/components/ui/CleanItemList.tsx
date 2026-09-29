import React from "react";
import { Checkbox } from "./Checkbox";
import { CleanItemRow } from "./CleanItemRow";
import { EmptyState } from "./EmptyState";
import { formatBytes } from "@/utils/formatters";
import { CleanItem } from "@/types";

export interface CleanItemListProps {
  items: CleanItem[];
  selectedIds: string[];
  onToggleItem: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  badgeVariant?: "neutral" | "cyan" | "purple" | "emerald";
  accentColor?: "purple" | "cyan";
  totalBytes?: number;
}

export const CleanItemList: React.FC<CleanItemListProps> = ({
  items,
  selectedIds,
  onToggleItem,
  onSelectAll,
  onClearAll,
  emptyTitle = "System is Spotless!",
  emptyDescription = "No junk files found in this category.",
  badgeVariant = "neutral",
  accentColor = "purple",
  totalBytes,
}) => {
  const isAllSelected = items.length > 0 && items.every((i) => selectedIds.includes(i.id));

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const accentColorClass = accentColor === "cyan" ? "text-cyan-300" : "text-purple-300";
  const selectedBorder = accentColor === "cyan" ? "border-cyan-500/40" : "border-purple-500/40";
  const selectedBg = accentColor === "cyan" ? "bg-cyan-950/20" : "bg-purple-950/20";

  return (
    <div className="space-y-2">
      {/* Quick Select All bar */}
      <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-900/40 rounded-xl">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isAllSelected}
            onChange={(checked) => (checked ? onSelectAll() : onClearAll())}
            id="select-filtered-clean"
          />
          <label htmlFor="select-filtered-clean" className="cursor-pointer font-medium text-slate-300">
            Select All in View ({selectedIds.length} of {items.length} selected)
          </label>
        </div>
        {typeof totalBytes === "number" && (
          <span className={`font-mono font-semibold ${accentColorClass}`}>
            Total: {formatBytes(totalBytes)}
          </span>
        )}
      </div>

      {/* Item rows */}
      {items.map((item, idx) => (
        <CleanItemRow
          key={item.id}
          item={item}
          isSelected={selectedIds.includes(item.id)}
          onToggle={onToggleItem}
          index={idx}
          badgeVariant={badgeVariant}
          selectedBorderColor={selectedBorder}
          selectedBgColor={selectedBg}
        />
      ))}
    </div>
  );
};
