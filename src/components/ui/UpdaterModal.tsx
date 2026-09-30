import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { ProgressBar } from "./ProgressBar";
import { formatBytes } from "@/utils/formatters";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import {
  Sparkles,
  CheckCircle2,
  ArrowUpCircle,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

interface UpdaterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdaterModal: React.FC<UpdaterModalProps> = ({ isOpen, onClose }) => {
  const {
    updateInfo,
    isChecking,
    checkError,
    recheck,
    downloadUpdate,
    isDownloading,
    downloadProgress,
    isReadyToRestart,
    relaunch,
    isRelaunching,
  } = useAppUpdate({ enabled: isOpen });

  const progressPercent =
    downloadProgress.total > 0
      ? (downloadProgress.downloaded / downloadProgress.total) * 100
      : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SOFTWARE UPDATE">
      <div className="flex flex-col items-center text-center py-2 space-y-4">
        {/* State 1: Checking for updates */}
        {isChecking && (
          <div className="py-6 flex flex-col items-center gap-3">
            <div className="data-state-blocks mb-2">
              <i />
              <i />
              <i />
            </div>
            <h4 className="text-xs font-['Press_Start_2P'] uppercase text-[#00f0ff]">
              CHECKING FOR UPDATES...
            </h4>
            <p className="text-lg font-['VT323'] text-[#88a7be]">
              Connecting to distribution server...
            </p>
          </div>
        )}

        {/* State 2: Error encountered */}
        {!isChecking && checkError && (
          <div className="py-4 flex flex-col items-center gap-3">
            <div className="p-2 border-2 border-[#ff2a6d] bg-[#0e131b] text-[#ff2a6d] shadow-[2px_2px_0_#380817]">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-['Press_Start_2P'] text-[#ff2a6d] uppercase">
              UPDATE CHECK FAILED
            </h4>
            <p className="text-base font-['VT323'] text-[#e2f1f8] max-w-sm">{checkError}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => recheck()}
              className="mt-2"
            >
              RETRY
            </Button>
          </div>
        )}

        {/* State 3: Up to date */}
        {!isChecking && !checkError && updateInfo && !updateInfo.available && (
          <div className="py-4 flex flex-col items-center gap-3">
            <div className="p-2 border-2 border-[#00ff88] bg-[#0e131b] text-[#00ff88] shadow-[2px_2px_0_#062a38]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-['Press_Start_2P'] uppercase text-[#00ff88]">
              SYSTEM UP TO DATE
            </h4>
            <p className="text-lg font-['VT323'] text-[#e2f1f8] max-w-xs">
              Sikat Cleaner <span className="text-[#00f0ff]">v{updateInfo.currentVersion}</span> is currently the newest version available.
            </p>
            <Button variant="secondary" size="md" onClick={onClose} className="mt-2 px-6">
              CLOSE
            </Button>
          </div>
        )}

        {/* State 4: Update Available */}
        {!isChecking && !checkError && updateInfo && updateInfo.available && (
          <div className="w-full flex flex-col items-center gap-3 text-left">
            <div className="p-2 border-2 border-[#00f0ff] bg-[#0e131b] text-[#00f0ff] shadow-[2px_2px_0_#062a38] mb-1">
              <ArrowUpCircle className="h-6 w-6" />
            </div>

            <div className="text-center w-full">
              <span className="text-[9px] font-['Press_Start_2P'] uppercase tracking-wider text-[#00ff88]">
                NEW RELEASE AVAILABLE
              </span>
              <h4 className="text-xs font-['Press_Start_2P'] text-[#00f0ff] mt-1 uppercase">
                SIKAT CLEANER v{updateInfo.version}
              </h4>
              <p className="text-base font-['VT323'] text-[#88a7be]">
                Current version: v{updateInfo.currentVersion}
              </p>
            </div>

            {/* Release notes card */}
            <div className="w-full p-3 border-2 border-[#2a3b50] bg-[#0e131b] space-y-1">
              <span className="text-[#00f0ff] text-[9px] font-['Press_Start_2P'] uppercase block">
                CHANGELOG:
              </span>
              <p className="text-[#e2f1f8] font-['VT323'] text-base leading-relaxed">{updateInfo.body}</p>
            </div>

            {/* Progress bar during download */}
            {isDownloading && (
              <div className="w-full space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-base font-['VT323']">
                  <span className="text-[#88a7be]">DOWNLOADING UPDATE...</span>
                  <span className="text-[#00f0ff]">
                    {formatBytes(downloadProgress.downloaded)} / {formatBytes(downloadProgress.total)}
                  </span>
                </div>
                <ProgressBar value={progressPercent} color="cyan" />
              </div>
            )}

            {/* Actions */}
            <div className="w-full flex items-center justify-end gap-3 pt-3 border-t-2 border-[#2a3b50] mt-2">
              <Button variant="secondary" size="md" onClick={onClose} disabled={isDownloading}>
                LATER
              </Button>

              {isReadyToRestart ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => relaunch()}
                  isLoading={isRelaunching}
                  className="px-5"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  RESTART & APPLY
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => downloadUpdate()}
                  isLoading={isDownloading}
                  className="px-5"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  UPDATE NOW
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
