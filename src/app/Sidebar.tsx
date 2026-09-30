import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
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
  ArrowUpCircle,
} from "lucide-react";
import { UpdaterModal } from "@/components/ui/UpdaterModal";

interface NavItem {
  id: NavSection;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { currentSection, setSection } = useAppStore();
  const { data: memStats } = useMemoryStatsQuery();
  const { data: diskStats = [] } = useDiskStatsQuery();
  const [isUpdaterOpen, setIsUpdaterOpen] = React.useState(false);

  const primaryDisk = diskStats[0];
  const memUsedPercent = memStats?.percentage_used ?? 0;
  const diskFree = primaryDisk ? formatBytes(primaryDisk.available_bytes) : "--";

  const navGroups: { groupName: string; items: NavItem[] }[] = [
    {
      groupName: "CORE ENGINE",
      items: [
        {
          id: "smart-scan",
          label: "SMART CARE",
          sublabel: "One-click deep diagnostics",
          icon: Sparkles,
        },
      ],
    },
    {
      groupName: "SYSTEM CLEANUP",
      items: [
        {
          id: "system-junk",
          label: "SYSTEM JUNK",
          sublabel: "App caches & system logs",
          icon: HardDrive,
        },
        {
          id: "developer-junk",
          label: "DEV ARTIFACTS",
          sublabel: "Xcode, NPM, Cargo, Gradle",
          icon: Terminal,
        },
        {
          id: "space-lens",
          label: "SPACE LENS",
          sublabel: "Large & dormant files",
          icon: PieChart,
        },
      ],
    },
    {
      groupName: "APPS & STARTUP",
      items: [
        {
          id: "app-manager",
          label: "UNINSTALLER",
          sublabel: "Root removal & leftovers",
          icon: Package,
        },
        {
          id: "startup-items",
          label: "STARTUP BOOT",
          sublabel: "LaunchDaemons & Agents",
          icon: Rocket,
        },
      ],
    },
    {
      groupName: "HARDWARE HEALTH",
      items: [
        {
          id: "performance",
          label: "MEMORY PURGE",
          sublabel: "RAM & DNS cache flush",
          icon: Zap,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 h-full bg-[#0e131b] border-r-2 border-[#2a3b50] flex flex-col justify-between select-none">
      {/* Top Header & Window Drag Area */}
      <div
        className="p-3.5 pt-8 cursor-default flex-shrink-0"
        data-tauri-drag-region
        onMouseDown={(e) => {
          if (e.button === 0) {
            getCurrentWindow().startDragging();
          }
        }}
      >
        {/* Brand identity */}
        <div className="flex items-center gap-3 px-1 mb-5 pointer-events-none select-none" data-tauri-drag-region>
          <img
            src="/icon.png"
            alt="Sikat Cleaner"
            className="w-[36px] h-[36px] flex-shrink-0 [image-rendering:pixelated]"
          />
          <div>
            <div className="font-['Press_Start_2P'] text-[10px] text-[#e2f1f8] tracking-tight">
              SIKAT<span className="text-[#00f0ff]">_CLEANER</span>
            </div>
            <div className="font-['VT323'] text-sm text-[#506882] mt-0.5 tracking-wider">
              v0.1.1
            </div>
          </div>
        </div>

        {/* Rainbow Accent Strip */}
        <div className="pixel-rainbow-bar h-[2px] w-full mb-1 opacity-85 pointer-events-none" />
      </div>

      {/* Navigation list */}
      <div className="px-3.5 flex-1 min-h-0 overflow-hidden">
        <nav className="space-y-3.5 overflow-y-auto h-full pr-1">
          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-1">
              <span className="px-2 text-[9px] font-['Press_Start_2P'] text-[#506882] uppercase tracking-wider block">
                {group.groupName}
              </span>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = currentSection === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSection(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-none transition-all cursor-pointer text-left border ${
                        isActive
                          ? "bg-[#182230] text-[#00f0ff] border-l-4 border-l-[#00f0ff] border-y-[#2a3b50] border-r-[#2a3b50] shadow-[2px_2px_0_#06101a]"
                          : "bg-transparent text-[#e2f1f8] border-transparent hover:bg-[#182230] hover:border-[#2a3b50] hover:text-[#00f0ff]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-[#00f0ff]" : "text-[#506882]"}`} />
                        <div className="min-w-0">
                          <span className="block font-['Press_Start_2P'] text-[9px] tracking-tight truncate">
                            {item.label}
                          </span>
                          {item.sublabel && (
                            <span className="font-['VT323'] text-sm text-[#88a7be] block truncate leading-tight">
                              {item.sublabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {item.badge && (
                        <span className="text-[8px] font-['Press_Start_2P'] px-1 py-0.5 border border-[#00f0ff] text-[#00f0ff] bg-[#0e131b] flex-shrink-0">
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
      <div className="p-3 m-2.5 border-2 border-[#2a3b50] bg-[#182230] shadow-[3px_3px_0_#06101a] space-y-2">
        {/* RAM Status Mini */}
        <div>
          <div className="flex items-center justify-between font-['VT323'] text-base mb-0.5">
            <span className="text-[#e2f1f8] flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-[#00ff88] animate-pulse" />
              RAM UTILIZATION
            </span>
            <span className="text-[#00f0ff] font-bold">
              {memUsedPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full bg-[#0e131b] border border-[#2a3b50] p-0.5">
            <div
              className="h-full bg-[#00f0ff] transition-all duration-300"
              style={{ width: `${memUsedPercent}%` }}
            />
          </div>
        </div>

        {/* Disk Status Mini */}
        <div className="flex items-center justify-between font-['VT323'] text-base pt-1 border-t border-[#2a3b50]">
          <span className="text-[#e2f1f8] flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 bg-[#00f0ff]" />
            SSD FREE SPACE
          </span>
          <span className="text-[#00ff88] font-bold">{diskFree}</span>
        </div>

        {/* Check for Updates button */}
        <button
          type="button"
          onClick={() => setIsUpdaterOpen(true)}
          className="w-full pt-1.5 border-t border-[#2a3b50] flex items-center justify-between font-['VT323'] text-sm text-[#88a7be] hover:text-[#00f0ff] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1">
            <ArrowUpCircle className="h-3 w-3 text-[#00f0ff]" /> CHECK UPDATES
          </span>
          <span className="text-[#00ff88]">v0.1.1</span>
        </button>
      </div>

      {/* Updater Modal */}
      <UpdaterModal isOpen={isUpdaterOpen} onClose={() => setIsUpdaterOpen(false)} />
    </aside>
  );
};
