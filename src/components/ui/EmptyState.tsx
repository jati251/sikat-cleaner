import React from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ElementType;
  iconColor?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = CheckCircle2,
  iconColor = "text-emerald-400",
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`h-64 flex flex-col items-center justify-center text-center p-6 gap-2 select-none ${className}`}
    >
      <Icon className={`h-10 w-10 ${iconColor} mb-1`} />
      <span className="text-base font-semibold text-white">{title}</span>
      <span className="text-xs text-slate-400 max-w-sm leading-relaxed">{description}</span>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
};
