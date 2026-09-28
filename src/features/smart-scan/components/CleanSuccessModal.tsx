import React from "react";
import confetti from "canvas-confetti";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatBytesParts } from "@/utils/formatters";
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

  // Trigger confetti when opened
  const handleOpenConfetti = React.useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#ec4899", "#06b6d4", "#10b981"],
      });
    } catch {
      // Ignore if in headless mode
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      handleOpenConfetti();
    }
  }, [isOpen, handleOpenConfetti]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cleanup Successful!">
      <div className="flex flex-col items-center text-center py-4">
        {/* Glowing Badge */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl animate-pulse" />
          <div className="relative p-4 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400">
            <CheckCircle2 className="h-12 w-12" />
          </div>
        </div>

        <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-semibold mb-1">
          Storage Space Reclaimed
        </span>

        {/* Big Reclaimed Metric */}
        <div className="flex items-baseline justify-center gap-1.5 text-white my-2">
          <span className="text-5xl font-black tracking-tight">{parts.value}</span>
          <span className="text-2xl font-bold text-emerald-400">{parts.unit}</span>
        </div>

        <p className="text-sm text-slate-300 max-w-xs mt-2 mb-6 leading-relaxed">
          Junk files and redundant caches have been cleaned. Your Mac is now lighter and more responsive!
        </p>

        <div className="w-full flex items-center justify-center gap-3">
          <Button variant="gradient" size="lg" onClick={onClose} className="w-full max-w-xs">
            <Sparkles className="h-4 w-4" />
            Done & Enjoy
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-400">
          <span>Made with</span>
          <Heart className="h-3 w-3 text-pink-500 fill-current" />
          <span>by Sikat Cleaner</span>
        </div>
      </div>
    </Modal>
  );
};
