import { create } from "zustand";
import { NavSection } from "@/types";

interface AppState {
  currentSection: NavSection;
  selectedItemIds: string[];
  cleaningInProgress: boolean;
  lastReclaimedBytes: number;
  showSuccessModal: boolean;

  setSection: (section: NavSection) => void;
  toggleItemSelection: (id: string) => void;
  selectAllItems: (ids: string[]) => void;
  clearSelection: () => void;
  setCleaningInProgress: (inProgress: boolean) => void;
  setLastReclaimed: (bytes: number) => void;
  setShowSuccessModal: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentSection: "smart-scan",
  selectedItemIds: [],
  cleaningInProgress: false,
  lastReclaimedBytes: 0,
  showSuccessModal: false,

  setSection: (section) =>
    set({
      currentSection: section,
      selectedItemIds: [],
    }),

  toggleItemSelection: (id) =>
    set((state) => {
      const exists = state.selectedItemIds.includes(id);
      return {
        selectedItemIds: exists
          ? state.selectedItemIds.filter((item) => item !== id)
          : [...state.selectedItemIds, id],
      };
    }),

  selectAllItems: (ids) => set({ selectedItemIds: ids }),

  clearSelection: () => set({ selectedItemIds: [] }),

  setCleaningInProgress: (inProgress) => set({ cleaningInProgress: inProgress }),

  setLastReclaimed: (bytes) =>
    set({
      lastReclaimedBytes: bytes,
      showSuccessModal: true,
    }),

  setShowSuccessModal: (show) => set({ showSuccessModal: show }),
}));
