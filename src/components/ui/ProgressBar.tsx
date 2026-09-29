import React from "react";
import { motion } from "motion/react";
import { cn } from "@/utils/cn";

export interface ProgressBarProps {
  value?: number; // 0 to 100
  indeterminate?: boolean;
  color?: "purple" | "cyan" | "emerald" | "rose" | "indigo" | "amber" | "gradient";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  indeterminate = false,
  color = "gradient",
  size = "md",
  className,
  showLabel = false,
  label = "Progress",
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colorStyles: Record<string, string> = {
    purple: "bg-purple-500 shadow-purple-500/50",
    cyan: "bg-cyan-500 shadow-cyan-500/50",
    emerald: "bg-emerald-500 shadow-emerald-500/50",
    rose: "bg-rose-500 shadow-rose-500/50",
    indigo: "bg-indigo-500 shadow-indigo-500/50",
    amber: "bg-amber-500 shadow-amber-500/50",
    gradient: "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 shadow-pink-500/40",
  };

  const heightStyles: Record<string, string> = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
          <span>{label}</span>
          {!indeterminate && (
            <span className="font-semibold text-white">{clampedValue.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5 relative",
          heightStyles[size]
        )}
      >
        {indeterminate ? (
          <motion.div
            className={cn(
              "h-full rounded-full shadow-sm w-1/3 absolute top-0",
              colorStyles[color]
            )}
            animate={{ left: ["-35%", "100%"] }}
            transition={{
              repeat: Infinity,
              duration: 1.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        ) : (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clampedValue}%` }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
            className={cn(
              "h-full rounded-full shadow-sm animate-shimmer",
              colorStyles[color]
            )}
          />
        )}
      </div>
    </div>
  );
};
