import React from "react";
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
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) {
          onChange(!checked);
        }
      }}
      className={cn(
        "h-5 w-5 rounded-md flex items-center justify-center border transition-all duration-150 cursor-pointer select-none",
        checked
          ? "bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-600/40"
          : "bg-slate-900/60 border-slate-700/80 hover:border-slate-500 text-transparent",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      <Check className={cn("h-3.5 w-3.5 stroke-[3]", checked ? "opacity-100" : "opacity-0")} />
    </button>
  );
};
