import { ScanSummary, CleanResult, CleanItem, CategorySummary } from "@/types";

export type { ScanSummary, CleanResult, CleanItem, CategorySummary };

export interface SmartScanState {
  isScanning: boolean;
  hasScanned: boolean;
}
