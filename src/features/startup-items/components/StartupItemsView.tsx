import React from "react";
import { motion } from "motion/react";
import {
  useStartupItemsQuery,
  useToggleStartupItemMutation,
  useRemoveStartupItemMutation,
} from "../api";
import { ViewHeader } from "@/components/ui/ViewHeader";
import { CategoryTabs } from "@/components/ui/CategoryTabs";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { revealInFinder } from "@/services/tauriClient";
import { Rocket, RefreshCw, Trash2, ExternalLink } from "lucide-react";

export const StartupItemsView: React.FC = () => {
  const { data: items = [], isLoading, refetch, isRefetching } = useStartupItemsQuery();
  const toggleMutation = useToggleStartupItemMutation();
  const removeMutation = useRemoveStartupItemMutation();

  const [filterScope, setFilterScope] = React.useState<string>("all");

  const filteredItems = React.useMemo(() => {
    if (filterScope === "all") return items;
    return items.filter((i) => i.scope.toLowerCase() === filterScope.toLowerCase());
  }, [items, filterScope]);

  const tabs = React.useMemo(
    () => [
      { id: "all", label: "All", count: items.length },
      { id: "user", label: "User Launch Agents" },
      { id: "system", label: "System Daemons" },
    ],
    [items.length]
  );

  const handleToggle = async (path: string, currentEnabled: boolean) => {
    try {
      await toggleMutation.mutateAsync({ path, enable: !currentEnabled });
    } catch (e) {
      console.error("Toggle startup item failed:", e);
    }
  };

  const handleRemove = async (path: string) => {
    try {
      await removeMutation.mutateAsync(path);
    } catch (e) {
      console.error("Remove startup item failed:", e);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-4 overflow-hidden relative">
      {/* Background Fetch / Toggle / Remove Progress Bar */}
      <TopProgressBar
        isLoading={isRefetching || toggleMutation.isPending || removeMutation.isPending}
        color="cyan"
      />

      {/* Shared Header */}
      <ViewHeader
        icon={Rocket}
        iconColor="text-cyan-400"
        iconBg="bg-cyan-500/20 border-cyan-500/30"
        title="Startup & Launch Agents"
        description="Manage background daemons and applications that automatically start when your Mac boots."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isLoading || isRefetching}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Rescan
          </Button>
        }
      />

      {/* Scope Filter Tabs */}
      <CategoryTabs
        tabs={tabs}
        activeTab={filterScope}
        onChange={setFilterScope}
        accentColor="cyan"
      />

      {/* Main List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading || isRefetching ? (
          <LoadingState
            title="Scanning Startup Items"
            label="Inspecting LaunchAgents & LaunchDaemons..."
            stages={[
              "Reading user LaunchAgents in ~/Library/LaunchAgents...",
              "Scanning system LaunchDaemons in /Library/LaunchDaemons...",
              "Verifying plist launch properties and triggers...",
              "Evaluating background performance impact...",
            ]}
            accentColor="cyan"
            icon={Rocket}
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No startup items found"
            description="Your Mac starts up cleanly without unwanted launch agents."
          />
        ) : (
          filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.25) }}
              whileHover={{ x: 3, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-slate-900/40 hover:border-white/10 transition-colors duration-150"
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex-shrink-0">
                  <Rocket className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100 truncate">
                      {item.name}
                    </span>
                    <Badge variant={item.scope === "User" ? "cyan" : "amber"}>
                      {item.scope}
                    </Badge>
                    <Badge variant={item.is_enabled ? "emerald" : "neutral"}>
                      {item.is_enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                    {item.path}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Button
                  variant={item.is_enabled ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => handleToggle(item.path, item.is_enabled)}
                  isLoading={toggleMutation.isPending}
                >
                  {item.is_enabled ? "Disable" : "Enable"}
                </Button>

                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  title="Reveal in macOS Finder"
                  onClick={() => revealInFinder(item.path)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  title="Remove Launch Agent"
                  onClick={() => handleRemove(item.path)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
