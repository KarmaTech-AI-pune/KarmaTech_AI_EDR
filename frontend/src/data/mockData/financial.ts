import { FinancialMetrics, CashflowData } from '../types/dashboard';

export const financialMetrics: FinancialMetrics = {
  totalRevenue: 8600000,
  totalProfit: 1548000,
  profitMargin: 18,
  npv: 2100000,
  approvalDelays: 12,
  revenueAtRisk: 450000
};

export const cashflowData: CashflowData[] = [
  { month: 'Jan', planned: 200, actual: 180, variance: -10 },
  { month: 'Feb', planned: 250, actual: 240, variance: -4 },
  { month: 'Mar', planned: 300, actual: 320, variance: 7 },
  { month: 'Apr', planned: 280, actual: 275, variance: -2 },
  { month: 'May', planned: 350, actual: 330, variance: -6 },
  { month: 'Jun', planned: 400, actual: 410, variance: 3 }
];
