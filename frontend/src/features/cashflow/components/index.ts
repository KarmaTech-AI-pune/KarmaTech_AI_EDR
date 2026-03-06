/**
 * Barrel export for Cash Flow Components
 * Centralized export for cleaner imports
 */

// Dumb Components
export * from './StatusBadge';
export * from './ViewToggle';
export * from './CashFlowTableCell';
export * from './CashFlowTableRow';

// Smart Components (Refactored with Material UI)
export { CashFlowHeader } from './CashFlowHeader';
export { CashFlowTable } from './CashFlowTable';

// New Dashboard Components
export { MonthlyBudgetTable } from './MonthlyBudgetTable';
export { PaymentScheduleTable } from './PaymentScheduleTable';
export { AddPaymentScheduleDialog } from './AddPaymentScheduleDialog';

// Legacy components (keeping for backward compatibility)
export { CashFlowHeader as CashFlowHeaderOld } from './CashFlowHeader';
export { CashFlowTable as CashFlowTableOld } from './CashFlowTable';
