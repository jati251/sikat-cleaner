import React from "react";
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
  iconColor = "text-[#00ff88]",
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div className={`data-state ${className}`}>
      <div className={`p-3 border-2 border-[#2a3b50] bg-[#0e131b] ${iconColor} mb-2 shadow-[2px_2px_0_#062a38]`}>
        <Icon className="h-6 w-6" />
      </div>
      <strong className="font-['Press_Start_2P'] text-xs text-[#00f0ff] tracking-wider uppercase">
        {title}
      </strong>
      <p className="font-['VT323'] text-lg text-[#e2f1f8] max-w-sm">
        {description}
      </p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
};
