import React from "react";
import { motion, AnimatePresence } from "motion/react";
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
      return <Terminal className="h-4 w-4 text-cyan-400" />;
    }
    if (category.includes("Trash")) {
      return <Trash2 className="h-4 w-4 text-rose-400" />;
    }
    return <HardDrive className="h-4 w-4 text-purple-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto space-y-4 pt-4"
    >
      {/* Selection Control Bar */}
      <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isAllSelected}
            onChange={(checked) => (checked ? onSelectAll() : onClearAll())}
            id="select-all-smart"
          />
          <label htmlFor="select-all-smart" className="cursor-pointer font-medium text-slate-300">
            Select All ({selectedIds.length} of {summary.total_items} items selected)
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald">
            <CheckCircle2 className="h-3 w-3" /> 100% Safe to Clean
          </Badge>
        </div>
      </div>

      {/* Category Accordion Cards */}
      <div className="space-y-3">
        {Object.entries(summary.categories).map(([catName, catData], catIdx) => {
          const isExpanded = Boolean(expandedCategories[catName]);
          const catItemIds = catData.items.map((i) => i.id);
          const allCatSelected =
            catItemIds.length > 0 && catItemIds.every((id) => selectedIds.includes(id));

          return (
            <motion.div
              key={catName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.05, duration: 0.25 }}
              className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden transition-all duration-200 hover:border-purple-500/25"
            >
              {/* Category Header */}
              <div
                onClick={() => toggleCategory(catName)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 select-none transition-colors"
              >
                <div className="flex items-center gap-3">
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
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    {getCategoryIcon(catName)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-wide">{catName}</h4>
                    <span className="text-xs text-slate-400">
                      {catData.count} items found
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold font-mono text-purple-300">
                    {formatBytes(catData.total_bytes)}
                  </span>
                  <div className="text-slate-400 p-1">
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Items List with smooth height expansion */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden divide-y divide-white/5 border-t border-white/5 bg-slate-950/40"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
