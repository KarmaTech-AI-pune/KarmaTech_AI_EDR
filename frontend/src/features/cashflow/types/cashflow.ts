/**
 * Type definitions for Cash Flow Feature
 * Comprehensive, type-safe interfaces for the entire feature
 */

// ============= Core Types =============

export type CashFlowStatus = 'Completed' | 'Planned';

export type ViewMode = 'Monthly' | 'Cumulative' | 'Milestones';

export type CellAlignment = 'left' | 'center' | 'right';

// ============= Data Interfaces =============

export interface CashFlowRow {
  period: string; 
  hours: number;
  personnel: number;
  odc: number;
  totalCosts: number;
  revenue: number;
  netCashFlow: number;
  status: CashFlowStatus;
}

export interface CashFlowTotals {
  hours: number;
  personnel: number;
  odc: number;
  totalCosts: number;
  revenue: number;
  netCashFlow: number;
}

export interface CashFlowData {
  projectId: string;
  rows: CashFlowRow[];
  totals?: CashFlowTotals;
}

// ============= Metrics & Calculations =============

export interface CashFlowMetrics {
  totalRevenue: number;
  totalCosts: number;
  netTotal: number;
  completedCount: number;
  plannedCount: number;
}

export interface CashFlowCalculations {
  burnRate: number;
  runway: number;
  averageRevenue: number;
  profitMargin: number;
}

// ============= Filter & Configuration =============

export interface CashFlowFilterOptions {
  status?: CashFlowStatus;
  showProjections: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ColumnConfig {
  label: string;
  align: CellAlignment;
  width: string;
}

export interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

// ============= Component Props =============

export interface TableCellProps {
  value: string | number;
  type?: 'text' | 'currency' | 'number' | 'status';
  align?: CellAlignment;
  colorClass?: string;
  className?: string;
}

export interface TableRowProps {
  row: CashFlowRow;
  index: number;
  onRowClick?: (row: CashFlowRow) => void;
}

export interface StatusBadgeProps {
  status: CashFlowStatus;
  className?: string;
}

export interface ViewToggleProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

// ============= Context Types =============

export interface CashFlowDataContextType {
  data: CashFlowData | null;
  filteredRows: CashFlowRow[];
  totals: CashFlowTotals | null;
  metrics: CashFlowMetrics;
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  showProjections: boolean;
}

export interface CashFlowActionsContextType {
  setViewMode: (mode: ViewMode) => void;
  toggleProjections: () => void;
  refreshData: () => Promise<void>;
  updateRow: (index: number, updatedRow: CashFlowRow) => Promise<void>;
  deleteRow?: (index: number) => Promise<void>;
  addRow?: (row: CashFlowRow) => Promise<void>;
}

export interface CashFlowUIContextType {
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: 'success' | 'error' | 'info' | 'warning';
  setSnackbarOpen: (open: boolean) => void;
  setSnackbarMessage: (message: string) => void;
  setSnackbarSeverity: (severity: 'success' | 'error' | 'info' | 'warning') => void;
}

// ============= API Types =============

export interface CashFlowApiResponse {
  success: boolean;
  data?: CashFlowData;
  error?: string;
  message?: string;
}

export interface UpdateCashFlowPayload {
  projectId: string;
  data: CashFlowData;
}

// ============= Hook Return Types =============

export interface UseCashFlowReturn extends CashFlowDataContextType, CashFlowActionsContextType {}

export interface UseCashFlowCalculationsReturn {
  calculateTotals: (rows: CashFlowRow[]) => CashFlowTotals;
  calculateMetrics: (data: CashFlowData | null) => CashFlowMetrics;
  calculateCumulative: (rows: CashFlowRow[]) => CashFlowRow[];
}

export interface UseCashFlowFiltersReturn {
  filteredRows: CashFlowRow[];
  applyFilters: (rows: CashFlowRow[], options: CashFlowFilterOptions) => CashFlowRow[];
}
