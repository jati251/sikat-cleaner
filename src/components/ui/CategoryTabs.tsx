import React from "react";

export interface TabOption {
  id: string;
  label: string;
  count?: number;
}

export interface CategoryTabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (tabId: string) => void;
  accentColor?: "purple" | "cyan" | "pink" | "emerald";
  className?: string;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 rounded-none text-[9px] font-['Press_Start_2P'] uppercase tracking-wider cursor-pointer border-2 transition-all flex items-center gap-2 ${
              isActive
                ? "bg-[#00f0ff] text-[#0e131b] border-[#00f0ff] shadow-[2px_2px_0_#062a38] font-bold"
                : "bg-[#182230] text-[#e2f1f8] border-[#2a3b50] hover:border-[#00f0ff] hover:text-[#00f0ff]"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span className={`text-[10px] font-['VT323'] ${isActive ? "text-[#0e131b]" : "text-[#506882]"}`}>
                [{tab.count}]
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
