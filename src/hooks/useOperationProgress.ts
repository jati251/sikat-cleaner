import React from "react";

export interface UseOperationProgressOptions {
  isRunning: boolean;
  stages: string[];
  intervalMs?: number;
  onComplete?: () => void;
}

export interface UseOperationProgressReturn {
  progress: number;
  currentStage: string;
  stageIndex: number;
  isComplete: boolean;
}

export function useOperationProgress({
  isRunning,
  stages,
  intervalMs = 350,
  onComplete,
}: UseOperationProgressOptions): UseOperationProgressReturn {
  const [progress, setProgress] = React.useState(0);
  const [stageIndex, setStageIndex] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);

  // Reset or run interval
  React.useEffect(() => {
    if (!isRunning) {
      if (progress > 0 && !isComplete) {
        // Just finished
        setProgress(100);
        setIsComplete(true);
        const timer = setTimeout(() => {
          onComplete?.();
        }, 400);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Reset when starting
    setProgress(5);
    setStageIndex(0);
    setIsComplete(false);

    const stepSize = Math.max(1, Math.floor(85 / (stages.length * 3)));

    const timer = setInterval(() => {
      setProgress((prev) => {
        // Slow down as it approaches 90%
        if (prev >= 90) return prev;
        const next = Math.min(90, prev + Math.floor(Math.random() * stepSize) + 2);
        
        // Advance stage proportionally
        const nextStage = Math.min(
          stages.length - 1,
          Math.floor((next / 90) * stages.length)
        );
        setStageIndex(nextStage);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRunning, stages.length, intervalMs]);

  return {
    progress: isComplete ? 100 : progress,
    currentStage: stages[stageIndex] || stages[0] || "Processing...",
    stageIndex,
    isComplete,
  };
}
