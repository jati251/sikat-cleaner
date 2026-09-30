import React from "react";
import { motion, AnimatePresence } from "motion/react";

export interface TopProgressBarProps {
  isLoading: boolean;
}

export const TopProgressBar: React.FC<TopProgressBarProps> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute top-0 left-0 right-0 z-40 h-[3px] bg-[#0e131b] overflow-hidden"
        >
          <motion.div
            className="h-full w-1/4 bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]"
            animate={{ left: ["-25%", "100%"] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "linear",
            }}
            style={{ position: "absolute" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
