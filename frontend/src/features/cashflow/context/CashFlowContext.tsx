/**
 * CashFlowContext - Multi-Context Pattern (Senior Level Architecture)
 * Separation of concerns: Data, Actions, and UI State
 * Following the WBS feature's advanced pattern
 */

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import {
  CashFlowData,
  CashFlowRow,
  CashFlowDataContextType,
  CashFlowActionsContextType,
  CashFlowUIContextType,
  ViewMode,
} from '../types';
import { useCashFlowData } from '../hooks/useCashFlowData';
import { useCashFlowFilters } from '../hooks/useCashFlowFilters';
import { useCashFlowCalculations } from '../hooks/useCashFlowCalculations';
import { useProject } from '../../../context/ProjectContext';

// ============= Create Contexts =============

const CashFlowDataContext = createContext<CashFlowDataContextType | undefined>(undefined);
const CashFlowActionsContext = createContext<CashFlowActionsContextType | undefined>(undefined);
const CashFlowUIContext = createContext<CashFlowUIContextType | undefined>(undefined);

// ============= Provider Props =============

interface CashFlowProviderProps {
  children: ReactNode;
}

// ============= Main Provider Component =============

export const CashFlowProvider: React.FC<CashFlowProviderProps> = ({ children }) => {
  // Get projectId from ProjectContext (session storage)
  const { projectId } = useProject();
  
  // View and UI State
  const [viewMode, setViewMode] = useState<ViewMode>('BudgetDashboard');
  const [showProjections, setShowProjections] = useState<boolean>(true);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  // Use custom hooks for data management
  const {
    data,
    loading,
    error,
    fetchData,
    updateData,
    addPaymentMilestone,
  } = useCashFlowData({ projectId: projectId || '' });

  // Fetch data on mount
  useEffect(() => {
    console.log('CashFlowContext: projectId changed:', projectId);
    if (projectId) {
      console.log('CashFlowContext: Fetching cashflow data for project:', projectId);
      fetchData();
    } else {
      console.warn('CashFlowContext: No projectId available');
    }
  }, [projectId, fetchData]);

  // Apply filters
  const { filteredRows } = useCashFlowFilters({
    rows: data?.rows || [],
    showProjections,
  });

  // Calculate metrics and display rows
  const { totals, metrics, displayRows } = useCashFlowCalculations({
    data,
    viewMode,
    filteredRows,
  });

  // ============= Actions =============

  const toggleProjections = useCallback(() => {
    setShowProjections((prev) => !prev);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      await fetchData();
      setSnackbarMessage('Data refreshed successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Failed to refresh data');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [fetchData]);

  const updateRow = useCallback(
    async (index: number, updatedRow: CashFlowRow) => {
      if (!data) return;

      try {
        const newRows = [...data.rows];
        newRows[index] = updatedRow;
        const updatedData: CashFlowData = { ...data, rows: newRows };

        await updateData(updatedData);
        
        setSnackbarMessage('Row updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (err) {
        setSnackbarMessage('Failed to update row');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        
        // Revert on error
        await fetchData();
      }
    },
    [data, updateData, fetchData]
  );

  // ============= Context Values =============

  const dataContextValue: CashFlowDataContextType = {
    data,
    filteredRows: displayRows,
    totals,
    metrics,
    loading,
    error,
    viewMode,
    showProjections,
  };

  const actionsContextValue: CashFlowActionsContextType = {
    setViewMode,
    toggleProjections,
    refreshData,
    updateRow,
    addPaymentMilestone,
  };

  const uiContextValue: CashFlowUIContextType = {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    setSnackbarOpen,
    setSnackbarMessage,
    setSnackbarSeverity,
  };

  return (
    <CashFlowDataContext.Provider value={dataContextValue}>
      <CashFlowActionsContext.Provider value={actionsContextValue}>
        <CashFlowUIContext.Provider value={uiContextValue}>
          {children}
        </CashFlowUIContext.Provider>
      </CashFlowActionsContext.Provider>
    </CashFlowDataContext.Provider>
  );
};

// ============= Custom Hooks to Use Contexts =============

export const useCashFlowDataContext = (): CashFlowDataContextType => {
  const context = useContext(CashFlowDataContext);
  if (!context) {
    throw new Error('useCashFlowDataContext must be used within CashFlowProvider');
  }
  return context;
};

export const useCashFlowActionsContext = (): CashFlowActionsContextType => {
  const context = useContext(CashFlowActionsContext);
  if (!context) {
    throw new Error('useCashFlowActionsContext must be used within CashFlowProvider');
  }
  return context;
};

export const useCashFlowUIContext = (): CashFlowUIContextType => {
  const context = useContext(CashFlowUIContext);
  if (!context) {
    throw new Error('useCashFlowUIContext must be used within CashFlowProvider');
  }
  return context;
};

// ============= Combined Hook (For Convenience) =============

export const useCashFlow = () => {
  const data = useCashFlowDataContext();
  const actions = useCashFlowActionsContext();
  
  return {
    ...data,
    ...actions,
  };
};
