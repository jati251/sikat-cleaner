import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProgressBar } from "./ProgressBar";

export interface OperationProgressModalProps {
  isOpen: boolean;
  title: string;
  stage: string;
  progress?: number;
  indeterminate?: boolean;
  subdetail?: string;
}

export const OperationProgressModal: React.FC<OperationProgressModalProps> = ({
  isOpen,
  title,
  stage,
  progress = 0,
  indeterminate = true,
  subdetail,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-[#0e131b]/90 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-md rounded-none border-2 border-[#2a3b50] bg-[#182230] p-6 shadow-[8px_8px_0_#06101a] flex flex-col items-center text-center"
          >
            {/* 3-cube pixel loader */}
            <div className="data-state-blocks mb-4">
              <i />
              <i />
              <i />
            </div>

            {/* Title */}
            <h3 className="text-xs sm:text-sm font-['Press_Start_2P'] uppercase text-[#00f0ff] tracking-wider mb-2">
              {title}
            </h3>

            {/* Stage */}
            <p className="text-lg font-['VT323'] text-[#e2f1f8] mb-4 h-6 flex items-center justify-center">
              {stage}
            </p>

            {/* Progress Bar Container */}
            <div className="w-full space-y-2 mb-2">
              <ProgressBar
                value={progress}
                indeterminate={indeterminate}
                color="cyan"
                size="md"
              />
              <div className="flex items-center justify-between text-base font-['VT323'] text-[#88a7be] px-1">
                <span>SYSTEM OPERATION ACTIVE</span>
                {!indeterminate && (
                  <span className="text-[#00f0ff]">{Math.round(progress)}%</span>
                )}
              </div>
            </div>

            {subdetail && (
              <p className="text-sm font-['VT323'] text-[#88a7be] mt-2 truncate max-w-full">
                {subdetail}
              </p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
