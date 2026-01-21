import { useState, useCallback, useMemo } from 'react';
import { IWBSLevel1 } from '../types/wbs';

interface UseExpansionStateReturn {
  expandedLevel1: Set<string>;
  expandedLevel2: Set<string>;
  toggleLevel1: (id: string) => void;
  toggleLevel2: (id: string) => void;
  expandAll: (level1Items?: IWBSLevel1[]) => void;
  collapseAll: () => void;
  hasExpandedItems: boolean;
}

/**
 * Custom hook for managing expansion state of hierarchical WBS items
 * Separates state management logic from UI components
 * Enhanced with hasExpandedItems computed property and improved expandAll functionality
 */
export const useExpansionState = (): UseExpansionStateReturn => {
  const [expandedLevel1, setExpandedLevel1] = useState<Set<string>>(new Set());
  const [expandedLevel2, setExpandedLevel2] = useState<Set<string>>(new Set());

  // Computed property to check if any items are expanded
  const hasExpandedItems = useMemo(() => {
    return expandedLevel1.size > 0 || expandedLevel2.size > 0;
  }, [expandedLevel1.size, expandedLevel2.size]);

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

  const expandAll = useCallback((level1Items?: IWBSLevel1[]) => {
    try {
      if (level1Items && level1Items.length > 0) {
        // Expand all Level 1 items
        const level1Ids = new Set(level1Items.map(item => item.id));
        setExpandedLevel1(level1Ids);

        // Expand all Level 2 items that have children
        const level2Ids = new Set<string>();
        level1Items.forEach(level1Item => {
          if (level1Item.children && level1Item.children.length > 0) {
            level1Item.children.forEach(level2Item => {
              if (level2Item.children && level2Item.children.length > 0) {
                level2Ids.add(level2Item.id);
              }
            });
          }
        });
        setExpandedLevel2(level2Ids);
      } else {
        // Fallback: clear all expansions if no data provided
        setExpandedLevel1(new Set());
        setExpandedLevel2(new Set());
      }
    } catch (error) {
      console.error('Error expanding all items:', error);
      // Graceful degradation: clear expansions on error
      setExpandedLevel1(new Set());
      setExpandedLevel2(new Set());
    }
  }, []);

  const collapseAll = useCallback(() => {
    try {
      setExpandedLevel1(new Set());
      setExpandedLevel2(new Set());
    } catch (error) {
      console.error('Error collapsing all items:', error);
      // Even on error, ensure state is cleared
      setExpandedLevel1(new Set());
      setExpandedLevel2(new Set());
    }
  }, []);

  return {
    expandedLevel1,
    expandedLevel2,
    toggleLevel1,
    toggleLevel2,
    expandAll,
    collapseAll,
    hasExpandedItems,
  };
};
