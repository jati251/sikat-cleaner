import React from "react";
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

  const [hasScanned, setHasScanned] = React.useState(false);

  const {
    data: scanSummary,
    isLoading: isScanning,
    refetch: runSmartScan,
  } = useSmartScanQuery(false);

  const cleanMutation = useCleanMutation();

  const totalReclaimable = scanSummary?.total_bytes ?? 0;
  const formattedSize = formatBytesParts(totalReclaimable);
  const totalFoundCount = scanSummary?.total_items ?? 0;

  const handleStartSmartScan = async () => {
    setHasScanned(true);
    const res = await runSmartScan();
    if (res.data?.items) {
      selectAllItems(res.data.items.map((i) => i.id));
    }
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

        {/* View Switcher based on currentSection */}
        <div className="flex-1 overflow-hidden" key={currentSection}>
          {currentSection === "smart-scan" && (
            <div className="h-full overflow-y-auto px-6 pb-12 space-y-6">
              <SmartScanRadar
                isScanning={isScanning}
                onStartScan={handleStartSmartScan}
                onCleanAll={handleCleanAll}
                scanCompleted={hasScanned && Boolean(scanSummary)}
                reclaimableBytes={totalReclaimable}
                totalFoundCount={totalFoundCount}
                formattedSize={formattedSize}
                isCleaning={cleanMutation.isPending}
              />

              {hasScanned && scanSummary && (
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
