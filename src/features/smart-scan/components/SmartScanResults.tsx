import React from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { CleanItemRow } from "@/components/ui/CleanItemRow";
import { formatBytes } from "@/utils/formatters";
import { ScanSummary, CleanItem } from "@/types";
import { HardDrive, Terminal, Trash2, CheckCircle2, ChevronDown } from "lucide-react";

interface SmartScanResultsProps {
  summary: ScanSummary;
  selectedIds: string[];
  onToggleItem: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const SmartScanResults: React.FC<SmartScanResultsProps> = ({
  summary,
  selectedIds,
  onToggleItem,
  onSelectAll,
  onClearAll,
}) => {
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({
    "User Application Caches": true,
    "Xcode Junk": true,
    "Package Managers": true,
    "Trash Bins": true,
    "System Logs": false,
  });

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const allItemIds = summary.items.map((i) => i.id);
  const isAllSelected = allItemIds.length > 0 && allItemIds.every((id) => selectedIds.includes(id));

  const getCategoryIcon = (category: string) => {
    if (category.includes("Xcode") || category.includes("Package") || category.includes("Developer")) {
      return <Terminal className="h-4 w-4 text-[#00f0ff]" />;
    }
    if (category.includes("Trash")) {
      return <Trash2 className="h-4 w-4 text-[#ff2a6d]" />;
    }
    return <HardDrive className="h-4 w-4 text-[#00ff88]" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 pt-2 font-['VT323']">
      {/* Selection Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 py-1 text-base text-[#e2f1f8] gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isAllSelected}
            onChange={(checked) => (checked ? onSelectAll() : onClearAll())}
            id="select-all-smart"
          />
          <label htmlFor="select-all-smart" className="cursor-pointer text-lg select-none">
            SELECT ALL ({selectedIds.length} OF {summary.total_items} TARGETS SELECTED)
          </label>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="emerald">
            <CheckCircle2 className="h-3 w-3 mr-1 inline" /> 100% SAFE TO PURGE
          </Badge>
        </div>
      </div>

      {/* Category Accordion Cards */}
      <div className="space-y-2.5">
        {Object.entries(summary.categories).map(([catName, catData]) => {
          const isExpanded = Boolean(expandedCategories[catName]);
          const catItemIds = catData.items.map((i) => i.id);
          const allCatSelected =
            catItemIds.length > 0 && catItemIds.every((id) => selectedIds.includes(id));

          return (
            <div
              key={catName}
              className="rounded-none border-2 border-[#2a3b50] bg-[#182230] shadow-[3px_3px_0_#06101a] overflow-hidden"
            >
              {/* Category Header */}
              <div
                onClick={() => toggleCategory(catName)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 cursor-pointer hover:bg-[#202e40] select-none transition-colors border-b-2 border-transparent hover:border-[#2a3b50] gap-2.5"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (allCatSelected) {
                        catItemIds.forEach((id) => {
                          if (selectedIds.includes(id)) onToggleItem(id);
                        });
                      } else {
                        catItemIds.forEach((id) => {
                          if (!selectedIds.includes(id)) onToggleItem(id);
                        });
                      }
                    }}
                  >
                    <Checkbox checked={allCatSelected} onChange={() => {}} />
                  </div>
                  <div className="p-1.5 border border-[#2a3b50] bg-[#0e131b] flex-shrink-0">
                    {getCategoryIcon(catName)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-['Press_Start_2P'] text-[10px] text-[#00f0ff] uppercase tracking-wide truncate">
                      {catName}
                    </h4>
                    <span className="text-base text-[#88a7be]">
                      [{catData.count} items found]
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 border-t sm:border-t-0 border-[#2a3b50]/60 pt-1.5 sm:pt-0 pl-7 sm:pl-0">
                  <span className="text-xl text-[#00ff88] font-bold">
                    {formatBytes(catData.total_bytes)}
                  </span>
                  <div className="text-[#e2f1f8] p-1">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </div>

              {/* Items List */}
              {isExpanded && (
                <div className="divide-y divide-[#2a3b50] border-t-2 border-[#2a3b50] bg-[#0e131b]">
                  {catData.items.map((item: CleanItem, itemIdx: number) => (
                    <CleanItemRow
                      key={item.id}
                      item={item}
                      isSelected={selectedIds.includes(item.id)}
                      onToggle={onToggleItem}
                      index={itemIdx}
                      variant="flush"
                      showCategoryBadge={false}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
