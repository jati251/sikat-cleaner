import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "./Sidebar";
import { useAppStore } from "@/stores/useAppStore";
import {
  SmartScanRadar,
  SmartScanResults,
  CleanSuccessModal,
  useSmartScanQuery,
  useCleanMutation,
} from "@/features/smart-scan";
import { SystemJunkView } from "@/features/system-junk";
import { DeveloperJunkView } from "@/features/developer-junk";
import { SpaceLensView } from "@/features/space-lens";
import { AppManagerView } from "@/features/app-manager";
import { StartupItemsView } from "@/features/startup-items";
import { PerformanceView } from "@/features/performance";
import { formatBytesParts } from "@/utils/formatters";

export const AppLayout: React.FC = () => {
  const {
    currentSection,
    selectedItemIds,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    showSuccessModal,
    setShowSuccessModal,
    lastReclaimedBytes,
    setLastReclaimed,
  } = useAppStore();

  const [isScanActive, setIsScanActive] = React.useState(false);
  const [hasScanned, setHasScanned] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState(0);

  const {
    data: scanSummary,
    isFetching,
    refetch: runSmartScan,
  } = useSmartScanQuery(false);

  const isScanning = isScanActive || isFetching;
  const cleanMutation = useCleanMutation();

  const totalReclaimable = scanSummary?.total_bytes ?? 0;
  const formattedSize = formatBytesParts(totalReclaimable);
  const totalFoundCount = scanSummary?.total_items ?? 0;

  const handleStartSmartScan = async () => {
    // 1. Hide previous results and start active scan animation
    setHasScanned(false);
    setIsScanActive(true);
    setScanProgress(8);

    // 2. Launch query
    const queryPromise = runSmartScan();

    // 3. Fluidly advance progress over ~2.8 seconds
    const duration = 2800;
    const start = Date.now();

    await new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min(96, Math.floor((elapsed / duration) * 96));
        setScanProgress(pct);

        if (elapsed >= duration) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });

    const res = await queryPromise;

    // 4. Pop to 100% and transition to results
    setScanProgress(100);
    setTimeout(() => {
      setIsScanActive(false);
      setHasScanned(true);
      if (res.data?.items) {
        selectAllItems(res.data.items.map((i) => i.id));
      }
    }, 350);
  };

  const handleCleanAll = async () => {
    if (!scanSummary?.items) return;

    const pathsToClean = scanSummary.items
      .filter((i) => selectedItemIds.includes(i.id))
      .map((i) => i.path);

    if (pathsToClean.length === 0) return;

    try {
      const result = await cleanMutation.mutateAsync({
        paths: pathsToClean,
        useTrash: true,
      });

      setLastReclaimed(result.reclaimed_bytes);
      clearSelection();
      setHasScanned(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Acrylic Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-radial from-slate-900 via-slate-950 to-black">
        {/* macOS Window Titlebar Drag Strip */}
        <div
          className="h-8 w-full flex-shrink-0 cursor-default"
          data-tauri-drag-region
        />

        {/* View Switcher with smooth page transitions */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 10, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full overflow-hidden"
            >
              {currentSection === "smart-scan" && (
                <div className="h-full overflow-y-auto px-6 pb-12 space-y-6">
                  <SmartScanRadar
                    isScanning={isScanning}
                    scanProgress={scanProgress}
                    onStartScan={handleStartSmartScan}
                    onCleanAll={handleCleanAll}
                    scanCompleted={!isScanning && hasScanned && Boolean(scanSummary)}
                    reclaimableBytes={totalReclaimable}
                    totalFoundCount={totalFoundCount}
                    formattedSize={formattedSize}
                    isCleaning={cleanMutation.isPending}
                  />

                  {!isScanning && hasScanned && scanSummary && (
                    <SmartScanResults
                      summary={scanSummary}
                      selectedIds={selectedItemIds}
                      onToggleItem={toggleItemSelection}
                      onSelectAll={() => selectAllItems(scanSummary.items.map((i) => i.id))}
                      onClearAll={clearSelection}
                    />
                  )}
                </div>
              )}

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
