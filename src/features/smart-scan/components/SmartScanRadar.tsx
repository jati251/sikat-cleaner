import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ShieldCheck, Zap, HardDrive, Terminal, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useCountUp } from "@/hooks/useCountUp";

interface SmartScanRadarProps {
  isScanning: boolean;
  scanProgress?: number;
  onStartScan: () => void;
  onCleanAll: () => void;
  scanCompleted: boolean;
  reclaimableBytes: number;
  totalFoundCount: number;
  formattedSize: { value: string; unit: string };
  isCleaning: boolean;
}

const SCAN_DIAGNOSTICS = [
  { text: "Scanning Xcode DerivedData & Archives...", icon: Terminal, color: "text-cyan-400" },
  { text: "Analyzing Application Caches & WebKit...", icon: HardDrive, color: "text-purple-400" },
  { text: "Checking Node Modules, Cargo & Homebrew...", icon: Terminal, color: "text-pink-400" },
  { text: "Inspecting macOS System Logs & Crashes...", icon: ShieldCheck, color: "text-blue-400" },
  { text: "Scanning macOS Trash & Orphan Containers...", icon: Zap, color: "text-amber-400" },
  { text: "Calculating Space Lens & Recoverable Space...", icon: Sparkles, color: "text-emerald-400" },
];

export const SmartScanRadar: React.FC<SmartScanRadarProps> = ({
  isScanning,
  scanProgress: externalProgress,
  onStartScan,
  onCleanAll,
  scanCompleted,
  totalFoundCount,
  formattedSize,
  isCleaning,
}) => {
  const [internalProgress, setInternalProgress] = React.useState(10);

  React.useEffect(() => {
    if (!isScanning) {
      setInternalProgress(0);
      return;
    }
    setInternalProgress(15);
    const progressInterval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 280);

    return () => clearInterval(progressInterval);
  }, [isScanning]);

  const displayProgress = externalProgress !== undefined ? externalProgress : internalProgress;

  // Step ticker in sync with progress
  const stepIdx = Math.min(
    SCAN_DIAGNOSTICS.length - 1,
    Math.floor((displayProgress / 100) * SCAN_DIAGNOSTICS.length)
  );
  const activeDiagnostic = SCAN_DIAGNOSTICS[stepIdx];
  const StepIcon = activeDiagnostic.icon;

  // Animated Count Up for reclaimed size
  const parsedSize = parseFloat(formattedSize.value) || 0;
  const decimals = formattedSize.value.includes(".")
    ? formattedSize.value.split(".")[1]?.length ?? 1
    : 0;
  const animatedSizeNumber = useCountUp(scanCompleted ? parsedSize : 0, 1200, decimals);

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 text-center select-none">
      {/* Central Visual Hologram Orb */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-6">
        {/* Ambient atmospheric glow mesh */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/35 via-pink-600/25 to-cyan-500/25 blur-3xl transition-all duration-700 ${
            isCleaning
              ? "scale-125 opacity-100 from-pink-600/50 via-purple-600/40 to-cyan-400/50"
              : isScanning
              ? "scale-110 opacity-90 animate-pulse"
              : "opacity-70"
          }`}
        />

        {/* Sonar Pulse Ripple Waves when Scanning */}
        {isScanning && (
          <>
            <div className="absolute inset-0 rounded-full border border-purple-500/40 animate-sonar-1 pointer-events-none" />
            <div className="absolute inset-0 rounded-full border border-pink-500/30 animate-sonar-2 pointer-events-none" />
            <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-sonar-3 pointer-events-none" />
          </>
        )}

        {/* Conical 360 Radar Sweep Beam when Scanning */}
        {isScanning && (
          <div className="absolute inset-2 rounded-full radar-beam animate-radar pointer-events-none opacity-80" />
        )}

        {/* Outer Orbiting Guide Ring */}
        <div
          className={`absolute inset-0 rounded-full border border-purple-500/25 border-dashed transition-all duration-500 ${
            isCleaning ? "animate-vortex border-pink-500/50" : isScanning ? "animate-radar" : "animate-spin-slow"
          }`}
        />

        {/* Middle Pulse Ring */}
        <div
          className={`absolute inset-5 rounded-full border border-pink-500/20 backdrop-blur-xs ${
            isCleaning ? "animate-vortex border-cyan-400/40" : "animate-breathe"
          }`}
        />

        {/* Inner Glass Orb */}
        <motion.div
          animate={
            isCleaning
              ? { scale: [1, 1.05, 0.97, 1], rotate: [0, 180, 360] }
              : isScanning
              ? { scale: [1, 1.03, 1] }
              : { scale: 1 }
          }
          transition={{
            repeat: isCleaning || isScanning ? Infinity : 0,
            duration: isCleaning ? 1.2 : 3,
            ease: "easeInOut",
          }}
          className={`relative w-48 h-48 md:w-52 md:h-52 rounded-full border shadow-2xl flex flex-col items-center justify-center p-4 backdrop-blur-2xl overflow-hidden transition-all duration-500 ${
            isCleaning
              ? "bg-gradient-to-b from-pink-950/70 via-purple-900/80 to-slate-950/95 border-pink-400/40 shadow-pink-500/30"
              : scanCompleted
              ? "bg-gradient-to-b from-purple-950/80 via-slate-900/90 to-black border-purple-400/30 shadow-purple-500/25"
              : isScanning
              ? "bg-gradient-to-b from-purple-900/80 via-cyan-950/60 to-slate-950/95 border-cyan-400/30 shadow-cyan-500/20"
              : "bg-gradient-to-b from-purple-900/50 to-slate-900/90 border-white/15"
          }`}
        >
          {/* Internal Specular Glass Highlight */}
          <div className="absolute top-2 left-6 right-6 h-14 rounded-full bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

          {/* Active Laser Line Scan Sweep */}
          {isScanning && (
            <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee] animate-laser pointer-events-none" />
          )}

          {/* Center Orb Content States */}
          {isCleaning ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center z-10"
            >
              <RefreshCw className="h-11 w-11 text-pink-400 animate-spin" />
              <span className="text-xs uppercase font-mono tracking-widest text-pink-300 font-bold mt-2.5">
                Vaporizing...
              </span>
              <span className="text-[10px] text-pink-200/70 font-mono mt-0.5">Purging caches</span>
            </motion.div>
          ) : isScanning ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center z-10"
            >
              <Sparkles className="h-10 w-10 text-cyan-400 animate-spin" />
              <span className="text-xs uppercase font-mono tracking-widest text-cyan-300 font-bold mt-2">
                Scanning Mac...
              </span>
              <span className="text-[10px] text-cyan-200/70 font-mono mt-0.5">Deep inspection</span>
            </motion.div>
          ) : scanCompleted ? (
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="flex flex-col items-center z-10"
            >
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Reclaimable Space
              </span>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-4xl md:text-5xl font-black tracking-tight font-mono">
                  {animatedSizeNumber.toFixed(decimals)}
                </span>
                <span className="text-lg font-black text-pink-400">
                  {formattedSize.unit}
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 font-mono font-medium">
                {totalFoundCount} items found
              </span>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center z-10">
              <motion.div
                whileHover={{ scale: 1.15, rotate: 15 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Sparkles className="h-12 w-12 text-purple-400 mb-1" />
              </motion.div>
              <span className="text-sm font-bold text-white tracking-wide">Ready to Clean</span>
              <span className="text-[11px] text-slate-400 font-medium">1-Click Smart Care</span>
            </div>
          )}
        </motion.div>

        {/* Floating Interactive Category Satellites */}
        {/* Top-Right: SSD Storage Satellite */}
        <motion.div
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute -top-1 -right-1 p-2.5 rounded-full bg-slate-900/90 border border-purple-500/40 text-purple-400 shadow-lg shadow-purple-500/20 cursor-pointer animate-float-1"
          title="System & Disk Caches"
        >
          <HardDrive className="h-4 w-4" />
        </motion.div>

        {/* Bottom-Left: Developer Junk Satellite */}
        <motion.div
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute -bottom-1 -left-1 p-2.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/20 cursor-pointer animate-float-2"
          title="Developer Junk (Xcode, Node, Cargo)"
        >
          <Terminal className="h-4 w-4" />
        </motion.div>

        {/* Bottom-Right: System Optimizer Satellite */}
        <motion.div
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute -bottom-1 -right-1 p-2.5 rounded-full bg-slate-900/90 border border-pink-500/40 text-pink-400 shadow-lg shadow-pink-500/20 cursor-pointer animate-float-3"
          title="Performance & RAM Speedup"
        >
          <Zap className="h-4 w-4" />
        </motion.div>
      </div>

      {/* Dynamic Realtime Scanning Step Ticker */}
      {isScanning && (
        <div className="h-7 mb-3 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs text-cyan-200 font-mono shadow-sm"
            >
              <StepIcon className={`h-3.5 w-3.5 ${activeDiagnostic.color} animate-pulse`} />
              <span>{activeDiagnostic.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Title & Tagline */}
      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
        {isScanning
          ? "Analyzing Your Mac System..."
          : scanCompleted
          ? "Cleanup Ready to Run!"
          : "Smart Care & System Optimizer"}
      </h2>
      <p className="text-slate-400 text-sm max-w-md mx-auto mb-7 leading-relaxed">
        {isScanning
          ? "Running comprehensive diagnostic scans across caches, developer build artifacts, and system logs..."
          : scanCompleted
          ? "Application caches, developer junk, and orphaned leftovers can be safely cleared without touching personal data."
          : "Clean application caches, system logs, Xcode & Node build junk, and optimize Mac performance in one click."}
      </p>

      {/* Realtime Scanning / Cleaning Progress Bar */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto mb-6 space-y-1.5"
        >
          <ProgressBar value={displayProgress} color="cyan" size="md" />
          <div className="flex justify-between text-xs font-mono text-cyan-300">
            <span className="flex items-center gap-1.5 font-medium">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
              Live Diagnostic Sweep
            </span>
            <span className="font-bold">{displayProgress}%</span>
          </div>
        </motion.div>
      )}

      {isCleaning && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto mb-6 space-y-1.5"
        >
          <ProgressBar indeterminate color="gradient" size="sm" />
          <div className="flex justify-between text-[11px] font-mono text-pink-300/80">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 animate-spin" />
              Vortex Purge In Progress
            </span>
            <span>Reclaiming Space</span>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {isScanning ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-sm font-semibold shadow-lg shadow-cyan-950/40"
          >
            <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
            <span>Scanning in progress ({displayProgress}%)...</span>
          </motion.div>
        ) : scanCompleted ? (
          <>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                variant="gradient"
                size="xl"
                onClick={onCleanAll}
                isLoading={isCleaning}
                className="px-10 animate-glow-pulse animate-shimmer"
              >
                <Zap className="h-5 w-5 fill-current" />
                CLEAN NOW ({formattedSize.value} {formattedSize.unit})
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button variant="secondary" size="lg" onClick={onStartScan} disabled={isCleaning}>
                Scan Again
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button
              variant="gradient"
              size="xl"
              onClick={onStartScan}
              isLoading={isScanning}
              className={`px-12 ${isScanning ? "" : "animate-glow-pulse animate-shimmer"}`}
            >
              <ShieldCheck className="h-5 w-5" />
              {isScanning ? "Scanning Mac..." : "SCAN MAC NOW"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
