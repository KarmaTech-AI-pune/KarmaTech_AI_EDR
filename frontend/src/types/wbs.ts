// Types from original wbs.tsx
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

// Types from wbs.ts (my created types)
// Base interface for common properties across all WBS items
export interface IWBSItem {
  id: string; // Changed from number to string to match WBSOption from API
  value: string;
  label: string;
  level: number;
  formType: number;
}

// Interface for Level 1 items
export interface IWBSLevel1 extends IWBSItem {
  parentValue: null;
}

// Interface for Level 2 items
export interface IWBSLevel2 extends IWBSItem {
  parentValue: string[] | null; // JSON has string[], but display will be NULL as clarified
}

// Interface for Level 3 items
export interface IWBSLevel3 extends IWBSItem {
  parentValue: string; // Parent is a Level 2 item's value
}

// Interface for the overall WBS data payload
export interface IWBSData {
  level1: IWBSLevel1[];
  level2: IWBSLevel2[];
  level3: {
    [key: string]: IWBSLevel3[]; // Level 3 items grouped by Level 2 parent value
  };
}

// Interface for form inputs using react-hook-form
export interface IWBSFormInputs {
  label: string;
  parentValue: string | string[] | null; // Can be string, array of strings, or null
}
