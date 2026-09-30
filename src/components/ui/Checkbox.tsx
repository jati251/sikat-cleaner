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
        "h-4 w-4 rounded-none flex items-center justify-center border-2 transition-all cursor-pointer select-none",
        checked
          ? "bg-[#00f0ff] border-[#00f0ff] text-[#0e131b] shadow-[1px_1px_0_#062a38]"
          : "bg-[#0e131b] border-[#2a3b50] hover:border-[#00f0ff] text-transparent",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {checked && <Check className="h-3 w-3 stroke-[3]" />}
    </button>
  );
};
