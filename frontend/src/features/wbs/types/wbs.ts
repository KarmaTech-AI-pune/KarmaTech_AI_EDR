// Types from original wbs.tsx
export interface WBSOption {
  id: string;
  value: string;
  label: string;
  level?: number;
  parentValue?: string | null;
  formType?: number;
  children?: WBSOption[]; // Add children for nesting
}

// Base item interface for WBS options
export interface IWBSItem {
  id: string;
  value: string;
  label: string;
  level: number;
  formType: number;
}

// Level-specific interfaces
export interface IWBSLevel1 extends IWBSItem {
  level: 1;
  parentId: null;
  children?: IWBSLevel2[]; // For hierarchical display
}

export interface IWBSLevel2 extends IWBSItem {
  level: 2;
  parentId: number | null; // ID of Level 1 parent
  children?: IWBSLevel3[]; // For hierarchical display
}

export interface IWBSLevel3 extends IWBSItem {
  level: 3;
  parentId: number; // ID of Level 2 parent (always has a parent)
}

// WBS data structure for managing all levels
export interface IWBSData {
  level1: IWBSLevel1[];
  level2: IWBSLevel2[];
  level3: { [key: string]: IWBSLevel3[] }; // Keyed by level2 value
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
  costRate: number | string;
  plannedHours: { [key: string]: { [key: string]: number | string } };
  odc: number | string;
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
  workBreakdownStructureId?: number; // Store the work breakdown structure ID
}

export interface WBSChildTotals {
  plannedHours: { [key: string]: { [key: string]: number | string } };
  totalHours: number;
  odc: number | string;
  odcHours?: number;
  totalCost: number;
}


// Interface for form inputs using react-hook-form
export interface IWBSFormInputs {
  label: string;
  parentId: number | null; // Parent ID (numeric, matching backend)
  level: number; // Level of the WBS option being added/edited
}

export interface WBSVersion {
  id: number;
  projectId: number;
  version: string;
  comments: string;
  isActive: boolean;
  isLatest: boolean;
  createdAt: string;
  createdBy: string;
  status: string;
  statusId: number;
}

export interface WBSVersionDetails extends WBSVersion {
  tasks: WBSRowData[];
}
