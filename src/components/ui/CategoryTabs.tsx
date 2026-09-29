import React from "react";
import { motion } from "motion/react";

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
  accentColor = "purple",
  className = "",
}) => {
  const activeColorStyles = {
    purple: "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30",
    cyan: "bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-600/30",
    pink: "bg-pink-600 text-white font-semibold shadow-md shadow-pink-600/30",
    emerald: "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/30",
  };

  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors duration-150 flex items-center gap-1.5 ${
              isActive
                ? activeColorStyles[accentColor]
                : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span className={`text-[10px] opacity-75 font-mono ${isActive ? "text-white" : "text-slate-400"}`}>
                ({tab.count})
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
