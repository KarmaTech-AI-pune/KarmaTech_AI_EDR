export interface WBSOption {
  id: string;
  value: string;
  label: string;
}

export enum TaskType {
  Manpower = 0,
  ODC = 1
}

export interface WBSRowData {
  id: string;
  level: 1 | 2 | 3;
  title: string;
  role: string | null;
  name: string | null;
  costRate: number;
  plannedHours: { [key: string]: { [key: string]: number } };
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
  wbsOptionId?: string | null; // Store the ID of the selected WBS option
}

export interface WBSChildTotals {
  plannedHours: { [key: string]: { [key: string]: number } };
  totalHours: number;
  odc: number;
  odcHours?: number;
  totalCost: number;
}
