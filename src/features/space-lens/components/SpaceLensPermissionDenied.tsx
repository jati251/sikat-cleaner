import React from "react";
import { Button } from "@/components/ui/Button";
import { openFullDiskAccessSettings } from "@/services/tauriClient";
import { ShieldAlert, Lock, ExternalLink, RefreshCw } from "lucide-react";

export interface SpaceLensPermissionDeniedProps {
  currentPath?: string;
  onRescan: () => void;
  onGoHome: () => void;
}

export const SpaceLensPermissionDenied: React.FC<SpaceLensPermissionDeniedProps> = ({
  currentPath,
  onRescan,
  onGoHome,
}) => {

  return (
    <div className="h-full w-full rounded-3xl border border-rose-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 p-6 lg:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-xl select-none">
      {/* Subtle ambient rose glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Icon with glowing badge */}
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/40">
          <ShieldAlert className="h-7 w-7 animate-pulse text-rose-400" />
        </div>
        <div className="absolute -top-1 -right-1 p-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400">
          <Lock className="h-3 w-3" />
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-lg lg:text-xl font-bold text-white mb-1.5 flex items-center gap-2">
        Full Disk Access Required
      </h3>
      <p className="text-xs text-slate-300 max-w-md mb-4 leading-relaxed">
        macOS Privacy & Security limits access to{" "}
        <span className="font-mono text-[11px] text-rose-300 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20">
          {currentPath || "this folder"}
        </span>
        . Cleaner apps require Full Disk Access to analyze disk usage and remove junk.
      </p>

      {/* 3 Step Instruction Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-2xl p-3.5 mb-5 text-left space-y-2.5 text-xs text-slate-300">
        <div className="flex items-start gap-2.5">
          <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
            1
          </span>
          <span>
            Click <strong className="text-white">Open System Settings</strong> below.
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
            2
          </span>
          <span>
            Enable the toggle for <strong className="text-white">Cekcok Sikat Cleaner</strong>.
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
            3
          </span>
          <span>
            Return here and click <strong className="text-white">Rescan Folder</strong>.
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 flex-wrap justify-center">
        <Button
          variant="primary"
          size="sm"
          onClick={openFullDiskAccessSettings}
          className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/20 font-semibold"
        >
          <ExternalLink className="h-3.5 w-3.5 mr-1" />
          Open System Settings
        </Button>
        <Button variant="secondary" size="sm" onClick={onRescan}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Rescan Folder
        </Button>
        <Button variant="ghost" size="sm" onClick={onGoHome}>
          Go to Home
        </Button>
      </div>
    </div>
  );
};
