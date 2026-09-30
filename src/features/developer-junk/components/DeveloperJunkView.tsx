import React from "react";
import { useDeveloperJunkQuery, useScanNodeModulesMutation } from "../api";
import { useCleanMutation } from "@/features/smart-scan/api";
import { useAppStore } from "@/stores/useAppStore";
import { useItemSelection } from "@/hooks/useItemSelection";
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
      { id: "all", label: "ALL", count: allItems.length },
    ];
    Object.entries(counts).forEach(([cat, count]) => {
      categoryList.push({ id: cat, label: cat.toUpperCase(), count });
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
    <div className="h-full flex flex-col p-5 space-y-4 overflow-hidden relative font-['VT323']">
      {/* Background Fetch / Node Scan Progress Bar */}
      <TopProgressBar
        isLoading={isRefetching || scanNodeMutation.isPending}
      />

      {/* Real Cleaning Progress Modal */}
      <OperationProgressModal
        isOpen={cleanMutation.isPending}
        title="CLEANING DEVELOPER JUNK"
        stage="Cleaning Xcode build artifacts, DerivedData, and package caches..."
        indeterminate={true}
        subdetail={`Target: ${selectedIds.length} items (${formatBytes(totalSelectedBytes)})`}
      />

      {/* Header */}
      <ViewHeader
        icon={Terminal}
        iconColor="text-[#00f0ff]"
        iconBg="bg-[#0e131b] border-[#2a3b50]"
        title="DEVELOPER ARTIFACTS"
        description="Clean Xcode DerivedData, iOS simulators, package manager caches, and local node_modules."
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

      {/* Node Modules Deep Scan Box */}
      <div className="p-3 border-2 border-[#2a3b50] bg-[#182230] shadow-[3px_3px_0_#06101a] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 border border-[#00f0ff] bg-[#0e131b] text-[#00f0ff]">
            <Hammer className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-['Press_Start_2P'] text-[9px] text-[#00f0ff] uppercase">
              SCAN NODE_MODULES IN REPOSITORIES
            </h4>
            <p className="text-base text-[#e2f1f8]">
              Enter absolute project path (e.g. /Users/jatisuryo/CODE or ~/Projects)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="/Users/jatisuryo/CODE"
            value={projectDirInput}
            onChange={(e) => setProjectDirInput(e.target.value)}
            className="flex-1 bg-[#0e131b] border-2 border-[#2a3b50] px-3 py-1.5 text-lg text-[#e2f1f8] placeholder-[#506882] focus:outline-none focus:border-[#00f0ff]"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleScanNodeModules}
            isLoading={scanNodeMutation.isPending}
            disabled={!projectDirInput.trim()}
          >
            <Search className="h-3 w-3 mr-1" />
            SCAN
          </Button>
        </div>

        {scanNodeMutation.isPending && (
          <div className="w-full mt-1 pt-2 border-t border-[#2a3b50]">
            <div className="flex items-center justify-between text-base text-[#00f0ff] mb-1">
              <span>TRAVERSING DIRECTORY FOR NODE_MODULES...</span>
              <span>IN PROGRESS</span>
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
      />

      {/* Main List */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading || isRefetching ? (
          <LoadingState
            title="SCANNING DEV ENVIRONMENTS"
            label="Inspecting Xcode DerivedData, Cargo & package registries..."
            stages={[
              "Inspecting Xcode DerivedData, Archives & ModuleCache...",
              "Analyzing iOS & watchOS DeviceSupport symbols...",
              "Scanning Homebrew bottle download caches...",
              "Checking NPM, Yarn, Pnpm & Cargo package registries...",
              "Calculating developer reclaimed storage...",
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
            badgeVariant="cyan"
            emptyTitle="DEV CACHES CLEAN"
            emptyDescription="No Xcode or package manager caches currently weighing down your Mac."
          />
        )}
      </div>
    </div>
  );
};
