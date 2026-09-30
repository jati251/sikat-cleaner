import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-['Press_Start_2P'] uppercase tracking-wider select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 transition-all rounded-none";

  const variantStyles = {
    primary:
      "bg-[#00f0ff] text-[#0e131b] border-2 border-[#00f0ff] shadow-[3px_3px_0_#062a38] hover:bg-[#38f5ff] hover:border-[#38f5ff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold",
    gradient:
      "bg-[#00f0ff] text-[#0e131b] border-2 border-[#00f0ff] shadow-[4px_4px_0_#062a38] hover:bg-[#38f5ff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold",
    secondary:
      "bg-[#182230] text-[#e2f1f8] border-2 border-[#2a3b50] shadow-[3px_3px_0_#080c12] hover:bg-[#202e40] hover:border-[#00f0ff] hover:text-[#00f0ff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
    danger:
      "bg-[#ff2a6d] text-[#0e131b] border-2 border-[#ff2a6d] shadow-[3px_3px_0_#380817] hover:bg-[#ff5287] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold",
    ghost:
      "bg-transparent text-[#e2f1f8] border border-transparent hover:border-[#2a3b50] hover:bg-[#182230] hover:text-[#00f0ff]",
  };

  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-[9px] gap-1.5",
    md: "px-3.5 py-2.5 text-[10px] gap-2",
    lg: "px-5 py-3 text-[11px] gap-2.5",
    xl: "px-7 py-4 text-[12px] gap-3 shadow-[5px_5px_0_#062a38]",
  };

  const isDisabled = Boolean(disabled || isLoading);

  return (
    <motion.button
      whileHover={{ scale: isDisabled ? 1 : 1.01 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 bg-current inline-block animate-ping" />
          <span>BUSY...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
