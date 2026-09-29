import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProgressBar } from "./ProgressBar";
import { LucideIcon, Sparkles } from "lucide-react";

export interface OperationProgressModalProps {
  isOpen: boolean;
  title: string;
  stage: string;
  progress: number;
  color?: "purple" | "cyan" | "emerald" | "rose" | "indigo" | "amber";
  icon?: LucideIcon;
  subdetail?: string;
}

export const OperationProgressModal: React.FC<OperationProgressModalProps> = ({
  isOpen,
  title,
  stage,
  progress,
  color = "purple",
  icon: Icon = Sparkles,
  subdetail,
}) => {
  const colorSchemes = {
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
    emerald: {
      ring: "border-emerald-500/30",
      glow: "bg-emerald-500/15",
      iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      accent: "text-emerald-300",
      barColor: "emerald" as const,
    },
    rose: {
      ring: "border-rose-500/30",
      glow: "bg-rose-500/15",
      iconBg: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      accent: "text-rose-300",
      barColor: "rose" as const,
    },
    indigo: {
      ring: "border-indigo-500/30",
      glow: "bg-indigo-500/15",
      iconBg: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      accent: "text-indigo-300",
      barColor: "indigo" as const,
    },
    amber: {
      ring: "border-amber-500/30",
      glow: "bg-amber-500/15",
      iconBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      accent: "text-amber-300",
      barColor: "amber" as const,
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.purple;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with heavy blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-xl"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-7 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col items-center text-center"
          >
            {/* Ambient Background Aura */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none ${scheme.glow}`}
            />

            {/* Pulsing Vortex / Orbital Ring */}
            <div className="relative mb-5 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className={`w-20 h-20 rounded-full border-2 border-dashed ${scheme.ring} absolute`}
              />
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl ${scheme.iconBg}`}
              >
                <Icon className="h-7 w-7 animate-pulse" />
              </div>
            </div>

            {/* Title & Stage Ticker */}
            <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
            <p className="text-xs text-slate-300 mb-6 h-5 flex items-center justify-center font-medium">
              <motion.span
                key={stage}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {stage}
              </motion.span>
            </p>

            {/* Progress Bar Container */}
            <div className="w-full space-y-2 mb-2">
              <ProgressBar
                value={progress}
                color={scheme.barColor}
                size="md"
              />
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>Optimizing system...</span>
                <span className={`font-bold ${scheme.accent}`}>
                  {Math.min(100, Math.max(0, Math.round(progress)))}%
                </span>
              </div>
            </div>

            {subdetail && (
              <p className="text-[11px] text-slate-400 font-mono mt-3 truncate max-w-full">
                {subdetail}
              </p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
