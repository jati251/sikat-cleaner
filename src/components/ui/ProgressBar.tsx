import React from "react";
import { cn } from "@/utils/cn";

export interface ProgressBarProps {
  value: number; // 0 to 100
  color?: "purple" | "cyan" | "emerald" | "rose" | "gradient";
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = "gradient",
  className,
  showLabel = false,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colorStyles = {
    purple: "bg-purple-500 shadow-purple-500/50",
    cyan: "bg-cyan-500 shadow-cyan-500/50",
    emerald: "bg-emerald-500 shadow-emerald-500/50",
    rose: "bg-rose-500 shadow-rose-500/50",
    gradient: "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 shadow-pink-500/40",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
          <span>Usage</span>
          <span>{clampedValue.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5 p-0.5">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out shadow-sm",
            colorStyles[color]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
