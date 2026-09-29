import React from "react";
import { useDeveloperJunkQuery, useScanNodeModulesMutation } from "../api";
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
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/utils/formatters";
import { Terminal, RefreshCw, Trash2, Hammer, Search } from "lucide-react";
import { CleanItem } from "@/types";

export const DeveloperJunkView: React.FC = () => {
  const { data: summary, isLoading, refetch, isRefetching } = useDeveloperJunkQuery();
  const cleanMutation = useCleanMutation();
  const scanNodeMutation = useScanNodeModulesMutation();
  const { setLastReclaimed } = useAppStore();

  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [projectDirInput, setProjectDirInput] = React.useState<string>("");
  const [extraNodeItems, setExtraNodeItems] = React.useState<CleanItem[]>([]);

  const defaultItems = React.useMemo(() => summary?.items ?? [], [summary]);
  const allItems = React.useMemo(() => {
    return [...defaultItems, ...extraNodeItems];
  }, [defaultItems, extraNodeItems]);

  const filteredItems = React.useMemo(() => {
    if (activeCategory === "all") return allItems;
    return allItems.filter((i) => i.category === activeCategory);
  }, [allItems, activeCategory]);

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
    allItems.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });

    const categoryList: TabOption[] = [
      { id: "all", label: "All", count: allItems.length },
    ];
    Object.entries(counts).forEach(([cat, count]) => {
      categoryList.push({ id: cat, label: cat, count });
    });
    return categoryList;
  }, [allItems]);

  const handleScanNodeModules = async () => {
    if (!projectDirInput.trim()) return;
    try {
      const results = await scanNodeMutation.mutateAsync(projectDirInput.trim());
      setExtraNodeItems(results);
    } catch (e) {
      console.error("Node modules scan failed:", e);
    }
  };

  const { progress, currentStage } = useOperationProgress({
    isRunning: cleanMutation.isPending,
    stages: [
      "Analyzing build caches and DerivedData...",
      "Clearing package manager caches (npm, brew, cargo)...",
      "Purging developer simulator and runtime files...",
      "Reclaiming disk storage...",
    ],
  });

  const handleCleanSelected = async () => {
    const selectedPaths = allItems
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
    <div className="h-full flex flex-col p-6 space-y-4 overflow-hidden relative">
      {/* Background Fetch / Node Scan Progress Bar */}
      <TopProgressBar
        isLoading={isRefetching || scanNodeMutation.isPending}
        color="cyan"
      />

      {/* Cleaning Progress Modal */}
      <OperationProgressModal
        isOpen={cleanMutation.isPending}
        title="Cleaning Developer Junk"
        stage={currentStage}
        progress={progress}
        color="cyan"
        icon={Terminal}
        subdetail={`Processing ${selectedIds.length} items (${formatBytes(totalSelectedBytes)})`}
      />

      {/* Shared Standard Header */}
      <ViewHeader
        icon={Terminal}
        iconColor="text-cyan-400"
        iconBg="bg-cyan-500/20 border-cyan-500/30"
        title="Developer Junk Cleaner"
        description="Clear build artifacts, derived data, simulator caches, and package manager downloads."
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

      {/* Node Modules Deep Scan Box */}
      <div className="p-3.5 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Hammer className="h-5 w-5 text-cyan-400 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">
              Scan node_modules in Project Folders
            </h4>
            <p className="text-[11px] text-slate-400">
              Enter your project directory (e.g., /Users/jatisuryo/CODE or ~/Projects)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="/Users/jatisuryo/CODE"
            value={projectDirInput}
            onChange={(e) => setProjectDirInput(e.target.value)}
            className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-500"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleScanNodeModules}
            isLoading={scanNodeMutation.isPending}
            disabled={!projectDirInput.trim()}
          >
            <Search className="h-3.5 w-3.5" />
            Scan
          </Button>
        </div>

        {scanNodeMutation.isPending && (
          <div className="w-full mt-2 pt-2 border-t border-cyan-500/10">
            <div className="flex items-center justify-between text-[11px] text-cyan-300 font-mono mb-1.5">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
                Traversing directory for node_modules...
              </span>
              <span>Scanning tree</span>
            </div>
            <ProgressBar indeterminate color="cyan" size="xs" />
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        tabs={categories}
        activeTab={activeCategory}
        onChange={setActiveCategory}
        accentColor="cyan"
      />

      {/* Main List */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading || isRefetching ? (
          <LoadingState
            title="Scanning Developer Environments"
            label="Inspecting Xcode and package manager caches..."
            stages={[
              "Scanning Xcode DerivedData, Archives & ModuleCache...",
              "Inspecting iOS & watchOS DeviceSupport symbols...",
              "Scanning Homebrew bottle download caches...",
              "Checking NPM, Yarn & Cargo package registries...",
              "Calculating developer reclaimed storage...",
            ]}
            accentColor="cyan"
            icon={Terminal}
          />
        ) : (
          <CleanItemList
            items={filteredItems}
            selectedIds={selectedIds}
            onToggleItem={toggleItem}
            onSelectAll={selectAll}
            onClearAll={clearAll}
            totalBytes={summary?.total_bytes}
            accentColor="cyan"
            badgeVariant="cyan"
            emptyTitle="Developer Caches Clear!"
            emptyDescription="No Xcode or package manager caches currently weighing down your Mac."
          />
        )}
      </div>
    </div>
  );
};
