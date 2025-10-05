import { FinancialMetrics, CashflowData } from '../types/dashboard';

export const financialMetrics: FinancialMetrics = {
  totalRevenue: 8600000,
  totalRevenueChange: 12.5,
  totalRevenueChangeType: "positive",
  profitMargin: 18,
  profitMarginChange: 2.1,
  profitMarginChangeType: "positive",
  approvalDelays: 12,
  approvalDelaysChange: 11.7,
  approvalDelaysChangeType: "negative",
  revenueAtRisk: 450000,
  revenueAtRiskChange: 3,
  revenueAtRiskChangeType: "negative"
};

export const cashflowData: CashflowData[] = [
  { month: 'Jan', planned: 200, actual: 180, variance: -10 },
  { month: 'Feb', planned: 250, actual: 240, variance: -4 },
  { month: 'Mar', planned: 300, actual: 320, variance: 7 },
  { month: 'Apr', planned: 280, actual: 275, variance: -2 },
  { month: 'May', planned: 350, actual: 330, variance: -6 },
  { month: 'Jun', planned: 400, actual: 410, variance: 3 }
];
