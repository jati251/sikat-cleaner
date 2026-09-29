import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { ProgressBar } from "./ProgressBar";
import { formatBytes } from "@/utils/formatters";
import {
  checkForAppUpdate,
  downloadAndInstallUpdate,
  relaunchApp,
  AppUpdateInfo,
} from "@/services/updaterService";
import {
  Sparkles,
  RefreshCw,
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
  const [isChecking, setIsChecking] = React.useState(false);
  const [updateInfo, setUpdateInfo] = React.useState<AppUpdateInfo | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [progress, setProgress] = React.useState({ downloaded: 0, total: 0 });
  const [isReadyToRestart, setIsReadyToRestart] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const checkUpdates = React.useCallback(async () => {
    setIsChecking(true);
    setErrorMsg(null);
    setIsReadyToRestart(false);
    try {
      const info = await checkForAppUpdate();
      setUpdateInfo(info);
    } catch (e: unknown) {
      console.error(e);
      setErrorMsg(e instanceof Error ? e.message : "Failed to check for updates");
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Check on modal open if not already checked
  React.useEffect(() => {
    if (isOpen) {
      checkUpdates();
    }
  }, [isOpen, checkUpdates]);

  const handleStartDownload = async () => {
    setIsDownloading(true);
    setErrorMsg(null);
    try {
      await downloadAndInstallUpdate((downloaded, total) => {
        setProgress({ downloaded, total });
      });
      setIsReadyToRestart(true);
    } catch (e: unknown) {
      console.error(e);
      setErrorMsg(e instanceof Error ? e.message : "Failed to download update");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRestart = async () => {
    await relaunchApp();
  };

  const progressPercent =
    progress.total > 0 ? (progress.downloaded / progress.total) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Software Update">
      <div className="flex flex-col items-center text-center py-2 space-y-4">
        {/* State 1: Checking for updates */}
        {isChecking && (
          <div className="py-8 flex flex-col items-center gap-3">
            <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin" />
            <h4 className="text-base font-bold text-white">Checking for Updates...</h4>
            <p className="text-xs text-slate-400">
              Connecting to Sikat Cleaner release distribution servers...
            </p>
          </div>
        )}

        {/* State 2: Error encountered */}
        {!isChecking && errorMsg && (
          <div className="py-4 flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h4 className="text-base font-bold text-white">Unable to Check for Updates</h4>
            <p className="text-xs text-rose-300/90 max-w-sm">{errorMsg}</p>
            <Button variant="secondary" size="sm" onClick={checkUpdates} className="mt-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          </div>
        )}

        {/* State 3: Up to date */}
        {!isChecking && !errorMsg && updateInfo && !updateInfo.available && (
          <div className="py-4 flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="text-lg font-bold text-white">You're Up to Date!</h4>
            <p className="text-xs text-slate-300 max-w-xs">
              Sikat Cleaner <span className="font-mono font-bold text-emerald-400">v{updateInfo.currentVersion}</span> is currently the newest version available.
            </p>
            <Button variant="secondary" size="md" onClick={onClose} className="mt-2 px-6">
              Done
            </Button>
          </div>
        )}

        {/* State 4: Update Available */}
        {!isChecking && !errorMsg && updateInfo && updateInfo.available && (
          <div className="w-full flex flex-col items-center gap-3 text-left">
            <div className="p-3 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-1">
              <ArrowUpCircle className="h-10 w-10 text-cyan-400" />
            </div>

            <div className="text-center w-full">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                New Version Available
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">
                Sikat Cleaner v{updateInfo.version}
              </h4>
              <p className="text-xs text-slate-400">
                Current version: v{updateInfo.currentVersion}
              </p>
            </div>

            {/* Release notes card */}
            <div className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-mono font-semibold block">
                What's New:
              </span>
              <p className="text-slate-200 leading-relaxed font-sans">{updateInfo.body}</p>
            </div>

            {/* Progress bar during download */}
            {isDownloading && (
              <div className="w-full space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Downloading update...</span>
                  <span className="text-cyan-300 font-bold">
                    {formatBytes(progress.downloaded)} / {formatBytes(progress.total)}
                  </span>
                </div>
                <ProgressBar value={progressPercent} color="cyan" />
              </div>
            )}

            {/* Actions */}
            <div className="w-full flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-2">
              <Button variant="secondary" size="md" onClick={onClose} disabled={isDownloading}>
                Later
              </Button>

              {isReadyToRestart ? (
                <Button variant="gradient" size="md" onClick={handleRestart} className="px-6">
                  <RotateCcw className="h-4 w-4" />
                  Restart & Apply Update
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  size="md"
                  onClick={handleStartDownload}
                  isLoading={isDownloading}
                  className="px-6"
                >
                  <Sparkles className="h-4 w-4" />
                  Update Now
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
