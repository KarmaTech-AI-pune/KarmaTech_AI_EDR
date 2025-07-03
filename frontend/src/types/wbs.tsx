export interface WBSOption {
  value: string;
  label: string;
}

export enum TaskType {
  Manpower = 0,
  ODC = 1
}

export interface PlannedHourEntry {
  year: number;
  monthno: number;
  date?: string | null; // Date is optional - can be undefined or null
  weekno?: number | null; // Week is optional - can be undefined or null
  plannedHours: number;
}

export interface WBSRowData {
  id: string;
  level: 1 | 2 | 3;
  title: string;
  role: string | null;
  name: string | null;
  costRate: number;
  plannedHours: { [key: string]: { [key: string]: number } }; // Keep for backward compatibility
  PlannedHrs?: PlannedHourEntry[]; // New structure for enhanced payload
  odc: number;
  odcHours?: number;
  totalHours: number;
  totalCost: number;
  parentId?: string | null;
  assignedUserId?: string | null;
  taskType?: TaskType;
  unit?: string;
  resourceName?: string | null;
  resourceUnit?: string | null;
  resource_role: string | null; // Store role ID
  resource_role_name?: string | null; // Display role name
}

export interface WBSChildTotals {
  plannedHours: { [key: string]: { [key: string]: number } };
  totalHours: number;
  odc: number;
  odcHours?: number;
  totalCost: number;
}
