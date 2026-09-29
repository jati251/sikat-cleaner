import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProgressBar } from "./ProgressBar";
import { LucideIcon, Sparkles, RefreshCw } from "lucide-react";

export interface LoadingStateProps {
  title?: string;
  label?: string;
  stages?: string[];
  accentColor?: "purple" | "cyan" | "indigo" | "rose" | "emerald" | "amber";
  icon?: LucideIcon;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "Analyzing System",
  label = "Scanning items...",
  stages,
  accentColor = "purple",
  icon: Icon = RefreshCw,
  className = "",
}) => {
  const defaultStages = [
    label,
    "Reading filesystem metadata...",
    "Calculating container sizes...",
    "Compiling scan diagnostics...",
  ];

  const activeStages = stages && stages.length > 0 ? stages : defaultStages;
  const [stageIdx, setStageIdx] = React.useState(0);
  const [progress, setProgress] = React.useState(12);

  React.useEffect(() => {
    // Cycle stages smoothly
    const stageTimer = setInterval(() => {
      setStageIdx((prev) => (prev + 1) % activeStages.length);
    }, 1200);

    // Smoothly simulate scan progress
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 8) + 3;
      });
    }, 300);

    return () => {
      clearInterval(stageTimer);
      clearInterval(progressTimer);
    };
  }, [activeStages.length]);

  const colorStyles = {
    purple: {
      ring: "border-purple-500/30",
      glow: "bg-purple-500/15",
      iconBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      accent: "text-purple-300",
      barColor: "purple" as const,
    },
    cyan: {
      ring: "border-cyan-500/30",
      glow: "bg-cyan-500/15",
      iconBg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      accent: "text-cyan-300",
      barColor: "cyan" as const,
    },
    indigo: {
      ring: "border-indigo-500/30",
      glow: "bg-indigo-500/15",
      iconBg: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      accent: "text-indigo-300",
      barColor: "indigo" as const,
    },
    rose: {
      ring: "border-rose-500/30",
      glow: "bg-rose-500/15",
      iconBg: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      accent: "text-rose-300",
      barColor: "rose" as const,
    },
    emerald: {
      ring: "border-emerald-500/30",
      glow: "bg-emerald-500/15",
      iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      accent: "text-emerald-300",
      barColor: "emerald" as const,
    },
    amber: {
      ring: "border-amber-500/30",
      glow: "bg-amber-500/15",
      iconBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      accent: "text-amber-300",
      barColor: "amber" as const,
    },
  };

  const scheme = colorStyles[accentColor] || colorStyles.purple;

  return (
    <div
      className={`min-h-[340px] h-full flex flex-col items-center justify-center p-8 text-center select-none relative overflow-hidden ${className}`}
    >
      {/* Ambient background glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none ${scheme.glow}`}
      />

      {/* CleanMyMac style Radar / Hologram Spinner */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Sonar Ripple Rings */}
        <motion.div
          animate={{ scale: [0.9, 1.35, 0.9], opacity: [0.4, 0.1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className={`absolute w-32 h-32 rounded-full border ${scheme.ring}`}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className={`w-24 h-24 rounded-full border-2 border-dashed ${scheme.ring} absolute`}
        />

        {/* Center Pulsing Icon Orb */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl z-10 ${scheme.iconBg}`}
        >
          <Icon className="h-8 w-8 animate-pulse" />
        </div>
      </div>

      {/* Main Title */}
      <h3 className="text-base font-bold text-white mb-1 tracking-tight flex items-center gap-2">
        <span>{title}</span>
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </h3>

      {/* Dynamic Stage Ticker */}
      <div className="h-6 mb-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={stageIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className={`text-xs font-mono font-medium ${scheme.accent}`}
          >
            {activeStages[stageIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Scanning Progress Bar with Odometer */}
      <div className="w-full max-w-xs space-y-2">
        <ProgressBar value={progress} color={scheme.barColor} size="sm" />
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 animate-spin text-slate-400" />
            Active Scan
          </span>
          <span className={`font-bold ${scheme.accent}`}>{progress}%</span>
        </div>
      </div>
    </div>
  );
};
