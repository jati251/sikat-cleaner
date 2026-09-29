import React from "react";

export interface ViewHeaderProps {
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  title: React.ReactNode;
  description: string;
  actions?: React.ReactNode;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  icon: Icon,
  iconColor = "text-purple-400",
  iconBg = "bg-purple-500/20 border-purple-500/30",
  title,
  description,
  actions,
}) => {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <div className={`p-2 rounded-xl border ${iconBg} ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h2>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};
