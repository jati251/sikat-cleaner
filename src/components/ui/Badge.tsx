import React from "react";
import { cn } from "@/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "purple" | "cyan" | "emerald" | "amber" | "rose" | "neutral";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "neutral",
  ...props
}) => {
  const variantStyles = {
    purple: "bg-[#00f0ff]/10 text-[#38f5ff] border-[#00f0ff]/50",
    cyan: "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]",
    emerald: "bg-[#00ff88]/15 text-[#00ff88] border-[#00ff88]",
    amber: "bg-[#ffb703]/15 text-[#ffb703] border-[#ffb703]",
    rose: "bg-[#ff2a6d]/15 text-[#ff2a6d] border-[#ff2a6d]",
    neutral: "bg-[#0e131b] text-[#88a7be] border-[#2a3b50]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[9px] font-['Press_Start_2P'] uppercase border tracking-tight",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
