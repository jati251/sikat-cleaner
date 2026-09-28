import React from "react";
import { useSystemJunkQuery } from "../api";
import { useCleanMutation } from "@/features/smart-scan/api";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { formatBytes } from "@/utils/formatters";
import { safeInvoke } from "@/services/tauriClient";
import { HardDrive, RefreshCw, Trash2, ExternalLink, ShieldCheck } from "lucide-react";

export const SystemJunkView: React.FC = () => {
  const { data: summary, isLoading, refetch, isRefetching } = useSystemJunkQuery();
  const cleanMutation = useCleanMutation();
  const { setLastReclaimed } = useAppStore();

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<string>("all");

  const items = summary?.items ?? [];

  // Filtered items based on active category
  const filteredItems = React.useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((i) => i.category === activeCategory);
  }, [items, activeCategory]);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.category));
    return Array.from(set);
  }, [items]);

  const totalBytesSelected = React.useMemo(() => {
    return items
      .filter((i) => selectedIds.includes(i.id))
      .reduce((acc, curr) => acc + curr.size_bytes, 0);
  }, [items, selectedIds]);

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
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">System Junk Cleaner</h2>
              <p className="text-xs text-slate-400">
                Clean redundant application caches, temporary system logs, and macOS trash.
              </p>
            </div>
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
            Clean ({formatBytes(totalBytesSelected)})
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
            activeCategory === "all"
              ? "bg-purple-600 text-white font-semibold"
              : "bg-slate-800/80 text-slate-400 hover:text-white"
          }`}
        >
          All ({items.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              activeCategory === cat
                ? "bg-purple-600 text-white font-semibold"
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
            <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
            <span className="text-sm font-medium">Scanning system junk...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
            <ShieldCheck className="h-10 w-10 text-emerald-400 mb-1" />
            <span className="text-base font-semibold text-white">System is Spotless!</span>
            <span className="text-xs text-slate-400">No junk files found in this category.</span>
          </div>
        ) : (
          <>
            {/* Quick Select All bar */}
            <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 bg-slate-900/40 rounded-xl">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllFilteredSelected}
                  onChange={(c) => (c ? handleSelectAll() : handleClearAll())}
                  id="select-filtered-sys"
                />
                <label htmlFor="select-filtered-sys" className="cursor-pointer font-medium text-slate-300">
                  Select All in View ({selectedIds.length} selected)
                </label>
              </div>
              <span className="font-mono text-purple-300 font-semibold">
                Total: {formatBytes(summary?.total_bytes ?? 0)}
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
                      ? "bg-purple-950/20 border-purple-500/40 shadow-sm"
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
                        <Badge variant="neutral">{item.category}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.description}</p>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                        {item.path}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-mono font-bold text-purple-300">
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
