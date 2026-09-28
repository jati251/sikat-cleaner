import React from "react";
import {
  useStartupItemsQuery,
  useToggleStartupItemMutation,
  useRemoveStartupItemMutation,
} from "../api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { safeInvoke } from "@/services/tauriClient";
import { Rocket, RefreshCw, Trash2, ExternalLink, ShieldCheck } from "lucide-react";

export const StartupItemsView: React.FC = () => {
  const { data: items = [], isLoading, refetch, isRefetching } = useStartupItemsQuery();
  const toggleMutation = useToggleStartupItemMutation();
  const removeMutation = useRemoveStartupItemMutation();

  const [filterScope, setFilterScope] = React.useState<string>("all");

  const filteredItems = React.useMemo(() => {
    if (filterScope === "all") return items;
    return items.filter((i) => i.scope.toLowerCase() === filterScope.toLowerCase());
  }, [items, filterScope]);

  const handleRevealInFinder = async (path: string) => {
    try {
      await safeInvoke("reveal_in_finder", { path });
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (path: string, currentEnabled: boolean) => {
    try {
      await toggleMutation.mutateAsync({ path, enable: !currentEnabled });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = async (path: string) => {
    try {
      await removeMutation.mutateAsync(path);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Startup & Launch Agents
            </h2>
            <p className="text-xs text-slate-400">
              Manage background daemons and applications that automatically start when your Mac boots.
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
        </div>
      </div>

      {/* Scope Filter Tabs */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {[
          { id: "all", label: `All (${items.length})` },
          { id: "user", label: "User Launch Agents" },
          { id: "system", label: "System Daemons" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterScope(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              filterScope === tab.id
                ? "bg-cyan-600 text-white font-semibold"
                : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
            <span className="text-sm font-medium">Inspecting LaunchAgents and startup daemons...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
            <ShieldCheck className="h-10 w-10 text-emerald-400 mb-1" />
            <span className="text-base font-semibold text-white">No startup items found</span>
            <span className="text-xs text-slate-400">Your Mac starts up cleanly without unwanted launch agents.</span>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-white/5 hover:border-white/10 transition-all duration-150"
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
                {/* Toggle Enable/Disable Button */}
                <Button
                  variant={item.is_enabled ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => handleToggle(item.path, item.is_enabled)}
                  isLoading={toggleMutation.isPending}
                >
                  {item.is_enabled ? "Disable" : "Enable"}
                </Button>

                <button
                  type="button"
                  title="Reveal in macOS Finder"
                  onClick={() => handleRevealInFinder(item.path)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  title="Remove Launch Agent"
                  onClick={() => handleRemove(item.path)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
