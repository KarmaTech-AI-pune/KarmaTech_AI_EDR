export interface WBSOption {
  value: string;
  label: string;
}

export interface WBSRowData {
  id: number;
  level: 1 | 2 | 3;
  title: string;
  role: string | null;
  name: string | null;
  costRate: number;
  monthlyHours: { [key: string]: { [key: string]: number } };
  odc: number;
  totalHours: number;
  totalCost: number;
  parentId?: number | null;
  serverTaskId?: number;
}

export interface WBSChildTotals {
  monthlyHours: { [key: string]: { [key: string]: number } };
  totalHours: number;
  odc: number;
  totalCost: number;
}
