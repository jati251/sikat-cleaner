import React from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface SmartScanRadarProps {
  isScanning: boolean;
  onStartScan: () => void;
  onCleanAll: () => void;
  scanCompleted: boolean;
  reclaimableBytes: number;
  totalFoundCount: number;
  formattedSize: { value: string; unit: string };
  isCleaning: boolean;
}

const SCAN_STAGES = [
  "INSPECTING ~/Library/Caches & WebKit...",
  "SEARCHING Xcode DerivedData & iOS DeviceSupport...",
  "SCANNING Node Modules, Cargo & Package Registries...",
  "ANALYZING macOS System Logs & Crash Reports...",
  "CALCULATING Recoverable Space on Main APFS Volume...",
];

export const SmartScanRadar: React.FC<SmartScanRadarProps> = ({
  isScanning,
  onStartScan,
  onCleanAll,
  scanCompleted,
  totalFoundCount,
  formattedSize,
  isCleaning,
}) => {
  const [stageIdx, setStageIdx] = React.useState(0);

  React.useEffect(() => {
    if (!isScanning) return;
    const timer = setInterval(() => {
      setStageIdx((prev) => (prev + 1) % SCAN_STAGES.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [isScanning]);

  return (
    <div className="flex flex-col items-center justify-center py-4 px-2 text-center select-none font-['VT323']">
      {/* Retro CRT Terminal Radar Viewport */}
      <div className="relative w-full max-w-xl border-2 border-[#2a3b50] bg-[#0e131b] p-7 shadow-[6px_6px_0_#06101a] mb-5 crt-screen overflow-hidden">
        {/* Phosphor Grid crosshair background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(#2a3b50 1px, transparent 1px), linear-gradient(to right, rgba(42,59,80,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(42,59,80,0.15) 1px, transparent 1px)",
            backgroundSize: "16px 16px, 32px 32px, 32px 32px",
          }}
        />

        {/* Radar Circular rings when scanning */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 rounded-full border border-[#2a3b50]" />
            <div className="w-40 h-40 rounded-full border border-[#2a3b50]/60 absolute" />
            <div className="w-24 h-24 rounded-full border border-[#2a3b50]/40 absolute" />
            {/* Rotating radar sweep arm */}
            <div className="absolute w-56 h-56 rounded-full animate-radar-sweep pointer-events-none">
              <div
                className="w-1/2 h-0.5 bg-gradient-to-r from-transparent to-[#00f0ff] absolute top-1/2 right-1/2 origin-right shadow-[0_0_10px_#00f0ff]"
              />
            </div>
          </div>
        )}

        {/* Central Display Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[200px]">
          {isCleaning ? (
            <div className="flex flex-col items-center">
              <div className="data-state-blocks mb-3">
                <i />
                <i />
                <i />
              </div>
              <span className="font-['Press_Start_2P'] text-xs text-[#ff2a6d] uppercase tracking-wider mb-2">
                CLEANING IN PROGRESS...
              </span>
              <p className="font-['VT323'] text-xl text-[#e2f1f8]">
                Deleting temporary junk files & caches
              </p>
            </div>
          ) : isScanning ? (
            <div className="flex flex-col items-center">
              <div className="data-state-blocks mb-3">
                <i />
                <i />
                <i />
              </div>
              <span className="font-['Press_Start_2P'] text-xs text-[#00f0ff] tracking-wider uppercase mb-2">
                SCANNING SYSTEM...
              </span>
              <p className="font-['VT323'] text-xl text-[#00ff88] max-w-md">
                {SCAN_STAGES[stageIdx]}
              </p>
              <div className="w-64 mt-3">
                <ProgressBar indeterminate color="cyan" size="sm" />
              </div>
            </div>
          ) : scanCompleted ? (
            <div className="flex flex-col items-center">
              <span className="font-['Press_Start_2P'] text-[10px] text-[#00ff88] uppercase tracking-widest mb-1">
                ✓ SCAN COMPLETE
              </span>
              <div className="flex items-baseline gap-2 font-['VT323'] text-6xl text-[#00f0ff] tracking-tight">
                <span>{formattedSize.value}</span>
                <span className="text-3xl text-[#00ff88]">{formattedSize.unit}</span>
              </div>
              <p className="font-['VT323'] text-xl text-[#e2f1f8] mt-1">
                [{totalFoundCount} items selected]
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <img
                src="/icon.png"
                alt="Sikat Smart Care"
                className="w-14 h-14 mb-3 [image-rendering:pixelated]"
              />
              <span className="font-['Press_Start_2P'] text-xs text-[#00f0ff] tracking-wide mb-1 uppercase">
                SMART CARE
              </span>
              <p className="font-['VT323'] text-lg text-[#88a7be]">
                App caches, dev artifacts & system logs
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Title & Description */}
      <h2 className="font-['Press_Start_2P'] text-base sm:text-lg text-[#e2f1f8] uppercase tracking-tight mb-2">
        {isScanning
          ? "ANALYZING SYSTEM VOLUMES..."
          : scanCompleted
          ? "SYSTEM CLEANUP READY"
          : "DIAGNOSE & PURGE YOUR MAC"}
      </h2>
      <p className="font-['VT323'] text-lg text-[#88a7be] max-w-lg mb-6 leading-tight">
        {isScanning
          ? "Scanning real macOS system directories, Xcode build outputs, and orphaned caches directly on disk."
          : scanCompleted
          ? "Review detected items below. Only safe temporary caches and build artifacts are selected."
          : "Safely clear gigabytes of hidden caches, Xcode DerivedData, build files, and old logs with zero risk to personal files."}
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {isScanning ? (
          <div className="px-6 py-3 border-2 border-[#00f0ff] bg-[#0e131b] text-[#00f0ff] font-['Press_Start_2P'] text-[11px] uppercase tracking-wider shadow-[3px_3px_0_#062a38] flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00f0ff] inline-block animate-ping" />
            <span>SCANNING IN PROGRESS...</span>
          </div>
        ) : scanCompleted ? (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={onCleanAll}
              isLoading={isCleaning}
              className="px-8 shadow-[4px_4px_0_#062a38]"
            >
              CLEAN NOW ({formattedSize.value} {formattedSize.unit})
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onStartScan}
              disabled={isCleaning}
            >
              RE-SCAN
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="xl"
            onClick={onStartScan}
            isLoading={isScanning}
            className="px-10 shadow-[5px_5px_0_#062a38]"
          >
            START SMART SCAN
          </Button>
        )}
      </div>
    </div>
  );
};
