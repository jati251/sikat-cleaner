import React from "react";
import { useSmartScanQuery, useCleanMutation } from "../api";
import { SmartScanRadar } from "./SmartScanRadar";
import { SmartScanResults } from "./SmartScanResults";
import { useAppStore } from "@/stores/useAppStore";
import { useItemSelection } from "@/hooks/useItemSelection";
import { formatBytesParts } from "@/utils/formatters";
import { CleanItem } from "@/types";

export const SmartScanView: React.FC = () => {
  const [isScanning, setIsScanning] = React.useState(false);
  const [hasScanned, setHasScanned] = React.useState(false);

  const { data: scanSummary, refetch: triggerSmartScan } = useSmartScanQuery(false);
  const cleanMutation = useCleanMutation();
  const setLastReclaimed = useAppStore((state) => state.setLastReclaimed);

  const scanItems = React.useMemo(() => scanSummary?.items ?? [], [scanSummary]);

  const {
    selectedIds,
    toggleItem,
    selectAll,
    clearAll,
    setSelectedIds,
  } = useItemSelection<CleanItem>({
    items: scanItems,
    getItemId: (i) => i.id,
    getItemBytes: (i) => i.size_bytes,
  });

  const totalReclaimable = scanSummary?.total_bytes ?? 0;
  const totalFoundCount = scanSummary?.total_items ?? 0;
  const formattedSize = formatBytesParts(totalReclaimable);

  const handleStartSmartScan = async () => {
    setIsScanning(true);
    setHasScanned(false);
    clearAll();

    try {
      const res = await triggerSmartScan();
      if (res.data?.items) {
        setSelectedIds(res.data.items.map((i) => i.id));
      }
      setHasScanned(true);
    } catch (e) {
      console.error("Smart scan failed:", e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCleanAll = async () => {
    if (!scanSummary) return;

    const pathsToClean = scanSummary.items
      .filter((i) => selectedIds.includes(i.id))
      .map((i) => i.path);

    if (pathsToClean.length === 0) return;

    try {
      const result = await cleanMutation.mutateAsync({
        paths: pathsToClean,
        useTrash: true,
      });

      setLastReclaimed(result.reclaimed_bytes);
      clearAll();
      setHasScanned(false);
    } catch (e) {
      console.error("Clean failed:", e);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-4 pb-12 space-y-6">
      <SmartScanRadar
        isScanning={isScanning}
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
          selectedIds={selectedIds}
          onToggleItem={toggleItem}
          onSelectAll={selectAll}
          onClearAll={clearAll}
        />
      )}
    </div>
  );
};
