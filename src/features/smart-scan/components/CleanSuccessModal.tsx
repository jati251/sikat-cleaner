import React from "react";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatBytesParts } from "@/utils/formatters";
import { useCountUp } from "@/hooks/useCountUp";
import { CheckCircle2, Sparkles, Heart } from "lucide-react";

interface CleanSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reclaimedBytes: number;
}

export const CleanSuccessModal: React.FC<CleanSuccessModalProps> = ({
  isOpen,
  onClose,
  reclaimedBytes,
}) => {
  const parts = formatBytesParts(reclaimedBytes);
  const parsedValue = parseFloat(parts.value) || 0;
  const decimals = parts.value.includes(".") ? parts.value.split(".")[1]?.length ?? 1 : 0;
  const animatedReclaimed = useCountUp(isOpen ? parsedValue : 0, 1100, decimals);

  // Multi-wave celebration confetti cannon
  const fireCelebration = React.useCallback(() => {
    try {
      // 1. Center burst
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#ec4899", "#06b6d4", "#10b981", "#fbbf24"],
      });

      // 2. Left cannon
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0.15, y: 0.65 },
          colors: ["#a855f7", "#06b6d4", "#ec4899"],
        });
      }, 200);

      // 3. Right cannon
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 0.85, y: 0.65 },
          colors: ["#10b981", "#fbbf24", "#a855f7"],
        });
      }, 400);
    } catch {
      // Ignore if in headless mode
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      fireCelebration();
    }
  }, [isOpen, fireCelebration]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cleanup Successful!">
      <div className="flex flex-col items-center text-center py-4 select-none">
        {/* Glowing Badge with Rotating Sunburst Aura */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Ambient emerald backlight */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/35 blur-2xl animate-pulse" />

          {/* Rotating sunburst aura */}
          <div className="absolute -inset-4 rounded-full border border-emerald-400/20 border-dashed animate-spin-slow pointer-events-none" />

          <motion.div
            initial={{ scale: 0.4, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
            className="relative p-4 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 shadow-xl shadow-emerald-500/20"
          >
            <CheckCircle2 className="h-12 w-12" />
          </motion.div>
        </div>

        <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-semibold mb-1">
          Storage Space Reclaimed
        </span>

        {/* Big Reclaimed Metric with Count Up */}
        <div className="flex items-baseline justify-center gap-1.5 text-white my-2 font-mono">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="text-5xl font-black tracking-tight"
          >
            {animatedReclaimed.toFixed(decimals)}
          </motion.span>
          <span className="text-2xl font-bold text-emerald-400">{parts.unit}</span>
        </div>

        <p className="text-sm text-slate-300 max-w-xs mt-2 mb-6 leading-relaxed">
          Junk files and redundant caches have been cleaned. Your Mac is now lighter and more responsive!
        </p>

        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="w-full flex items-center justify-center gap-3"
        >
          <Button
            variant="gradient"
            size="lg"
            onClick={onClose}
            className="w-full max-w-xs animate-shimmer shadow-emerald-900/30"
          >
            <Sparkles className="h-4 w-4" />
            Done & Enjoy
          </Button>
        </motion.div>

        <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-400">
          <span>Made with</span>
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <Heart className="h-3 w-3 text-pink-500 fill-current" />
          </motion.div>
          <span>by Sikat Cleaner</span>
        </div>
      </div>
    </Modal>
  );
};
