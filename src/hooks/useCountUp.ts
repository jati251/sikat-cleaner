import React from "react";

/**
 * Custom hook to smoothly animate a numeric value up to a target number
 * using requestAnimationFrame and easeOutExpo curve.
 */
export function useCountUp(
  target: number,
  duration = 1100,
  decimals = 2
): number {
  const [value, setValue] = React.useState<number>(0);
  const startValRef = React.useRef<number>(0);
  const startTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (target <= 0) {
      setValue(0);
      startValRef.current = 0;
      return;
    }

    const startVal = startValRef.current;
    startTimeRef.current = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo curve for buttery smooth deceleration
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startVal + (target - startVal) * ease;

      const factor = Math.pow(10, decimals);
      setValue(Math.round(current * factor) / factor);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        startValRef.current = target;
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [target, duration, decimals]);

  return value;
}
