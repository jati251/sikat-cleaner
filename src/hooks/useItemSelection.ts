import React from "react";

export interface UseItemSelectionOptions<T> {
  items: T[];
  getItemId: (item: T) => string;
  getItemBytes?: (item: T) => number;
}

export interface UseItemSelectionReturn {
  selectedIds: string[];
  toggleItem: (id: string) => void;
  selectAll: () => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  selectedCount: number;
  totalSelectedBytes: number;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

/**
 * Reusable selection hook for multi-select checklists with byte sum calculations
 */
export function useItemSelection<T>({
  items,
  getItemId,
  getItemBytes,
}: UseItemSelectionOptions<T>): UseItemSelectionReturn {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const toggleItem = React.useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const selectAll = React.useCallback(() => {
    setSelectedIds(items.map(getItemId));
  }, [items, getItemId]);

  const clearAll = React.useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = React.useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const isAllSelected = React.useMemo(() => {
    return items.length > 0 && items.every((i) => selectedIds.includes(getItemId(i)));
  }, [items, selectedIds, getItemId]);

  const totalSelectedBytes = React.useMemo(() => {
    if (!getItemBytes) return 0;
    return items
      .filter((i) => selectedIds.includes(getItemId(i)))
      .reduce((acc, curr) => acc + getItemBytes(curr), 0);
  }, [items, selectedIds, getItemId, getItemBytes]);

  return {
    selectedIds,
    toggleItem,
    selectAll,
    clearAll,
    isSelected,
    isAllSelected,
    selectedCount: selectedIds.length,
    totalSelectedBytes,
    setSelectedIds,
  };
}
