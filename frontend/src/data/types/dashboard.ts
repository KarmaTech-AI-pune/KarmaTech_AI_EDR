export interface Project {
  id: string;
  name: string;
  severity: 'P3' | 'P5';
  status: 'falling_behind' | 'scope_issue' | 'cost_overrun' | 'on_track';
  delay: number;
  region: string;
  budget: number;
  spent: number;
  timeline: string;
  issues: string[];
}

export interface RegionalData {
  region: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  revenue: number;
  profit: number;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  npv: number;
  approvalDelays: number;
  revenueAtRisk: number;
}

export interface CashflowData {
  month: string;
  planned: number;
  actual: number;
  variance: number;
}

export interface PendingApproval {
  id: number;
  project: string;
  manager: string;
  days: number;
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface MilestoneData {
  id: number;
  project: string;
  milestone: string;
  expectedAmount: number;
  status: 'Overdue' | 'On Track' | 'At Risk';
  daysDelayed: number;
  penalty: number;
}

export interface TaskItem {
  id: number;
  title: string;
  category: 'urgent_important' | 'important_not_urgent' | 'urgent_not_important' | 'neither';
}

export interface AISuggestion {
  id: number;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  icon: string;
}

export interface DashboardFilters {
  selectedRegion: string;
  timeframe: string;
}
