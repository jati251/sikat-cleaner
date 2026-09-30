import React from "react";
import confetti from "canvas-confetti";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatBytesParts } from "@/utils/formatters";
import { CheckCircle2 } from "lucide-react";

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

  React.useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#00f0ff", "#00ff88", "#ffb703", "#ff2a6d", "#38f5ff"],
        });
      } catch {
        // Safe in non-canvas env
      }
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PURGE SUCCESSFUL">
      <div className="flex flex-col items-center text-center py-2 select-none font-['VT323']">
        <div className="p-3 border-2 border-[#00ff88] bg-[#0e131b] text-[#00ff88] shadow-[3px_3px_0_#062a38] mb-3">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <span className="font-['Press_Start_2P'] text-[9px] uppercase tracking-wider text-[#00ff88] mb-1">
          STORAGE SPACE RECLAIMED
        </span>

        {/* Big Reclaimed Metric */}
        <div className="flex items-baseline justify-center gap-1.5 text-white my-1">
          <span className="text-6xl font-bold text-[#00f0ff] tracking-tight">
            {parts.value}
          </span>
          <span className="text-3xl font-bold text-[#00ff88]">{parts.unit}</span>
        </div>

        <p className="text-lg text-[#e2f1f8] max-w-sm mt-1 mb-5">
          Temporary caches, orphaned build artifacts, and system logs were vaporized. Your disk space has been recovered!
        </p>

        <div className="w-full flex items-center justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onClose}
            className="w-full max-w-xs shadow-[4px_4px_0_#062a38]"
          >
            DONE & CLOSE
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-sm text-[#506882]">
          <span>SIKAT CLEANER</span>
        </div>
      </div>
    </Modal>
  );
};
