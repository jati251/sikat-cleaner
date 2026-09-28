import React from "react";
import { Sparkles, ShieldCheck, Zap, HardDrive, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";

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

export const SmartScanRadar: React.FC<SmartScanRadarProps> = ({
  isScanning,
  onStartScan,
  onCleanAll,
  scanCompleted,
  totalFoundCount,
  formattedSize,
  isCleaning,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {/* Central Visual Hologram Orb */}
      <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center mb-8">
        {/* Ambient background glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/30 via-pink-600/20 to-cyan-500/20 blur-3xl" />

        {/* Outer Rotating Scan Ring */}
        <div
          className={`absolute inset-0 rounded-full border border-purple-500/30 border-dashed ${
            isScanning ? "animate-radar" : ""
          }`}
        />

        {/* Middle Pulse Ring */}
        <div className="absolute inset-4 rounded-full border border-pink-500/20 backdrop-blur-xs animate-breathe" />

        {/* Inner Glass Orb */}
        <div className="relative w-44 h-44 rounded-full bg-gradient-to-b from-purple-900/60 to-slate-900/90 border border-white/20 shadow-2xl flex flex-col items-center justify-center p-4 backdrop-blur-xl">
          {isScanning ? (
            <div className="flex flex-col items-center">
              <Sparkles className="h-10 w-10 text-cyan-400 animate-spin" />
              <span className="text-xs uppercase font-mono tracking-widest text-cyan-300 mt-2">
                Scanning...
              </span>
            </div>
          ) : scanCompleted ? (
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-0.5">
                Reclaimable Space
              </span>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-4xl font-extrabold tracking-tight">
                  {formattedSize.value}
                </span>
                <span className="text-base font-bold text-pink-400">
                  {formattedSize.unit}
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 font-mono">
                {totalFoundCount} items found
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Sparkles className="h-12 w-12 text-purple-400 mb-1" />
              <span className="text-sm font-bold text-white tracking-wide">
                Ready to Clean
              </span>
              <span className="text-[11px] text-slate-400">1-Click Smart Care</span>
            </div>
          )}
        </div>

        {/* Floating Category Satellites */}
        <div className="absolute -top-1 -right-1 p-2.5 rounded-full bg-slate-900/80 border border-purple-500/40 text-purple-400 shadow-lg">
          <HardDrive className="h-4 w-4" />
        </div>
        <div className="absolute -bottom-1 -left-1 p-2.5 rounded-full bg-slate-900/80 border border-cyan-500/40 text-cyan-400 shadow-lg">
          <Terminal className="h-4 w-4" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-2.5 rounded-full bg-slate-900/80 border border-pink-500/40 text-pink-400 shadow-lg">
          <Zap className="h-4 w-4" />
        </div>
      </div>

      {/* Title & Tagline */}
      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
        {scanCompleted
          ? "Cleanup Ready to Run!"
          : isScanning
          ? "Analyzing Your Mac System..."
          : "Smart Care & System Optimizer"}
      </h2>
      <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
        {scanCompleted
          ? "Application caches, developer junk, and orphaned leftovers can be safely cleared without touching personal data."
          : "Clean application caches, system logs, Xcode & Node build junk, and optimize Mac performance in one click."}
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {scanCompleted ? (
          <>
            <Button
              variant="gradient"
              size="xl"
              onClick={onCleanAll}
              isLoading={isCleaning}
              className="px-10"
            >
              <Zap className="h-5 w-5 fill-current" />
              CLEAN NOW ({formattedSize.value} {formattedSize.unit})
            </Button>
            <Button variant="secondary" size="lg" onClick={onStartScan} disabled={isCleaning}>
              Scan Again
            </Button>
          </>
        ) : (
          <Button
            variant="gradient"
            size="xl"
            onClick={onStartScan}
            isLoading={isScanning}
            className="px-12"
          >
            <ShieldCheck className="h-5 w-5" />
            {isScanning ? "Scanning Mac..." : "SCAN MAC NOW"}
          </Button>
        )}
      </div>
    </div>
  );
};
