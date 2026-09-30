import React from "react";
import { ProgressBar } from "./ProgressBar";

export interface LoadingStateProps {
  title?: string;
  label?: string;
  stages?: string[];
  accentColor?: "purple" | "cyan" | "indigo" | "rose" | "emerald" | "amber";
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "SCANNING SYSTEM DIRECTORIES",
  label = "Reading disk metadata & inspecting caches...",
  stages,
  className = "",
}) => {
  const defaultStages = [
    label,
    "Reading filesystem metadata...",
    "Querying macOS cache registries...",
    "Analyzing item sizes & dependencies...",
  ];

  const activeStages = stages && stages.length > 0 ? stages : defaultStages;
  const [stageIdx, setStageIdx] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setStageIdx((prev) => (prev + 1) % activeStages.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [activeStages.length]);

  return (
    <div className={`data-state ${className}`}>
      {/* Sikat Signature 3-cube pixel loader */}
      <div className="data-state-blocks mb-3">
        <i />
        <i />
        <i />
      </div>

      <strong className="font-['Press_Start_2P'] text-xs sm:text-sm text-[#00f0ff] tracking-wider uppercase mb-1">
        {title}
      </strong>

      <p className="font-['VT323'] text-lg text-[#e2f1f8] max-w-md">
        {activeStages[stageIdx]}
      </p>

      <div className="w-full max-w-xs mt-3">
        <ProgressBar indeterminate color="cyan" size="sm" />
      </div>
    </div>
  );
};
