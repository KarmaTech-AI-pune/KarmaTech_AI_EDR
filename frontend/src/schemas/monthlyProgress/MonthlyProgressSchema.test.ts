import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  financialAndContractSchema,
  actualCostSchema,
  ctcAndEacSchema,
  scheduleSchema,
  BudgetRowSchema,
  BudgetTableSchema,
  manpowerSchema,
  manpowerPlanningSchema,
  deliverableSchema,
  progressDeliverableSchema,
  changeOrderSchema,
  programmeScheduleSchema,
  earlyWarningsSchema,
  lastMonthActionSchema,
  currentMonthActionSchema,
  MonthlyProgressSchema,
} from './MonthlyProgressSchema';

describe('MonthlyProgressSchema', () => {
  describe('financialAndContractSchema', () => {
    it('should validate a correct financial and contract object', () => {
      const data = {
        net: 1000,
        serviceTax: 10,
        feeTotal: 1100,
        budgetOdcs: 200,
        budgetStaff: 300,
        budgetSubTotal: 500,
        contractType: 'lumpsum',
      };
      expect(() => financialAndContractSchema.parse(data)).not.toThrow();
    });

    it('should allow null values for nullable fields', () => {
      const data = {
        net: null,
        serviceTax: null,
        feeTotal: null,
        budgetOdcs: null,
        budgetStaff: null,
        budgetSubTotal: null,
        contractType: 'timeAndExpense',
      };
      expect(() => financialAndContractSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid serviceTax (less than 0)', () => {
      const data = {
        net: 1000,
        serviceTax: -5,
        feeTotal: 1100,
        budgetOdcs: 200,
        budgetStaff: 300,
        budgetSubTotal: 500,
        contractType: 'lumpsum',
      };
      expect(() => financialAndContractSchema.parse(data)).toThrow(z.ZodError);
    });

    it('should reject invalid serviceTax (greater than 100)', () => {
      const data = {
        net: 1000,
        serviceTax: 101,
        feeTotal: 1100,
        budgetOdcs: 200,
        budgetStaff: 300,
        budgetSubTotal: 500,
        contractType: 'lumpsum',
      };
      expect(() => financialAndContractSchema.parse(data)).toThrow(z.ZodError);
    });

    it('should reject invalid contractType', () => {
      const data = {
        net: 1000,
        serviceTax: 10,
        feeTotal: 1100,
        budgetOdcs: 200,
        budgetStaff: 300,
        budgetSubTotal: 500,
        contractType: 'invalidType',
      };
      expect(() => financialAndContractSchema.parse(data)).toThrow(z.ZodError);
    });
  });

  describe('actualCostSchema', () => {
    it('should validate a correct actual cost object', () => {
      const data = {
        priorCumulativeOdc: 100,
        priorCumulativeStaff: 200,
        priorCumulativeTotal: 300,
        actualOdc: 50,
        actualStaff: 70,
        actualSubtotal: 120,
        totalCumulativeOdc: 150,
        totalCumulativeStaff: 270,
        totalCumulativeCost: 420,
      };
      expect(() => actualCostSchema.parse(data)).not.toThrow();
    });

    it('should allow null and optional fields', () => {
      const data = {
        priorCumulativeTotal: null,
        actualSubtotal: null,
        totalCumulativeOdc: null,
        totalCumulativeStaff: null,
        totalCumulativeCost: null,
      };
      expect(() => actualCostSchema.parse(data)).not.toThrow();
    });
  });

  describe('ctcAndEacSchema', () => {
    it('should validate a correct CTC and EAC object', () => {
      const data = {
        ctcODC: 100,
        ctcStaff: 200,
        ctcSubtotal: 300,
        actualctcODC: 50,
        actualCtcStaff: 70,
        actualCtcSubtotal: 120,
        eacOdc: 150,
        eacStaff: 270,
        totalEAC: 420,
        grossProfitPercentage: 20,
      };
      expect(() => ctcAndEacSchema.parse(data)).not.toThrow();
    });

    it('should allow null and optional fields', () => {
      const data = {
        ctcODC: null,
        ctcStaff: null,
        ctcSubtotal: null,
        actualctcODC: null,
        actualCtcStaff: null,
        actualCtcSubtotal: null, // Added this field
        eacOdc: null,
        eacStaff: null,
        totalEAC: null,
        grossProfitPercentage: null,
      };
      expect(() => ctcAndEacSchema.parse(data)).not.toThrow();
    });
  });

  describe('scheduleSchema', () => {
    it('should validate a correct schedule object', () => {
      const data = {
        dateOfIssueWOLOI: '01-01-2023',
        completionDateAsPerContract: '31-12-2023',
        completionDateAsPerExtension: '31-01-2024',
        expectedCompletionDate: '28-02-2024',
      };
      expect(() => scheduleSchema.parse(data)).not.toThrow();
    });

    it('should allow null values for date fields', () => {
      const data = {
        dateOfIssueWOLOI: null,
        completionDateAsPerContract: null,
        completionDateAsPerExtension: null,
        expectedCompletionDate: null,
      };
      expect(() => scheduleSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid date string format', () => {
      const data = {
        dateOfIssueWOLOI: '2023-01-01', // Invalid format (should be DD-MM-YYYY)
        completionDateAsPerContract: null,
        completionDateAsPerExtension: null,
        expectedCompletionDate: null,
      };
      expect(() => scheduleSchema.parse(data)).toThrow(z.ZodError);
    });
  });

  describe('BudgetRowSchema', () => {
    it('should validate a correct budget row', () => {
      const data = {
        revenueFee: 1000,
        cost: 800,
        profitPercentage: 20,
      };
      expect(() => BudgetRowSchema.parse(data)).not.toThrow();
    });

    it('should allow null values', () => {
      const data = {
        revenueFee: null,
        cost: null,
        profitPercentage: null,
      };
      expect(() => BudgetRowSchema.parse(data)).not.toThrow();
    });

    it('should reject negative revenueFee', () => {
      const data = {
        revenueFee: -100,
        cost: 800,
        profitPercentage: 20,
      };
      expect(() => BudgetRowSchema.parse(data)).toThrow(z.ZodError);
    });

    it('should reject negative cost', () => {
      const data = {
        revenueFee: 1000,
        cost: -800,
        profitPercentage: 20,
      };
      expect(() => BudgetRowSchema.parse(data)).toThrow(z.ZodError);
    });
  });

  describe('BudgetTableSchema', () => {
    it('should validate a correct budget table', () => {
      const data = {
        originalBudget: { revenueFee: 1000, cost: 800, profitPercentage: 20 },
        currentBudgetInMIS: { revenueFee: 1100, cost: 850, profitPercentage: 22.73 },
        percentCompleteOnCosts: { revenueFee: 50, cost: 60 },
      };
      expect(() => BudgetTableSchema.parse(data)).not.toThrow();
    });

    it('should allow nulls in nested schemas', () => {
      const data = {
        originalBudget: { revenueFee: null, cost: null, profitPercentage: null },
        currentBudgetInMIS: { revenueFee: null, cost: null, profitPercentage: null },
        percentCompleteOnCosts: { revenueFee: null, cost: null },
      };
      expect(() => BudgetTableSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid percentCompleteOnCosts (revenueFee > 100)', () => {
      const data = {
        originalBudget: { revenueFee: 1000, cost: 800, profitPercentage: 20 },
        currentBudgetInMIS: { revenueFee: 1100, cost: 850, profitPercentage: 22.73 },
        percentCompleteOnCosts: { revenueFee: 101, cost: 60 },
      };
      expect(() => BudgetTableSchema.parse(data)).toThrow(z.ZodError);
    });

    it('should reject invalid percentCompleteOnCosts (cost < 0)', () => {
      const data = {
        originalBudget: { revenueFee: 1000, cost: 800, profitPercentage: 20 },
        currentBudgetInMIS: { revenueFee: 1100, cost: 850, profitPercentage: 22.73 },
        percentCompleteOnCosts: { revenueFee: 50, cost: -10 },
      };
      expect(() => BudgetTableSchema.parse(data)).toThrow(z.ZodError);
    });
  });

  describe('manpowerSchema', () => {
    it('should validate a correct manpower entry', () => {
      const data = {
        workAssignment: 'Task A',
        assignee: 'John Doe',
        rate: 100,
        planned: 100,
        consumed: 50,
        approved: 40,
        extraHours: 10,
        extraCost: 1000,
        payment: 5000,
        balance: 50,
        nextMonthPlanning: 20,
        manpowerComments: 'Comments here',
      };
      expect(() => manpowerSchema.parse(data)).not.toThrow();
    });

    it('should allow null values', () => {
      const data = {
        workAssignment: null,
        assignee: null,
        rate: null,
        planned: null,
        consumed: null,
        approved: null,
        extraHours: null,
        extraCost: null,
        payment: null,
        balance: null,
        nextMonthPlanning: null,
        manpowerComments: null,
      };
      expect(() => manpowerSchema.parse(data)).not.toThrow();
    });
  });

  describe('manpowerPlanningSchema', () => {
    it('should validate a correct manpower planning object', () => {
      const data = {
        manpower: [
          { workAssignment: 'Task A', assignee: 'John', rate: 100, planned: 100, consumed: 50, approved: 40, extraHours: 10, extraCost: 1000, payment: 5000, balance: 50, nextMonthPlanning: 20, manpowerComments: '' },
          { workAssignment: 'Task B', assignee: 'Jane', rate: 120, planned: 80, consumed: 30, approved: 25, extraHours: 5, extraCost: 600, payment: 3600, balance: 50, nextMonthPlanning: 10, manpowerComments: '' },
        ],
        manpowerTotal: {
          plannedTotal: 180,
          consumedTotal: 80,
          approvedTotal: 65,
          extraHoursTotal: 15,
          extraCostTotal: 1600,
          paymentTotal: 8600,
          balanceTotal: 100,
          nextMonthPlanningTotal: 30,
        },
      };
      expect(() => manpowerPlanningSchema.parse(data)).not.toThrow();
    });

    it('should allow empty manpower array and null totals', () => {
      const data = {
        manpower: [],
        manpowerTotal: {
          plannedTotal: null,
          consumedTotal: null,
          approvedTotal: null,
          extraHoursTotal: null,
          extraCostTotal: null,
          paymentTotal: null,
          balanceTotal: null,
          nextMonthPlanningTotal: null,
        },
      };
      expect(() => manpowerPlanningSchema.parse(data)).not.toThrow();
    });
  });

  describe('deliverableSchema', () => {
    it('should validate a correct deliverable entry', () => {
      const data = {
        milestone: 'Milestone 1',
        dueDateContract: '30-06-2023',
        dueDatePlanned: '25-06-2023',
        achievedDate: '28-06-2023',
        paymentDue: 5000,
        invoiceDate: '01-07-2023',
        paymentReceivedDate: '15-07-2023',
        deliverableComments: 'Completed on time',
      };
      expect(() => deliverableSchema.parse(data)).not.toThrow();
    });

    it('should allow null values', () => {
      const data = {
        milestone: null,
        dueDateContract: null,
        dueDatePlanned: null,
        achievedDate: null,
        paymentDue: null,
        invoiceDate: null,
        paymentReceivedDate: null,
        deliverableComments: null,
      };
      expect(() => deliverableSchema.parse(data)).not.toThrow();
    });
  });

  describe('progressDeliverableSchema', () => {
    it('should validate a correct progress deliverable object', () => {
      const data = {
        deliverables: [
          { milestone: 'M1', dueDateContract: '01-01-2023', dueDatePlanned: '01-01-2023', achievedDate: '01-01-2023', paymentDue: 100, invoiceDate: '01-01-2023', paymentReceivedDate: '01-01-2023', deliverableComments: '' },
        ],
        totalPaymentDue: 100,
      };
      expect(() => progressDeliverableSchema.parse(data)).not.toThrow();
    });

    it('should allow empty deliverables array and null total', () => {
      const data = {
        deliverables: [],
        totalPaymentDue: null,
      };
      expect(() => progressDeliverableSchema.parse(data)).not.toThrow();
    });
  });

  describe('changeOrderSchema', () => {
    it('should validate a correct change order entry', () => {
      const data = {
        contractTotal: 1000,
        cost: 200,
        fee: 300,
        summaryDetails: 'Change order details',
        status: 'Approved',
      };
      expect(() => changeOrderSchema.parse(data)).not.toThrow();
    });

    it('should allow null values', () => {
      const data = {
        contractTotal: null,
        cost: null,
        fee: null,
        summaryDetails: null,
        status: null,
      };
      expect(() => changeOrderSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid status', () => {
      const data = {
        contractTotal: 1000,
        cost: 200,
        fee: 300,
        summaryDetails: 'Change order details',
        status: 'InvalidStatus',
      };
      expect(() => changeOrderSchema.parse(data)).toThrow(z.ZodError);
    });
  });

  describe('programmeScheduleSchema', () => {
    it('should validate a correct programme schedule entry', () => {
      const data = {
        programmeDescription: 'Description of programme schedule',
      };
      expect(() => programmeScheduleSchema.parse(data)).not.toThrow();
    });

    it('should allow null programmeDescription', () => {
      const data = {
        programmeDescription: null,
      };
      expect(() => programmeScheduleSchema.parse(data)).not.toThrow();
    });
  });

  describe('earlyWarningsSchema', () => {
    it('should validate a correct early warnings entry', () => {
      const data = {
        warningsDescription: 'Description of early warning',
      };
      expect(() => earlyWarningsSchema.parse(data)).not.toThrow();
    });

    it('should allow null warningsDescription', () => {
      const data = {
        warningsDescription: null,
      };
      expect(() => earlyWarningsSchema.parse(data)).not.toThrow();
    });
  });

  describe('lastMonthActionSchema', () => {
    it('should validate a correct last month action entry', () => {
      const data = {
        actions: 'Action taken last month',
        date: '31-07-2023',
        comments: 'Comments on action',
      };
      expect(() => lastMonthActionSchema.parse(data)).not.toThrow();
    });

    it('should allow null values', () => {
      const data = {
        actions: null,
        date: null,
        comments: null,
      };
      expect(() => lastMonthActionSchema.parse(data)).not.toThrow();
    });
  });

  describe('currentMonthActionSchema', () => {
    it('should validate a correct current month action entry', () => {
      const data = {
        actions: 'Action for current month',
        date: '15-08-2023',
        comments: 'Comments on current action',
        priority: 'H',
      };
      expect(() => currentMonthActionSchema.parse(data)).not.toThrow();
    });

    it('should allow null values', () => {
      const data = {
        actions: null,
        date: null,
        comments: null,
        priority: null,
      };
      expect(() => currentMonthActionSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid priority', () => {
      const data = {
        actions: 'Action for current month',
        date: '15-08-2023',
        comments: 'Comments on current action',
        priority: 'X',
      };
      expect(() => currentMonthActionSchema.parse(data)).toThrow(z.ZodError);
    });
  });

  describe('MonthlyProgressSchema', () => {
    it('should validate a complete MonthlyProgress object', () => {
      const data = {
        financialAndContractDetails: {
          net: 1000, serviceTax: 10, feeTotal: 1100, budgetOdcs: 200, budgetStaff: 300, budgetSubTotal: 500, contractType: 'lumpsum',
        },
        actualCost: {
          priorCumulativeTotal: 300, actualSubtotal: 120, totalCumulativeOdc: 150, totalCumulativeStaff: 270, totalCumulativeCost: 420,
        },
        ctcAndEac: {
          ctcODC: 100, ctcStaff: 200, ctcSubtotal: 300, actualctcODC: null, actualCtcStaff: null, actualCtcSubtotal: 120, eacOdc: 150, eacStaff: 270, totalEAC: 420, grossProfitPercentage: 20,
        },
        schedule: {
          dateOfIssueWOLOI: '01-01-2023', completionDateAsPerContract: '31-12-2023', completionDateAsPerExtension: null, expectedCompletionDate: null,
        },
        budgetTable: {
          originalBudget: { revenueFee: 1000, cost: 800, profitPercentage: 20 },
          currentBudgetInMIS: { revenueFee: 1100, cost: 850, profitPercentage: 22.73 },
          percentCompleteOnCosts: { revenueFee: 50, cost: 60 },
        },
        manpowerPlanning: {
          manpower: [{ workAssignment: 'Task A', assignee: 'John', rate: 100, planned: 100, consumed: 50, approved: 40, extraHours: 10, extraCost: 1000, payment: 5000, balance: 50, nextMonthPlanning: 20, manpowerComments: '' }],
          manpowerTotal: { plannedTotal: 100, consumedTotal: 50, approvedTotal: 40, extraHoursTotal: 10, extraCostTotal: 1000, paymentTotal: 5000, balanceTotal: 50, nextMonthPlanningTotal: 20 },
        },
        progressDeliverable: {
          deliverables: [{ milestone: 'M1', dueDateContract: '01-01-2023', dueDatePlanned: '01-01-2023', achievedDate: '01-01-2023', paymentDue: 100, invoiceDate: '01-01-2023', paymentReceivedDate: '01-01-2023', deliverableComments: '' }],
          totalPaymentDue: 100,
        },
        changeOrder: [{
          contractTotal: 1000, cost: 200, fee: 300, summaryDetails: 'Details', status: 'Approved',
        }],
        programmeSchedule: [{ programmeDescription: 'Programme details' }],
        earlyWarnings: [{ warningsDescription: 'Warning details' }],
        lastMonthActions: [{ actions: 'Action 1', date: '31-07-2023', comments: 'Comment 1' }],
        currentMonthActions: [{ actions: 'Action 2', date: '15-08-2023', comments: 'Comment 2', priority: 'H' }],
      };
      expect(() => MonthlyProgressSchema.parse(data)).not.toThrow();
    });

    it('should allow minimal valid data', () => {
      const data = {
        financialAndContractDetails: {
          net: null, serviceTax: null, feeTotal: null, budgetOdcs: null, budgetStaff: null, budgetSubTotal: null, contractType: 'lumpsum',
        },
        actualCost: {
          priorCumulativeTotal: null, actualSubtotal: null, totalCumulativeOdc: null, totalCumulativeStaff: null, totalCumulativeCost: null,
        },
        ctcAndEac: {
          ctcODC: null, ctcStaff: null, ctcSubtotal: null, actualctcODC: null, actualCtcStaff: null, actualCtcSubtotal: null, eacOdc: null, eacStaff: null, totalEAC: null, grossProfitPercentage: null,
        },
        schedule: {
          dateOfIssueWOLOI: null, completionDateAsPerContract: null, completionDateAsPerExtension: null, expectedCompletionDate: null,
        },
        budgetTable: {
          originalBudget: { revenueFee: null, cost: null, profitPercentage: null },
          currentBudgetInMIS: { revenueFee: null, cost: null, profitPercentage: null },
          percentCompleteOnCosts: { revenueFee: null, cost: null },
        },
        manpowerPlanning: {
          manpower: [],
          manpowerTotal: { plannedTotal: null, consumedTotal: null, approvedTotal: null, extraHoursTotal: null, extraCostTotal: null, paymentTotal: null, balanceTotal: null, nextMonthPlanningTotal: null },
        },
        progressDeliverable: {
          deliverables: [],
          totalPaymentDue: null,
        },
        changeOrder: [],
        programmeSchedule: [],
        earlyWarnings: [],
        lastMonthActions: [],
        currentMonthActions: [],
      };
      expect(() => MonthlyProgressSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid nested data (e.g., invalid serviceTax)', () => {
      const data = {
        financialAndContractDetails: {
          net: 1000, serviceTax: 101, feeTotal: 1100, budgetOdcs: 200, budgetStaff: 300, budgetSubTotal: 500, contractType: 'lumpsum',
        },
        actualCost: {
          priorCumulativeTotal: 300, actualSubtotal: 120, totalCumulativeOdc: 150, totalCumulativeStaff: 270, totalCumulativeCost: 420,
        },
        ctcAndEac: {
          ctcODC: 100, ctcStaff: 200, ctcSubtotal: 300, actualctcODC: null, actualCtcStaff: null, actualCtcSubtotal: 120, eacOdc: 150, eacStaff: 270, totalEAC: 420, grossProfitPercentage: 20,
        },
        schedule: {
          dateOfIssueWOLOI: '2023-01-01', completionDateAsPerContract: '2023-12-31', completionDateAsPerExtension: null, expectedCompletionDate: null,
        },
        budgetTable: {
          originalBudget: { revenueFee: 1000, cost: 800, profitPercentage: 20 },
          currentBudgetInMIS: { revenueFee: 1100, cost: 850, profitPercentage: 22.73 },
          percentCompleteOnCosts: { revenueFee: 50, cost: 60 },
        },
        manpowerPlanning: {
          manpower: [{ workAssignment: 'Task A', assignee: 'John', planned: 100, consumed: 50, balance: 50, nextMonthPlanning: 20, manpowerComments: '' }],
          manpowerTotal: { plannedTotal: 100, consumedTotal: 50, balanceTotal: 50, nextMonthPlanningTotal: 20 },
        },
        progressDeliverable: {
          deliverables: [{ milestone: 'M1', dueDateContract: '2023-01-01', dueDatePlanned: '2023-01-01', achievedDate: '2023-01-01', paymentDue: 100, invoiceDate: '2023-01-01', paymentReceivedDate: '2023-01-01', deliverableComments: '' }],
          totalPaymentDue: 100,
        },
        changeOrder: [{
          contractTotal: 1000, cost: 200, fee: 300, summaryDetails: 'Details', status: 'Approved',
        }],
        programmeSchedule: [{ programmeDescription: 'Programme details' }],
        earlyWarnings: [{ warningsDescription: 'Warning details' }],
        lastMonthActions: [{ actions: 'Action 1', date: '2023-07-31', comments: 'Comment 1' }],
        currentMonthActions: [{ actions: 'Action 2', date: '2023-08-15', comments: 'Comment 2', priority: 'H' }],
      };
      expect(() => MonthlyProgressSchema.parse(data)).toThrow(z.ZodError);
    });
  });
});
