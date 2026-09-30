import React from "react";
import { useSystemJunkQuery } from "../api";
import { useCleanMutation } from "@/features/smart-scan/api";
import { useAppStore } from "@/stores/useAppStore";
import { useItemSelection } from "@/hooks/useItemSelection";
import { ViewHeader } from "@/components/ui/ViewHeader";
import { CategoryTabs, TabOption } from "@/components/ui/CategoryTabs";
import { CleanItemList } from "@/components/ui/CleanItemList";
import { LoadingState } from "@/components/ui/LoadingState";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { OperationProgressModal } from "@/components/ui/OperationProgressModal";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/utils/formatters";
import { HardDrive, RefreshCw, Trash2 } from "lucide-react";
import { CleanItem } from "@/types";

export const SystemJunkView: React.FC = () => {
  const { data: summary, isLoading, refetch, isRefetching } = useSystemJunkQuery();
  const cleanMutation = useCleanMutation();
  const { setLastReclaimed } = useAppStore();

  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const items = React.useMemo(() => summary?.items ?? [], [summary]);

  const filteredItems = React.useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((i) => i.category === activeCategory);
  }, [items, activeCategory]);

  const {
    selectedIds,
    toggleItem,
    selectAll,
    clearAll,
    totalSelectedBytes,
    setSelectedIds,
  } = useItemSelection<CleanItem>({
    items: filteredItems,
    getItemId: (i) => i.id,
    getItemBytes: (i) => i.size_bytes,
  });

  const categories = React.useMemo<TabOption[]>(() => {
    const counts: Record<string, number> = {};
    items.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });

    const categoryList: TabOption[] = [
      { id: "all", label: "ALL", count: items.length },
    ];
    Object.entries(counts).forEach(([cat, count]) => {
      categoryList.push({ id: cat, label: cat.toUpperCase(), count });
    });
    return categoryList;
  }, [items]);

  const handleCleanSelected = async () => {
    const selectedPaths = items
      .filter((i) => selectedIds.includes(i.id))
      .map((i) => i.path);

    if (selectedPaths.length === 0) return;

    try {
      const res = await cleanMutation.mutateAsync({
        paths: selectedPaths,
        useTrash: true,
      });
      setSelectedIds([]);
      setLastReclaimed(res.reclaimed_bytes);
      refetch();
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  };

  return (
    <div className="h-full flex flex-col p-5 space-y-4 overflow-hidden relative font-['VT323']">
      {/* Background Fetch / Rescan Progress Bar */}
      <TopProgressBar isLoading={isRefetching} />

      {/* Real Cleaning Progress Modal */}
      <OperationProgressModal
        isOpen={cleanMutation.isPending}
        title="PURGING SYSTEM JUNK"
        stage="Deleting application caches and temporary log archives..."
        indeterminate={true}
        subdetail={`Target: ${selectedIds.length} items (${formatBytes(totalSelectedBytes)})`}
      />

      {/* Header */}
      <ViewHeader
        icon={HardDrive}
        iconColor="text-[#00f0ff]"
        iconBg="bg-[#0e131b] border-[#2a3b50]"
        title="SYSTEM JUNK CLEANER"
        description="Clean redundant user caches, diagnostics logs, and temporary macOS trash."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              isLoading={isLoading || isRefetching}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              RE-SCAN
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleCleanSelected}
              disabled={selectedIds.length === 0 || cleanMutation.isPending}
              isLoading={cleanMutation.isPending}
              className="shadow-[3px_3px_0_#062a38]"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              PURGE ({formatBytes(totalSelectedBytes)})
            </Button>
          </div>
        }
      />

      {/* Category Tabs */}
      <CategoryTabs
        tabs={categories}
        activeTab={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Main List */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading || isRefetching ? (
          <LoadingState
            title="SCANNING SYSTEM JUNK"
            label="Inspecting ~/Library/Caches and system logs..."
            stages={[
              "Reading ~/Library/Caches directory...",
              "Analyzing browser & WebKit temporary cache stores...",
              "Scanning diagnostic logs & crash reports in /Library/Logs...",
              "Calculating size of items in macOS Trash bin...",
              "Finalizing junk inventory...",
            ]}
          />
        ) : (
          <CleanItemList
            items={filteredItems}
            selectedIds={selectedIds}
            onToggleItem={toggleItem}
            onSelectAll={selectAll}
            onClearAll={clearAll}
            totalBytes={summary?.total_bytes}
            emptyTitle="SYSTEM IS CLEAN"
            emptyDescription="No junk files found in this category."
          />
        )}
      </div>
    </div>
  );
};
