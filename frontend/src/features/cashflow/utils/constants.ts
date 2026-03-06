/**
 * Constants for Cash Flow Feature
 * Centralized configuration to maintain DRY principles
 */

export const VIEW_MODES = {
  MONTHLY: 'Monthly',
  CUMULATIVE: 'Cumulative',
  MILESTONES: 'Milestones',
  BUDGET_DASHBOARD: 'BudgetDashboard',
  PAYMENT_SCHEDULE: 'PaymentSchedule',
} as const;

export const VIEW_LABELS = {
  [VIEW_MODES.MONTHLY]: 'Monthly View',
  [VIEW_MODES.CUMULATIVE]: 'Cumulative View',
  [VIEW_MODES.MILESTONES]: 'Milestones',
  [VIEW_MODES.BUDGET_DASHBOARD]: 'Budget Dashboard',
  [VIEW_MODES.PAYMENT_SCHEDULE]: 'Payment Schedule',
} as const;

export const STATUS_CONFIG = {
  Completed: {
    label: 'Completed',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  Planned: {
    label: 'Planned',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
} as const;

export const COLUMN_CONFIG = {
  PERIOD: { label: 'PERIOD', align: 'left' as const, width: 'px-6' },
  HOURS: { label: 'HOURS', align: 'center' as const, width: 'px-6' },
  PERSONNEL: { label: 'PERSONNEL', align: 'center' as const, width: 'px-6' },
  ODC: { label: 'ODC', align: 'center' as const, width: 'px-6' },
  TOTAL_COSTS: { label: 'TOTAL COSTS', align: 'center' as const, width: 'px-6' },
  REVENUE: { label: 'REVENUE', align: 'center' as const, width: 'px-6' },
  NET_CASH_FLOW: { label: 'NET CASH FLOW', align: 'center' as const, width: 'px-6' },
  STATUS: { label: 'STATUS', align: 'center' as const, width: 'px-6' },
} as const;

export const CURRENCY_CONFIG = {
  locale: 'en-IN',
  currency: 'INR',
  maximumFractionDigits: 0,
} as const;

export const COLOR_SCHEME = {
  NEGATIVE: 'text-red-600',
  POSITIVE: 'text-green-600',
  NEUTRAL: 'text-gray-700',
  TOTAL_COSTS: 'text-red-500',
  REVENUE: 'text-green-600',
} as const;
