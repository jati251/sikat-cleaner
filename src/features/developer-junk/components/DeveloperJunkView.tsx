import React from "react";
import { useDeveloperJunkQuery, useScanNodeModulesMutation } from "../api";
import { useCleanMutation } from "@/features/smart-scan/api";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { formatBytes } from "@/utils/formatters";
import { safeInvoke } from "@/services/tauriClient";
import { CleanItem } from "@/types";
import {
  Terminal,
  RefreshCw,
  Trash2,
  ExternalLink,
  Hammer,
  Search,
  CheckCircle2,
} from "lucide-react";

export const DeveloperJunkView: React.FC = () => {
  const { data: summary, isLoading, refetch, isRefetching } = useDeveloperJunkQuery();
  const cleanMutation = useCleanMutation();
  const scanNodeMutation = useScanNodeModulesMutation();
  const { setLastReclaimed } = useAppStore();

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [projectDirInput, setProjectDirInput] = React.useState<string>("");
  const [extraNodeItems, setExtraNodeItems] = React.useState<CleanItem[]>([]);

  const defaultItems = summary?.items ?? [];
  const allItems = React.useMemo(() => {
    return [...defaultItems, ...extraNodeItems];
  }, [defaultItems, extraNodeItems]);

  const filteredItems = React.useMemo(() => {
    if (activeCategory === "all") return allItems;
    return allItems.filter((i) => i.category === activeCategory);
  }, [allItems, activeCategory]);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((i) => set.add(i.category));
    return Array.from(set);
  }, [allItems]);

  const totalBytesSelected = React.useMemo(() => {
    return allItems
      .filter((i) => selectedIds.includes(i.id))
      .reduce((acc, curr) => acc + curr.size_bytes, 0);
  }, [allItems, selectedIds]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredItems.map((i) => i.id));
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const handleRevealInFinder = async (path: string) => {
    try {
      await safeInvoke("reveal_in_finder", { path });
    } catch (e) {
      console.error(e);
    }
  };

  const handleScanNodeModules = async () => {
    if (!projectDirInput.trim()) return;
    try {
      const items = await scanNodeMutation.mutateAsync(projectDirInput.trim());
      setExtraNodeItems(items);
    } catch (e) {
      console.error(e);
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
      setExtraNodeItems([]);
    } catch (e) {
      console.error(e);
    }
  };

  const isAllFilteredSelected =
    filteredItems.length > 0 &&
    filteredItems.every((i) => selectedIds.includes(i.id));

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Developer Junk Cleaner</h2>
            <p className="text-xs text-slate-400">
              Xcode DerivedData, CocoaPods, Android SDK, Homebrew, Cargo, & Node Modules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
            Clean Dev Junk ({formatBytes(totalBytesSelected)})
          </Button>
        </div>
      </div>

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
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
            activeCategory === "all"
              ? "bg-cyan-600 text-white font-semibold"
              : "bg-slate-800/80 text-slate-400 hover:text-white"
          }`}
        >
          All ({allItems.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              activeCategory === cat
                ? "bg-cyan-600 text-white font-semibold"
                : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
            <span className="text-sm font-medium">Scanning developer caches...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-1" />
            <span className="text-base font-semibold text-white">Developer Caches Clear!</span>
            <span className="text-xs text-slate-400">
              No Xcode or package manager caches currently weighing down your Mac.
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-900/40 rounded-xl">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllFilteredSelected}
                  onChange={(c) => (c ? handleSelectAll() : handleClearAll())}
                  id="select-filtered-dev"
                />
                <label htmlFor="select-filtered-dev" className="cursor-pointer font-medium text-slate-300">
                  Select All ({selectedIds.length} selected)
                </label>
              </div>
              <span className="font-mono text-cyan-300 font-semibold">
                Total Reclaimable: {formatBytes(summary?.total_bytes ?? 0)}
              </span>
            </div>

            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-cyan-950/20 border-cyan-500/40 shadow-sm"
                      : "bg-slate-900/40 border-white/5 hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <Checkbox checked={isSelected} onChange={() => toggleItem(item.id)} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-100 truncate">
                          {item.title}
                        </span>
                        <Badge variant="cyan">{item.category}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.description}</p>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                        {item.path}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-mono font-bold text-cyan-300">
                      {formatBytes(item.size_bytes)}
                    </span>
                    <button
                      type="button"
                      title="Reveal in macOS Finder"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevealInFinder(item.path);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
