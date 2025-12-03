import React, { createContext, useContext, ReactNode } from 'react';
import { WBSRowData, WBSOption } from '../types/wbs';
import { resourceRole } from '../../../models/resourceRoleModel';
import { Employee } from '../../../models/employeeModel';
import { useWBSData } from '../hooks/useWBSData';
import { useWBSFormLogic } from '../hooks/useWBSFormLogic';
import { useWBSTotals } from '../hooks/useWBSTotals';
import { useProject } from '../../../context/ProjectContext';

// Data Context - Read-only data
interface WBSDataContextType {
  // Data
  manpowerRows: WBSRowData[];
  odcRows: WBSRowData[];
  months: string[];
  roles: resourceRole[];
  employees: Employee[];
  
  // Options
  level1Options: WBSOption[];
  level2Options: WBSOption[];
  level3OptionsMap: { [key: string]: WBSOption[] };
  
  // Config
  formType: 'manpower' | 'odc';
  editMode: boolean;
  
  // Calculated
  totalHours: number;
  totalCost: number;
  
  // State
  loading: boolean;
  wbsHeaderId: number;
  
  // Utility
  getProjectStartDate: () => string;
}

// Actions Context - All handlers and operations
interface WBSActionsContextType {
  // Edit mode
  onEditModeToggle: () => void;
  
  // Row operations
  addNewRow: (level: 1 | 2 | 3, parentId?: string) => void;
  handleDeleteClick: (id: string) => void;
  handleDeleteCancel: () => void;
  handleDeleteConfirm: () => Promise<void>;
  
  // Field updates
  handleLevelChange: (id: string, value: string) => void;
  handleRoleChange: (id: string, roleId: string) => void;
  handleUnitChange: (id: string, unitValue: string) => void;
  handleEmployeeChange: (id: string, employeeId: string) => void;
  handleCostRateChange: (id: string, value: string) => void;
  handleHoursChange: (id: string, month: string, value: string) => void;
  handleODCChange: (id: string, value: string) => void;
  handleResourceRoleChange: (id: string, value: string) => void;
  
  // Month operations
  addNewMonth: () => void;
  
  // State setters (needed by parent component)
  setManpowerRows: React.Dispatch<React.SetStateAction<WBSRowData[]>>;
  setOdcRows: React.Dispatch<React.SetStateAction<WBSRowData[]>>;
  setMonths: React.Dispatch<React.SetStateAction<string[]>>;
  setLevel3OptionsMap: React.Dispatch<React.SetStateAction<{ [key: string]: WBSOption[] }>>;
  
  // Snackbar
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>;
  setSnackbarSeverity: React.Dispatch<React.SetStateAction<'success' | 'error'>>;
  
  // Reload
  reloadWBSData: () => void;
  
  // Delete dialog state
  deleteDialog: {
    open: boolean;
    rowId?: string;
    childCount: number;
  };
}

// UI State Context - Snackbar and other UI state
interface WBSUIStateContextType {
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: 'success' | 'error';
}

// Create contexts
const WBSDataContext = createContext<WBSDataContextType | undefined>(undefined);
const WBSActionsContext = createContext<WBSActionsContextType | undefined>(undefined);
const WBSUIStateContext = createContext<WBSUIStateContextType | undefined>(undefined);

// Provider Props
interface WBSProviderProps {
  children: ReactNode;
  formType: 'manpower' | 'odc';
  editMode: boolean;
  onEditModeToggle: () => void;
}

// Main Provider Component
export const WBSProvider: React.FC<WBSProviderProps> = ({
  children,
  formType,
  editMode,
  onEditModeToggle,
}) => {
  const { projectId } = useProject();
  
  // Use existing hooks
  const dataHook = useWBSData({ formType });
  const totalsHook = useWBSTotals({
    manpowerRows: dataHook.manpowerRows,
    odcRows: dataHook.odcRows,
    formType,
  });
  
  const logicHook = useWBSFormLogic({
    projectId,
    formType,
    manpowerRows: dataHook.manpowerRows,
    setManpowerRows: dataHook.setManpowerRows,
    odcRows: dataHook.odcRows,
    setOdcRows: dataHook.setOdcRows,
    months: dataHook.months,
    setMonths: dataHook.setMonths,
    roles: dataHook.roles,
    allEmployees: dataHook.allEmployees,
    level1Options: dataHook.level1Options,
    level2Options: dataHook.level2Options,
    level3OptionsMap: dataHook.level3OptionsMap,
    setLevel3OptionsMap: dataHook.setLevel3OptionsMap,
    setSnackbarOpen: dataHook.setSnackbarOpen,
    setSnackbarMessage: dataHook.setSnackbarMessage,
    setSnackbarSeverity: dataHook.setSnackbarSeverity,
    reloadWBSData: dataHook.reloadWBSData,
    getProjectStartDate: dataHook.getProjectStartDate,
  });

  // Combine data for context
  const dataContextValue: WBSDataContextType = {
    manpowerRows: dataHook.manpowerRows,
    odcRows: dataHook.odcRows,
    months: dataHook.months,
    roles: dataHook.roles,
    employees: dataHook.allEmployees,
    level1Options: dataHook.level1Options,
    level2Options: dataHook.level2Options,
    level3OptionsMap: dataHook.level3OptionsMap,
    formType,
    editMode,
    totalHours: totalsHook.calculatedTotalHours,
    totalCost: totalsHook.calculatedTotalCost,
    loading: dataHook.loading,
    wbsHeaderId: dataHook.wbsHeaderId,
    getProjectStartDate: dataHook.getProjectStartDate,
  };

  const actionsContextValue: WBSActionsContextType = {
    onEditModeToggle,
    addNewRow: logicHook.addNewRow,
    handleDeleteClick: logicHook.handleDeleteClick,
    handleDeleteCancel: logicHook.handleDeleteCancel,
    handleDeleteConfirm: logicHook.handleDeleteConfirm,
    handleLevelChange: logicHook.handleLevelChange,
    handleRoleChange: logicHook.handleRoleChange,
    handleUnitChange: logicHook.handleUnitChange,
    handleEmployeeChange: logicHook.handleEmployeeChange,
    handleCostRateChange: logicHook.handleCostRateChange,
    handleHoursChange: logicHook.handleHoursChange,
    handleODCChange: logicHook.handleODCChange,
    handleResourceRoleChange: logicHook.handleResourceRoleChange,
    addNewMonth: logicHook.addNewMonth,
    setManpowerRows: dataHook.setManpowerRows,
    setOdcRows: dataHook.setOdcRows,
    setMonths: dataHook.setMonths,
    setLevel3OptionsMap: dataHook.setLevel3OptionsMap,
    setSnackbarOpen: dataHook.setSnackbarOpen,
    setSnackbarMessage: dataHook.setSnackbarMessage,
    setSnackbarSeverity: dataHook.setSnackbarSeverity,
    reloadWBSData: dataHook.reloadWBSData,
    deleteDialog: logicHook.deleteDialog,
  };

  const uiStateContextValue: WBSUIStateContextType = {
    snackbarOpen: dataHook.snackbarOpen,
    snackbarMessage: dataHook.snackbarMessage,
    snackbarSeverity: dataHook.snackbarSeverity,
  };

  return (
    <WBSDataContext.Provider value={dataContextValue}>
      <WBSActionsContext.Provider value={actionsContextValue}>
        <WBSUIStateContext.Provider value={uiStateContextValue}>
          {children}
        </WBSUIStateContext.Provider>
      </WBSActionsContext.Provider>
    </WBSDataContext.Provider>
  );
};

// Custom hooks to use contexts
export const useWBSDataContext = (): WBSDataContextType => {
  const context = useContext(WBSDataContext);
  if (!context) {
    throw new Error('useWBSDataContext must be used within WBSProvider');
  }
  return context;
};

export const useWBSActionsContext = (): WBSActionsContextType => {
  const context = useContext(WBSActionsContext);
  if (!context) {
    throw new Error('useWBSActionsContext must be used within WBSProvider');
  }
  return context;
};

export const useWBSUIStateContext = (): WBSUIStateContextType => {
  const context = useContext(WBSUIStateContext);
  if (!context) {
    throw new Error('useWBSUIStateContext must be used within WBSProvider');
  }
  return context;
};
