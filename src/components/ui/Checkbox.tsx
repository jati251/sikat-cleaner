import React from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  className,
  id,
}) => {
  return (
    <motion.button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.08 }}
      whileTap={{ scale: disabled ? 1 : 0.85 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) {
          onChange(!checked);
        }
      }}
      className={cn(
        "h-5 w-5 rounded-md flex items-center justify-center border transition-colors duration-150 cursor-pointer select-none",
        checked
          ? "bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-600/40"
          : "bg-slate-900/60 border-slate-700/80 hover:border-purple-400/50 text-transparent",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      <motion.div
        initial={false}
        animate={{ scale: checked ? 1 : 0.4, opacity: checked ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        <Check className="h-3.5 w-3.5 stroke-[3]" />
      </motion.div>
    </motion.button>
  );
};
