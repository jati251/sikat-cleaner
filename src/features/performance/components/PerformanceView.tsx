import React from "react";
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
    <div className="h-full flex flex-col p-5 space-y-4 overflow-y-auto relative font-['VT323']">
      {/* Real RAM Purge Progress Modal */}
      <OperationProgressModal
        isOpen={purgeMutation.isPending}
        title="PURGING SYSTEM MEMORY (RAM)"
        stage="Requesting kernel memory release and reclaiming inactive buffers..."
        indeterminate={true}
        subdetail={`Releasing up to ${formatBytes(memStats?.inactive_bytes ?? 0)} of inactive cache`}
      />

      {/* Real DNS Flush Progress Modal */}
      <OperationProgressModal
        isOpen={flushDnsMutation.isPending}
        title="FLUSHING DNS RESOLVER"
        stage="Calling dscacheutil and signaling mDNSResponder daemon..."
        indeterminate={true}
        subdetail="Resolving local macOS network lookup sockets"
      />

      {/* Header */}
      <ViewHeader
        icon={Zap}
        iconColor="text-[#00f0ff]"
        iconBg="bg-[#0e131b] border-[#2a3b50]"
        title="HARDWARE & KERNEL MAINTENANCE"
        description="Monitor physical RAM utilization, purge inactive buffer pages, and flush DNS socket caches."
        actions={
          <Badge variant="emerald">
            <Activity className="h-3 w-3 mr-1 inline animate-pulse" />
            LIVE TELEMETRY
          </Badge>
        }
      />

      {/* Grid of Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RAM Monitor Card */}
        <div
          className={`border-2 bg-[#182230] p-4 shadow-[3px_3px_0_#06101a] flex flex-col justify-between transition-colors ${
            purgeMutation.isSuccess
              ? "border-[#00ff88]"
              : "border-[#2a3b50]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 border border-[#2a3b50] bg-[#0e131b] text-[#00f0ff]">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-['Press_Start_2P'] text-[10px] text-[#00f0ff] uppercase">
                  SYSTEM MEMORY (RAM)
                </h3>
                <span className="text-base text-[#506882]">
                  PHYSICAL: {formatBytes(memStats?.total_bytes ?? 0)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-5xl font-bold text-[#00f0ff]">
                {memPercent.toFixed(0)}%
              </span>
              <span className="text-xs text-[#506882] block uppercase font-['Press_Start_2P']">
                USED
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <ProgressBar value={memPercent} color="cyan" size="md" />

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 border border-[#2a3b50] bg-[#0e131b]">
                <span className="text-[#506882] block text-sm">ACTIVE RAM</span>
                <span className="text-lg text-[#e2f1f8] font-bold">
                  {formatBytes(memStats?.used_bytes ?? 0)}
                </span>
              </div>
              <div className="p-2 border border-[#2a3b50] bg-[#0e131b]">
                <span className="text-[#506882] block text-sm">INACTIVE CACHE</span>
                <span className="text-lg text-[#ffb703] font-bold">
                  {formatBytes(memStats?.inactive_bytes ?? 0)}
                </span>
              </div>
              <div className="p-2 border border-[#2a3b50] bg-[#0e131b]">
                <span className="text-[#506882] block text-sm">FREE RAM</span>
                <span className="text-lg text-[#00ff88] font-bold">
                  {formatBytes(memStats?.free_bytes ?? 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-auto">
            <Button
              variant="primary"
              size="md"
              onClick={handlePurgeMemory}
              isLoading={purgeMutation.isPending}
              className="w-full shadow-[3px_3px_0_#062a38]"
            >
              <Zap className="h-4 w-4 mr-1" />
              PURGE INACTIVE RAM NOW
            </Button>
          </div>
        </div>

        {/* Storage / SSD Card */}
        <div className="border-2 border-[#2a3b50] bg-[#182230] p-4 shadow-[3px_3px_0_#06101a] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 border border-[#2a3b50] bg-[#0e131b] text-[#ff2a6d]">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-['Press_Start_2P'] text-[10px] text-[#ff2a6d] uppercase">
                  {primaryDisk?.name ?? "MACINTOSH HD"}
                </h3>
                <span className="text-base text-[#506882]">
                  CAPACITY: {formatBytes(primaryDisk?.total_bytes ?? 0)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-5xl font-bold text-[#ff2a6d]">
                {primaryDisk && primaryDisk.total_bytes > 0
                  ? ((primaryDisk.used_bytes / primaryDisk.total_bytes) * 100).toFixed(0)
                  : 0}
                %
              </span>
              <span className="text-xs text-[#506882] block uppercase font-['Press_Start_2P']">
                OCCUPIED
              </span>
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
              size="md"
            />

            <div className="grid grid-cols-2 gap-2 pt-1 text-center">
              <div className="p-2 border border-[#2a3b50] bg-[#0e131b]">
                <span className="text-[#506882] block text-sm">FREE / AVAILABLE</span>
                <span className="text-lg text-[#00ff88] font-bold">
                  {formatBytes(primaryDisk?.available_bytes ?? 0)}
                </span>
              </div>
              <div className="p-2 border border-[#2a3b50] bg-[#0e131b]">
                <span className="text-[#506882] block text-sm">OCCUPIED BY DATA</span>
                <span className="text-lg text-[#ff2a6d] font-bold">
                  {formatBytes(primaryDisk?.used_bytes ?? 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick CPU status indicator */}
          <div className="pt-3 flex items-center justify-between text-base text-[#e2f1f8] border-t border-[#2a3b50] mt-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#00f0ff] animate-pulse" />
              <span>GLOBAL CPU UTILIZATION:</span>
            </div>
            <span className="text-[#00f0ff] font-bold text-lg">
              {cpuPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Maintenance Tasks Section */}
      <div className="space-y-2.5">
        <h3 className="font-['Press_Start_2P'] text-[10px] text-[#00f0ff] uppercase">
          macOS KERNEL & SOCKET TASKS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Flush DNS */}
          <div className="p-3 border-2 border-[#2a3b50] bg-[#182230] shadow-[2px_2px_0_#06101a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-[#2a3b50] bg-[#0e131b] text-[#00f0ff]">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-['Press_Start_2P'] text-[9px] text-[#00f0ff] uppercase">
                  FLUSH DNS CACHE
                </h4>
                <p className="text-base text-[#e2f1f8]">
                  Flush local resolver sockets & restart mDNSResponder.
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
                  <CheckCircle2 className="h-3 w-3 text-[#00ff88] mr-1" />
                  FLUSHED!
                </>
              ) : (
                "EXECUTE"
              )}
            </Button>
          </div>

          {/* Quick RAM Refresh */}
          <div className="p-3 border-2 border-[#2a3b50] bg-[#182230] shadow-[2px_2px_0_#06101a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-[#2a3b50] bg-[#0e131b] text-[#00f0ff]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-['Press_Start_2P'] text-[9px] text-[#00f0ff] uppercase">
                  RELEASE DISK BUFFERS
                </h4>
                <p className="text-base text-[#e2f1f8]">
                  Force kernel to release inactive disk page caches.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handlePurgeMemory}
              isLoading={purgeMutation.isPending}
            >
              PURGE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
