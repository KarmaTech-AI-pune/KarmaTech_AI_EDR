export interface WBSOption {
  value: string;
  label: string;
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
  totalHours: number;
  totalCost: number;
  parentId?: string | null;
  assignedUserId?: string | null;
}

export interface WBSChildTotals {
  monthlyHours: { [key: string]: { [key: string]: number } };
  totalHours: number;
  odc: number;
  totalCost: number;
}
