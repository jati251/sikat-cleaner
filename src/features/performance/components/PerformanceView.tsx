import React from "react";
import { motion } from "motion/react";
import {
  useMemoryStatsQuery,
  useDiskStatsQuery,
  usePurgeMemoryMutation,
  useFlushDnsMutation,
} from "../api";
import { ViewHeader } from "@/components/ui/ViewHeader";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { OperationProgressModal } from "@/components/ui/OperationProgressModal";
import { useOperationProgress } from "@/hooks/useOperationProgress";
import { formatBytes } from "@/utils/formatters";
import {
  Cpu,
  HardDrive,
  Zap,
  Globe,
  CheckCircle2,
  Activity,
  Layers,
} from "lucide-react";

export const PerformanceView: React.FC = () => {
  const { data: memStats } = useMemoryStatsQuery();
  const { data: diskStats = [] } = useDiskStatsQuery();
  const purgeMutation = usePurgeMemoryMutation();
  const flushDnsMutation = useFlushDnsMutation();

  const [dnsFlushed, setDnsFlushed] = React.useState(false);

  const primaryDisk = diskStats[0];

  const { progress: purgeProgress, currentStage: purgeStage } = useOperationProgress({
    isRunning: purgeMutation.isPending,
    stages: [
      "Requesting macOS kernel memory release...",
      "Purging inactive file system disk buffers...",
      "Deallocating unreferenced memory pages...",
      "Recalculating free physical memory...",
    ],
  });

  const { progress: dnsProgress, currentStage: dnsStage } = useOperationProgress({
    isRunning: flushDnsMutation.isPending,
    stages: [
      "Querying mDNSResponder daemon...",
      "Flushing local lookup cache sockets...",
      "Restarting Discovery services...",
      "DNS cache successfully cleared!",
    ],
  });

  const handlePurgeMemory = async () => {
    try {
      await purgeMutation.mutateAsync();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFlushDns = async () => {
    try {
      await flushDnsMutation.mutateAsync();
      setDnsFlushed(true);
      setTimeout(() => setDnsFlushed(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const memPercent = memStats?.percentage_used ?? 0;
  const cpuPercent = memStats?.cpu_usage ?? 0;

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto relative">
      {/* RAM Purge Progress Modal */}
      <OperationProgressModal
        isOpen={purgeMutation.isPending}
        title="Purging System Memory (RAM)"
        stage={purgeStage}
        progress={purgeProgress}
        color="purple"
        icon={Zap}
        subdetail={`Releasing up to ${formatBytes(memStats?.inactive_bytes ?? 0)} of inactive cache`}
      />

      {/* DNS Flush Progress Modal */}
      <OperationProgressModal
        isOpen={flushDnsMutation.isPending}
        title="Flushing DNS Cache"
        stage={dnsStage}
        progress={dnsProgress}
        color="cyan"
        icon={Globe}
        subdetail="Resolving local mDNSResponder state"
      />

      {/* Shared Header */}
      <ViewHeader
        icon={Zap}
        iconColor="text-amber-400"
        iconBg="bg-amber-500/20 border-amber-500/30"
        title="Performance & Maintenance"
        description="Monitor RAM usage, purge inactive memory caches, and speed up connections."
        actions={
          <Badge variant="emerald" className="py-1">
            <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            Live Monitor
          </Badge>
        }
      />

      {/* Grid of Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RAM Monitor Card */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className={`rounded-2xl border bg-slate-900/60 p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between transition-colors duration-300 ${
            purgeMutation.isSuccess
              ? "border-emerald-500/50 shadow-lg shadow-emerald-500/20"
              : "border-white/10 hover:border-purple-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">System Memory (RAM)</h3>
                <span className="text-xs text-slate-400">
                  Total: {formatBytes(memStats?.total_bytes ?? 0)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black font-mono text-purple-300">
                {memPercent.toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-400 block">Used</span>
            </div>
          </div>

          <div className="space-y-3">
            <ProgressBar value={memPercent} color="purple" />

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Active Memory</span>
                <span className="font-mono font-bold text-white">
                  {formatBytes(memStats?.used_bytes ?? 0)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Inactive Cache</span>
                <span className="font-mono font-bold text-amber-300">
                  {formatBytes(memStats?.inactive_bytes ?? 0)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Free Memory</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatBytes(memStats?.free_bytes ?? 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-auto">
            {purgeMutation.isPending ? (
              <div className="space-y-2 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center justify-between text-xs text-purple-300 font-mono">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Zap className="h-3.5 w-3.5 animate-pulse text-purple-400" />
                    Purging Inactive RAM...
                  </span>
                  <span className="font-bold">{purgeProgress}%</span>
                </div>
                <ProgressBar value={purgeProgress} color="purple" size="sm" />
                <span className="text-[10px] text-slate-400 block truncate">{purgeStage}</span>
              </div>
            ) : (
              <Button
                variant="gradient"
                size="md"
                onClick={handlePurgeMemory}
                isLoading={purgeMutation.isPending}
                className="w-full"
              >
                <Zap className="h-4 w-4 fill-current" />
                Free Up RAM Now (Purge)
              </Button>
            )}
          </div>
        </motion.div>

        {/* Storage / SSD Card */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="rounded-2xl border border-white/10 hover:border-pink-500/30 bg-slate-900/60 p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between transition-colors duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {primaryDisk?.name ?? "Macintosh HD"}
                </h3>
                <span className="text-xs text-slate-400">
                  Total: {formatBytes(primaryDisk?.total_bytes ?? 0)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black font-mono text-pink-300">
                {primaryDisk && primaryDisk.total_bytes > 0
                  ? ((primaryDisk.used_bytes / primaryDisk.total_bytes) * 100).toFixed(0)
                  : 0}
                %
              </span>
              <span className="text-[10px] text-slate-400 block">Capacity</span>
            </div>
          </div>

          <div className="space-y-3">
            <ProgressBar
              value={
                primaryDisk && primaryDisk.total_bytes > 0
                  ? (primaryDisk.used_bytes / primaryDisk.total_bytes) * 100
                  : 0
              }
              color="rose"
            />

            <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Available / Free</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatBytes(primaryDisk?.available_bytes ?? 0)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Used</span>
                <span className="font-mono font-bold text-rose-300">
                  {formatBytes(primaryDisk?.used_bytes ?? 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick CPU status indicator */}
          <div className="pt-4 flex items-center justify-between text-xs text-slate-400 border-t border-white/5 mt-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span>Global CPU Load:</span>
            </div>
            <span className="font-mono font-bold text-cyan-300">
              {cpuPercent.toFixed(1)}%
            </span>
          </div>
        </motion.div>
      </div>

      {/* Maintenance Tasks Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white tracking-wide">
          macOS System Maintenance Tools
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Flush DNS */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="p-4 rounded-2xl border border-white/10 hover:border-cyan-500/30 bg-slate-900/40 hover:bg-white/5 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Flush DNS Cache</h4>
                <p className="text-xs text-slate-400">
                  Flush local DNS resolver caches and restart mDNSResponder.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleFlushDns}
              isLoading={flushDnsMutation.isPending}
            >
              {dnsFlushed ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Flushed!
                </>
              ) : (
                "Execute"
              )}
            </Button>
          </motion.div>

          {/* Quick RAM Refresh */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="p-4 rounded-2xl border border-white/10 hover:border-purple-500/30 bg-slate-900/40 hover:bg-white/5 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Refresh Disk Buffers</h4>
                <p className="text-xs text-slate-400">
                  Force the macOS kernel to release inactive disk page caches.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handlePurgeMemory}
              isLoading={purgeMutation.isPending}
            >
              Purge
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
