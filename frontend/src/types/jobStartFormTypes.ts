export interface WBSResource {
  id: number | string; // ID can be a number or string from the API
  taskType: 0 | 1;
  description: string;
  rate: number;
  units: number;
  budgetedCost: number;
  remarks: string | null;
  employeeName?: string | null; // For Manpower resources (taskType=0)
  name?: string | null; // For ODC resources (taskType=1)
}

export interface JobstartTimeProps {
  wbsResources: WBSResource[];
  initialTimeContingencyUnits?: number;
  initialTimeContingencyRemarks?: string;
  onTotalCostChange?: (data: { resources: WBSResource[], customRows: any[] }) => void;
}

export interface EstimatedExpensesProps {
  wbsResources: WBSResource[];
  initialContingencyUnits?: number;
  initialContingencyRemarks?: string;
  initialExpenseContingencyUnits?: number;
  initialExpenseContingencyRemarks?: string;
  onTotalCostChange?: (data: { resources: WBSResource[], customRows: any[] }) => void;
}
