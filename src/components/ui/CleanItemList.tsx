import React from "react";
import { Checkbox } from "./Checkbox";
import { CleanItemRow } from "./CleanItemRow";
import { EmptyState } from "./EmptyState";
import { formatBytes } from "@/utils/formatters";
import { CleanItem } from "@/types";
import { ArrowUpDown } from "lucide-react";

export type CleanSortOption = "size_desc" | "size_asc" | "name_asc" | "name_desc";

export interface CleanItemListProps {
  items: CleanItem[];
  selectedIds: string[];
  onToggleItem: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  badgeVariant?: "neutral" | "cyan" | "purple" | "emerald" | "amber" | "rose";
  accentColor?: "purple" | "cyan";
  totalBytes?: number;
}

export const CleanItemList: React.FC<CleanItemListProps> = ({
  items,
  selectedIds,
  onToggleItem,
  onSelectAll,
  onClearAll,
  emptyTitle = "SYSTEM IS CLEAN",
  emptyDescription = "No junk artifacts found in this category.",
  badgeVariant = "cyan",
  totalBytes,
}) => {
  const [sortBy, setSortBy] = React.useState<CleanSortOption>("size_desc");

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "size_desc":
          return b.size_bytes - a.size_bytes;
        case "size_asc":
          return a.size_bytes - b.size_bytes;
        case "name_asc":
          return a.title.localeCompare(b.title);
        case "name_desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [items, sortBy]);

  const isAllSelected = items.length > 0 && items.every((i) => selectedIds.includes(i.id));

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-2 font-['VT323']">
      {/* Quick Select All & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 text-base text-[#e2f1f8] bg-[#0e131b] border border-[#2a3b50] gap-2.5">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isAllSelected}
            onChange={(checked) => (checked ? onSelectAll() : onClearAll())}
            id="select-filtered-clean"
          />
          <label htmlFor="select-filtered-clean" className="cursor-pointer text-base select-none">
            SELECT ALL ({selectedIds.length} OF {items.length} MARKED)
          </label>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-[#182230] border border-[#2a3b50] px-2 py-0.5">
            <ArrowUpDown className="h-3 w-3 text-[#00f0ff]" />
            <span className="text-[#506882] font-['Press_Start_2P'] text-[9px] uppercase">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as CleanSortOption)}
              className="bg-transparent text-[#00f0ff] font-['VT323'] text-base focus:outline-none cursor-pointer"
            >
              <option value="size_desc" className="bg-[#0e131b] text-[#e2f1f8]">SIZE (LARGEST)</option>
              <option value="size_asc" className="bg-[#0e131b] text-[#e2f1f8]">SIZE (SMALLEST)</option>
              <option value="name_asc" className="bg-[#0e131b] text-[#e2f1f8]">NAME (A-Z)</option>
              <option value="name_desc" className="bg-[#0e131b] text-[#e2f1f8]">NAME (Z-A)</option>
            </select>
          </div>

          {typeof totalBytes === "number" && (
            <span className="text-[#00f0ff] font-bold text-lg font-['VT323']">
              TOTAL: {formatBytes(totalBytes)}
            </span>
          )}
        </div>
      </div>

      {/* Item rows */}
      {sortedItems.map((item, idx) => (
        <CleanItemRow
          key={item.id}
          item={item}
          isSelected={selectedIds.includes(item.id)}
          onToggle={onToggleItem}
          index={idx}
          badgeVariant={badgeVariant}
        />
      ))}
    </div>
  );
};
