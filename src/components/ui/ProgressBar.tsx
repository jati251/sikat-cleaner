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
  color = "cyan",
  size = "md",
  className,
  showLabel = false,
  label = "STATUS",
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colorStyles: Record<string, string> = {
    purple: "bg-[#00f0ff]",
    cyan: "bg-[#00f0ff]",
    emerald: "bg-[#00ff88]",
    rose: "bg-[#ff2a6d]",
    indigo: "bg-[#2a3b50]",
    amber: "bg-[#ffb703]",
    gradient: "bg-[#00f0ff]",
  };

  const heightStyles: Record<string, string> = {
    xs: "h-2",
    sm: "h-3",
    md: "h-4",
    lg: "h-6",
  };

  return (
    <div className={cn("w-full font-['VT323']", className)}>
      {showLabel && (
        <div className="flex justify-between text-base text-[#e2f1f8] mb-1">
          <span>{label}</span>
          {!indeterminate && (
            <span className="text-[#00f0ff]">{clampedValue.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-[#0e131b] rounded-none overflow-hidden border-2 border-[#2a3b50] relative p-0.5",
          heightStyles[size]
        )}
      >
        {indeterminate ? (
          <motion.div
            className={cn(
              "h-full w-1/4 absolute top-0.5 bottom-0.5",
              colorStyles[color]
            )}
            animate={{ left: ["0%", "75%", "0%"] }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              ease: "linear",
            }}
          />
        ) : (
          <div
            style={{ width: `${clampedValue}%` }}
            className={cn(
              "h-full transition-all duration-200",
              colorStyles[color]
            )}
          />
        )}
      </div>
    </div>
  );
};
