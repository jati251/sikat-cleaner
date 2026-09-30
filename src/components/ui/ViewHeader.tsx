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
  iconColor = "text-[#00f0ff]",
  iconBg = "bg-[#0e131b] border-[#2a3b50]",
  title,
  description,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-4 border-b-2 border-[#2a3b50] flex-shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 border-2 shadow-[2px_2px_0_#06101a] ${iconBg} ${iconColor} flex-shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-['Press_Start_2P'] text-[#00f0ff] tracking-wider uppercase flex items-center gap-2 truncate">
            {title}
          </h2>
          <p className="text-base font-['VT323'] text-[#e2f1f8] mt-0.5 line-clamp-2 sm:line-clamp-none">{description}</p>
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-auto flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};
