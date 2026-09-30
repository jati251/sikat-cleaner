import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
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
            onClick={onClose}
            className="fixed inset-0 bg-[#0e131b]/85 backdrop-blur-sm"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-none border-2 border-[#2a3b50] bg-[#182230] p-6 shadow-[8px_8px_0_#06101a]",
              className
            )}
          >
            <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#2a3b50]">
              <h3 className="text-xs sm:text-sm font-['Press_Start_2P'] uppercase text-[#00f0ff] tracking-wider">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 border-2 border-[#2a3b50] bg-[#0e131b] text-[#e2f1f8] hover:border-[#00f0ff] hover:text-[#00f0ff] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
