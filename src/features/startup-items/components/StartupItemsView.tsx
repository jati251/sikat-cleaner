import React from "react";
import {
  useStartupItemsQuery,
  useToggleStartupItemMutation,
  useRemoveStartupItemMutation,
} from "../api";
import { StartupSortOption } from "../types";
import { ViewHeader } from "@/components/ui/ViewHeader";
import { CategoryTabs } from "@/components/ui/CategoryTabs";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { revealInFinder } from "@/services/tauriClient";
import {
  AlertTriangle,
  Rocket,
  RefreshCw,
  Trash2,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";

export const StartupItemsView: React.FC = () => {
  const { data: items = [], isLoading, refetch, isRefetching } = useStartupItemsQuery();
  const toggleMutation = useToggleStartupItemMutation();
  const removeMutation = useRemoveStartupItemMutation();

  const [filterScope, setFilterScope] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<StartupSortOption>("name_asc");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const filteredAndSortedItems = React.useMemo(() => {
    let result = items;
    if (filterScope !== "all") {
      result = result.filter((i) => i.scope.toLowerCase() === filterScope.toLowerCase());
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "status_active":
          return Number(b.is_enabled) - Number(a.is_enabled);
        case "status_disabled":
          return Number(a.is_enabled) - Number(b.is_enabled);
        case "scope_user":
          return a.scope === "User" ? -1 : 1;
        default:
          return 0;
      }
    });
  }, [items, filterScope, sortBy]);

  const tabs = React.useMemo(
    () => [
      { id: "all", label: "ALL", count: items.length },
      { id: "user", label: "USER AGENTS" },
      { id: "system", label: "SYSTEM DAEMONS" },
    ],
    [items.length]
  );

  const handleToggle = async (path: string, currentEnabled: boolean) => {
    setErrorMessage(null);
    try {
      await toggleMutation.mutateAsync({ path, enable: !currentEnabled });
    } catch (e) {
      console.error("Toggle startup item failed:", e);
      setErrorMessage(
        "Operation failed: System daemons in /Library require root administrator permissions to modify."
      );
    }
  };

  const handleRemove = async (path: string) => {
    setErrorMessage(null);
    try {
      await removeMutation.mutateAsync(path);
    } catch (e) {
      console.error("Remove startup item failed:", e);
      setErrorMessage(
        "Operation failed: System daemons in /Library require root administrator permissions to remove."
      );
    }
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-5 space-y-4 overflow-hidden relative font-['VT323']">
      {/* Background Fetch / Toggle / Remove Progress Bar */}
      <TopProgressBar
        isLoading={isRefetching || toggleMutation.isPending || removeMutation.isPending}
      />

      {/* Header */}
      <ViewHeader
        icon={Rocket}
        iconColor="text-[#00f0ff]"
        iconBg="bg-[#0e131b] border-[#2a3b50]"
        title="STARTUP & LAUNCH AGENTS"
        description="Inspect and toggle background launch services and daemons that trigger when macOS boots."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isLoading || isRefetching}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            RE-SCAN
          </Button>
        }
      />

      {/* Scope Filter Tabs & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0">
        <CategoryTabs
          tabs={tabs}
          activeTab={filterScope}
          onChange={setFilterScope}
        />

        <div className="flex items-center gap-2 bg-[#0e131b] border-2 border-[#2a3b50] px-2.5 py-1 text-base text-[#e2f1f8] self-start sm:self-auto flex-shrink-0">
          <ArrowUpDown className="h-3.5 w-3.5 text-[#00f0ff]" />
          <span className="text-xs text-[#506882] font-['Press_Start_2P'] uppercase">SORT:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as StartupSortOption)}
            className="bg-transparent text-[#00f0ff] text-base focus:outline-none cursor-pointer"
          >
            <option value="name_asc" className="bg-[#0e131b] text-[#e2f1f8]">NAME (A-Z)</option>
            <option value="name_desc" className="bg-[#0e131b] text-[#e2f1f8]">NAME (Z-A)</option>
            <option value="status_active" className="bg-[#0e131b] text-[#e2f1f8]">ACTIVE FIRST</option>
            <option value="status_disabled" className="bg-[#0e131b] text-[#e2f1f8]">DISABLED FIRST</option>
            <option value="scope_user" className="bg-[#0e131b] text-[#e2f1f8]">USER AGENTS FIRST</option>
          </select>
        </div>
      </div>

      {/* Error Feedback Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between p-2.5 border-2 border-[#ff2a6d] bg-[#0e131b] text-[#ff2a6d] text-base flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-['Press_Start_2P'] uppercase text-[#506882] hover:text-[#ff2a6d] cursor-pointer ml-3"
          >
            [DISMISS]
          </button>
        </div>
      )}

      {/* Main List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {isLoading || isRefetching ? (
          <LoadingState
            title="SCANNING LAUNCH AGENTS"
            label="Inspecting ~/Library/LaunchAgents & /Library/LaunchDaemons..."
            stages={[
              "Reading user LaunchAgents in ~/Library/LaunchAgents...",
              "Scanning system LaunchDaemons in /Library/LaunchDaemons...",
              "Verifying plist launch triggers and RunAtLoad keys...",
              "Evaluating background startup impact...",
            ]}
          />
        ) : filteredAndSortedItems.length === 0 ? (
          <EmptyState
            title="NO STARTUP DAEMONS"
            description="Your Mac boots without non-system launch agents."
          />
        ) : (
          filteredAndSortedItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-2 border-[#2a3b50] bg-[#182230] hover:border-[#506882] shadow-[2px_2px_0_#06101a] transition-all gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 pr-0 sm:pr-4 flex-1">
                <div className="p-2 border border-[#2a3b50] bg-[#0e131b] text-[#00f0ff] flex-shrink-0">
                  <Rocket className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg text-[#e2f1f8] truncate">
                      {item.name}
                    </span>
                    <Badge variant={item.scope === "User" ? "cyan" : "amber"}>
                      {item.scope}
                    </Badge>
                    <Badge variant={item.is_enabled ? "emerald" : "neutral"}>
                      {item.is_enabled ? "ACTIVE" : "DISABLED"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#506882] truncate font-mono">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-[#506882] truncate font-mono">
                    {item.path}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-shrink-0 border-t sm:border-t-0 border-[#2a3b50]/60 pt-2 sm:pt-0">
                <Button
                  variant={item.is_enabled ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => handleToggle(item.path, item.is_enabled)}
                  isLoading={
                    toggleMutation.isPending &&
                    toggleMutation.variables?.path === item.path
                  }
                >
                  {item.is_enabled ? "DISABLE" : "ENABLE"}
                </Button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Reveal in Finder"
                    onClick={() => revealInFinder(item.path)}
                    className="p-1 border border-[#2a3b50] bg-[#0e131b] text-[#506882] hover:text-[#00f0ff] hover:border-[#00f0ff] cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Remove Launch Agent"
                    disabled={
                      removeMutation.isPending &&
                      removeMutation.variables === item.path
                    }
                    onClick={() => handleRemove(item.path)}
                    className="p-1 border border-[#2a3b50] bg-[#0e131b] text-[#ff2a6d] hover:border-[#ff2a6d] cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
