import { create } from "zustand";
import { NavSection } from "@/types";

interface AppState {
  currentSection: NavSection;
  lastReclaimedBytes: number;
  showSuccessModal: boolean;

  setSection: (section: NavSection) => void;
  setLastReclaimed: (bytes: number) => void;
  setShowSuccessModal: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentSection: "smart-scan",
  lastReclaimedBytes: 0,
  showSuccessModal: false,

  setSection: (section) =>
    set({
      currentSection: section,
    }),

  setLastReclaimed: (bytes) =>
    set({
      lastReclaimedBytes: bytes,
      showSuccessModal: true,
    }),

  setShowSuccessModal: (show) => set({ showSuccessModal: show }),
}));
