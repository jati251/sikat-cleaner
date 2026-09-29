import React from "react";
import { motion, AnimatePresence } from "motion/react";

export interface TopProgressBarProps {
  isLoading: boolean;
  color?: "purple" | "cyan" | "emerald" | "rose" | "indigo" | "amber";
}

export const TopProgressBar: React.FC<TopProgressBarProps> = ({
  isLoading,
  color = "purple",
}) => {
  const colorGradients = {
    purple: "from-purple-500 via-pink-500 to-indigo-500 shadow-purple-500/50",
    cyan: "from-cyan-400 via-teal-400 to-blue-500 shadow-cyan-400/50",
    emerald: "from-emerald-400 via-teal-400 to-green-500 shadow-emerald-400/50",
    rose: "from-rose-500 via-pink-500 to-red-500 shadow-rose-500/50",
    indigo: "from-indigo-500 via-purple-500 to-blue-500 shadow-indigo-500/50",
    amber: "from-amber-400 via-orange-400 to-yellow-500 shadow-amber-400/50",
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-0 left-0 right-0 z-40 h-[3px] bg-slate-900/60 overflow-hidden"
        >
          <motion.div
            className={`h-full w-1/3 bg-gradient-to-r rounded-full shadow-md ${colorGradients[color]}`}
            animate={{ left: ["-35%", "100%"] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{ position: "absolute" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
