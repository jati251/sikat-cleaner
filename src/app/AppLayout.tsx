import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Sidebar } from "./Sidebar";
import { useAppStore } from "@/stores/useAppStore";
import { SmartScanView, CleanSuccessModal } from "@/features/smart-scan";
import { SystemJunkView } from "@/features/system-junk";
import { DeveloperJunkView } from "@/features/developer-junk";
import { SpaceLensView } from "@/features/space-lens";
import { AppManagerView } from "@/features/app-manager";
import { StartupItemsView } from "@/features/startup-items";
import { PerformanceView } from "@/features/performance";

export const AppLayout: React.FC = () => {
  const {
    currentSection,
    showSuccessModal,
    setShowSuccessModal,
    lastReclaimedBytes,
  } = useAppStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0e131b] text-[#e2f1f8] font-['VT323']">
      {/* Retro Pixel Terminal Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-[#0e131b]">
        {/* macOS Window Titlebar Drag Strip */}
        <div
          className="h-8 w-full flex-shrink-0 border-b border-[#2a3b50] bg-[#0e131b] cursor-default select-none"
          data-tauri-drag-region
          onMouseDown={(e) => {
            if (e.button === 0) {
              getCurrentWindow().startDragging();
            }
          }}
        />

        {/* View Switcher */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full overflow-hidden"
            >
              {currentSection === "smart-scan" && <SmartScanView />}
              {currentSection === "system-junk" && <SystemJunkView />}
              {currentSection === "developer-junk" && <DeveloperJunkView />}
              {currentSection === "space-lens" && <SpaceLensView />}
              {currentSection === "app-manager" && <AppManagerView />}
              {currentSection === "startup-items" && <StartupItemsView />}
              {currentSection === "performance" && <PerformanceView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Reclaim Celebration Modal */}
      <CleanSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        reclaimedBytes={lastReclaimedBytes}
      />
    </div>
  );
};
