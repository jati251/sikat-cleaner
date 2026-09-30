import React from "react";
import { Button } from "@/components/ui/Button";
import { openFullDiskAccessSettings } from "@/services/tauriClient";
import { ShieldAlert, ExternalLink, RefreshCw } from "lucide-react";

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
    <div className="h-full w-full rounded-none border-2 border-[#ff2a6d] bg-[#182230] shadow-[4px_4px_0_#06101a] p-6 flex flex-col items-center justify-center text-center relative font-['VT323'] select-none">
      {/* Icon with glowing badge */}
      <div className="p-3 border-2 border-[#ff2a6d] bg-[#0e131b] text-[#ff2a6d] shadow-[2px_2px_0_#380817] mb-3">
        <ShieldAlert className="h-8 w-8" />
      </div>

      {/* Title & Description */}
      <h3 className="font-['Press_Start_2P'] text-xs sm:text-sm text-[#ff2a6d] uppercase mb-1">
        FULL DISK ACCESS REQUIRED
      </h3>
      <p className="text-base text-[#e2f1f8] max-w-md mb-4 leading-snug">
        macOS Privacy & Security limits access to{" "}
        <span className="font-mono text-sm text-[#00f0ff] bg-[#0e131b] px-1 py-0.5 border border-[#2a3b50]">
          {currentPath || "this folder"}
        </span>
        . Grant Full Disk Access in macOS System Settings to inspect deep storage and caches.
      </p>

      {/* 3 Step Instruction Card */}
      <div className="w-full max-w-md bg-[#0e131b] border-2 border-[#2a3b50] p-3 mb-4 text-left space-y-1.5 text-base text-[#e2f1f8]">
        <div className="flex items-start gap-2">
          <span className="text-[#00f0ff] font-bold">[1]</span>
          <span>Click <strong className="text-[#00f0ff]">Open System Settings</strong> below.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[#00f0ff] font-bold">[2]</span>
          <span>Enable the toggle switch for <strong className="text-[#00f0ff]">Sikat Cleaner</strong>.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[#00f0ff] font-bold">[3]</span>
          <span>Return here and click <strong className="text-[#00f0ff]">Rescan Folder</strong>.</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 flex-wrap justify-center">
        <Button
          variant="primary"
          size="sm"
          onClick={openFullDiskAccessSettings}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          OPEN SYSTEM SETTINGS
        </Button>
        <Button variant="secondary" size="sm" onClick={onRescan}>
          <RefreshCw className="h-3 w-3 mr-1" />
          RESCAN FOLDER
        </Button>
        <Button variant="ghost" size="sm" onClick={onGoHome}>
          GO TO HOME
        </Button>
      </div>
    </div>
  );
};
