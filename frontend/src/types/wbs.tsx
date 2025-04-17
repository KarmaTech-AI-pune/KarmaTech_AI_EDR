export interface WBSOption {
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
  monthlyHours: { [key: string]: { [key: string]: number } };
  odc: number;
  odcHours?: number;
  totalHours: number;
  totalCost: number;
  parentId?: string | null;
  assignedUserId?: string | null;
  taskType?: TaskType; // Added TaskType field
  unit?: string; // Added unit field for both Manpower and ODC forms
}

export interface WBSChildTotals {
  monthlyHours: { [key: string]: { [key: string]: number } };
  totalHours: number;
  odc: number;
  odcHours?: number;
  totalCost: number;
}
