import { useState, useCallback } from 'react';

interface UseExpansionStateReturn {
  expandedLevel1: Set<string>;
  expandedLevel2: Set<string>;
  toggleLevel1: (id: string) => void;
  toggleLevel2: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

/**
 * Custom hook for managing expansion state of hierarchical WBS items
 * Separates state management logic from UI components
 */
export const useExpansionState = (): UseExpansionStateReturn => {
  const [expandedLevel1, setExpandedLevel1] = useState<Set<string>>(new Set());
  const [expandedLevel2, setExpandedLevel2] = useState<Set<string>>(new Set());

  const toggleLevel1 = useCallback((id: string) => {
    setExpandedLevel1((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleLevel2 = useCallback((id: string) => {
    setExpandedLevel2((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    // This could be enhanced to take level1 and level2 data to expand all items
    // For now, it's a placeholder for future enhancement
    setExpandedLevel1(new Set());
    setExpandedLevel2(new Set());
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedLevel1(new Set());
    setExpandedLevel2(new Set());
  }, []);

  return {
    expandedLevel1,
    expandedLevel2,
    toggleLevel1,
    toggleLevel2,
    expandAll,
    collapseAll,
  };
};
