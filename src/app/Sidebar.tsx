import React from "react";
import { useAppStore } from "@/stores/useAppStore";
import { useMemoryStatsQuery, useDiskStatsQuery } from "@/features/performance/api";
import { NavSection } from "@/types";
import { formatBytes } from "@/utils/formatters";
import {
  Sparkles,
  HardDrive,
  Terminal,
  PieChart,
  Package,
  Rocket,
  Zap,
  Layers,
  ArrowUpCircle,
} from "lucide-react";
import { UpdaterModal } from "@/components/ui/UpdaterModal";

interface NavItem {
  id: NavSection;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  badge?: string;
  color: string;
}

export const Sidebar: React.FC = () => {
  const { currentSection, setSection } = useAppStore();
  const { data: memStats } = useMemoryStatsQuery();
  const { data: diskStats = [] } = useDiskStatsQuery();
  const [isUpdaterOpen, setIsUpdaterOpen] = React.useState(false);

  const primaryDisk = diskStats[0];
  const memUsedPercent = memStats?.percentage_used ?? 0;
  const diskFree = primaryDisk ? formatBytes(primaryDisk.available_bytes) : "Calculating...";

  const navGroups: { groupName: string; items: NavItem[] }[] = [
    {
      groupName: "SMART CARE",
      items: [
        {
          id: "smart-scan",
          label: "Smart Care",
          sublabel: "All-in-One Scan",
          icon: Sparkles,
          color: "text-purple-400",
        },
      ],
    },
    {
      groupName: "CLEANUP",
      items: [
        {
          id: "system-junk",
          label: "System Junk",
          sublabel: "Caches & Logs",
          icon: HardDrive,
          color: "text-blue-400",
        },
        {
          id: "developer-junk",
          label: "Developer Junk",
          sublabel: "Xcode, NPM, Cargo",
          icon: Terminal,
          badge: "Dev",
          color: "text-cyan-400",
        },
        {
          id: "space-lens",
          label: "Space Lens",
          sublabel: "Large & Old Files",
          icon: PieChart,
          color: "text-pink-400",
        },
      ],
    },
    {
      groupName: "APPLICATIONS & BOOT",
      items: [
        {
          id: "app-manager",
          label: "App Uninstaller",
          sublabel: "Deep Clean & Leftovers",
          icon: Package,
          color: "text-indigo-400",
        },
        {
          id: "startup-items",
          label: "Startup Items",
          sublabel: "Launch Agents",
          icon: Rocket,
          color: "text-amber-400",
        },
      ],
    },
    {
      groupName: "SPEED & HEALTH",
      items: [
        {
          id: "performance",
          label: "Performance & RAM",
          sublabel: "Memory Optimizer",
          icon: Zap,
          color: "text-emerald-400",
        },
      ],
    },
  ];

  return (
    <aside className="w-64 h-full bg-slate-950/70 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between select-none">
      {/* Top Header & Window Drag Area */}
      <div className="p-4 pt-10" data-tauri-drag-region>
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
              SIKAT CLEANER
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 font-mono font-medium border border-purple-500/30">
                PRO FREE
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">CleanMyMac Super Alternative</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-1">
              <span className="px-3 text-[10px] font-bold tracking-wider text-slate-400 font-mono uppercase">
                {group.groupName}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = currentSection === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSection(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-150 ${
                        isActive
                          ? "bg-purple-600/25 text-white border border-purple-500/30 shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? "text-purple-400" : item.color}`} />
                        <div className="text-left">
                          <span className="block font-semibold leading-tight">{item.label}</span>
                          {item.sublabel && (
                            <span className="text-[10px] text-slate-400 block leading-tight">
                              {item.sublabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Live System Telemetry Cards */}
      <div className="p-3 m-3 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs">
        {/* RAM Status Mini */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-purple-400" /> RAM
            </span>
            <span className="font-mono text-purple-300 font-bold">
              {memUsedPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${memUsedPercent}%` }}
            />
          </div>
        </div>

        {/* Disk Status Mini */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <HardDrive className="h-3 w-3 text-pink-400" /> SSD Free
            </span>
            <span className="font-mono text-pink-300 font-bold">{diskFree}</span>
          </div>
        </div>

        {/* Check for Updates button */}
        <button
          onClick={() => setIsUpdaterOpen(true)}
          className="w-full pt-1 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1">
            <ArrowUpCircle className="h-3 w-3 text-cyan-400" /> Check for Updates
          </span>
          <span className="font-mono text-slate-500 hover:text-slate-300">v0.1.0</span>
        </button>
      </div>

      {/* Updater Modal */}
      <UpdaterModal isOpen={isUpdaterOpen} onClose={() => setIsUpdaterOpen(false)} />
    </aside>
  );
};
