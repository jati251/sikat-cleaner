import React from "react";
import { useSystemJunkQuery } from "../api";
import { useCleanMutation } from "@/features/smart-scan/api";
import { useAppStore } from "@/stores/useAppStore";
import { useItemSelection } from "@/hooks/useItemSelection";
import { useOperationProgress } from "@/hooks/useOperationProgress";
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
      { id: "all", label: "All", count: items.length },
    ];
    Object.entries(counts).forEach(([cat, count]) => {
      categoryList.push({ id: cat, label: cat, count });
    });
    return categoryList;
  }, [items]);

  const { progress, currentStage } = useOperationProgress({
    isRunning: cleanMutation.isPending,
    stages: [
      "Scanning target cache directories...",
      "Moving application caches to Trash...",
      "Purging temporary system log archives...",
      "Reclaiming storage space...",
    ],
  });

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
    <div className="h-full flex flex-col p-6 space-y-5 overflow-hidden relative">
      {/* Background Fetch / Rescan Progress Bar */}
      <TopProgressBar isLoading={isRefetching} color="purple" />

      {/* Cleaning Progress Modal */}
      <OperationProgressModal
        isOpen={cleanMutation.isPending}
        title="Cleaning System Junk"
        stage={currentStage}
        progress={progress}
        color="purple"
        icon={Trash2}
        subdetail={`Processing ${selectedIds.length} items (${formatBytes(totalSelectedBytes)})`}
      />

      {/* Shared Standard Header */}
      <ViewHeader
        icon={HardDrive}
        iconColor="text-purple-400"
        iconBg="bg-purple-500/20 border-purple-500/30"
        title="System Junk Cleaner"
        description="Clean redundant application caches, temporary system logs, and macOS trash."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              isLoading={isLoading || isRefetching}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Rescan
            </Button>

            <Button
              variant="gradient"
              size="md"
              onClick={handleCleanSelected}
              disabled={selectedIds.length === 0 || cleanMutation.isPending}
              isLoading={cleanMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Clean ({formatBytes(totalSelectedBytes)})
            </Button>
          </>
        }
      />

      {/* Category Tabs */}
      <CategoryTabs
        tabs={categories}
        activeTab={activeCategory}
        onChange={setActiveCategory}
        accentColor="purple"
      />

      {/* Main List */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading || isRefetching ? (
          <LoadingState
            title="Scanning System Junk"
            label="Analyzing system caches and logs..."
            stages={[
              "Inspecting ~/Library/Caches for redundant app data...",
              "Analyzing WebKit, browser, and media cache footprints...",
              "Scanning diagnostic logs & crash reports in /Library/Logs...",
              "Calculating size of items in macOS Trash bin...",
              "Finalizing junk inventory...",
            ]}
            accentColor="purple"
            icon={HardDrive}
          />
        ) : (
          <CleanItemList
            items={filteredItems}
            selectedIds={selectedIds}
            onToggleItem={toggleItem}
            onSelectAll={selectAll}
            onClearAll={clearAll}
            totalBytes={summary?.total_bytes}
            accentColor="purple"
            emptyTitle="System is Spotless!"
            emptyDescription="No junk files found in this category."
          />
        )}
      </div>
    </div>
  );
};
