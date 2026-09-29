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
    "inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none rounded-xl";

  const variantStyles = {
    primary:
      "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/40 border border-purple-400/20",
    gradient:
      "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white shadow-xl shadow-pink-600/25 hover:shadow-pink-500/40 border border-white/20 font-semibold",
    secondary:
      "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10 hover:border-white/20 shadow-md",
    danger:
      "bg-rose-600/80 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 border border-rose-400/20",
    ghost:
      "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-transparent",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-2.5 text-base gap-2.5",
    xl: "px-8 py-3.5 text-lg font-bold tracking-wide gap-3 rounded-2xl",
  };

  const isDisabled = Boolean(disabled || isLoading);

  return (
    <motion.button
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.96 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  );
};
