/**
 * Unit Tests for Monthly Review Model
 * 
 * Tests interfaces, types, and initial data for monthly review functionality.
 * Ensures proper TypeScript compilation and data structure constraints.
 */

import { describe, it, expect } from 'vitest';
import type { 
  ManpowerWorkItem,
  ChangeOrderItem,
  ActionItem,
  DeliverableItem,
  MonthlyReviewModel
} from './monthlyReviewModel';
import { initialManpowerData, initialFormState } from './monthlyReviewModel';

describe('Monthly Review Model', () => {
  describe('ManpowerWorkItem Interface', () => {
    it('should accept valid manpower work item object', () => {
      // Arrange
      const workItem: ManpowerWorkItem = {
        workAssignment: 'Frontend Development',
        assignee: ['John Doe', 'Jane Smith'],
        planned: 40,
        consumed: 35,
        balance: 5,
        nextMonthPlanning: 20,
        comments: 'On track'
      };

      // Assert
      expect(workItem.workAssignment).toBe('Frontend Development');
      expect(workItem.assignee).toEqual(['John Doe', 'Jane Smith']);
      expect(workItem.planned).toBe(40);
      expect(workItem.consumed).toBe(35);
      expect(workItem.balance).toBe(5);
      expect(workItem.nextMonthPlanning).toBe(20);
      expect(workItem.comments).toBe('On track');
    });

    it('should handle null numeric values', () => {
      // Arrange
      const workItem: ManpowerWorkItem = {
        workAssignment: 'Research',
        assignee: ['Researcher'],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: 'TBD'
      };

      // Assert
      expect(workItem.planned).toBeNull();
      expect(workItem.consumed).toBeNull();
      expect(workItem.balance).toBeNull();
      expect(workItem.nextMonthPlanning).toBeNull();
    });

    it('should support multiple assignees', () => {
      // Arrange
      const workItem: ManpowerWorkItem = {
        workAssignment: 'Team Project',
        assignee: ['Dev1', 'Dev2', 'Dev3', 'QA1'],
        planned: 160,
        consumed: 120,
        balance: 40,
        nextMonthPlanning: 80,
        comments: 'Team effort'
      };

      // Assert
      expect(workItem.assignee).toHaveLength(4);
      expect(workItem.assignee).toContain('Dev1');
      expect(workItem.assignee).toContain('QA1');
    });
  });

  describe('ChangeOrderItem Interface', () => {
    it('should accept valid change order item object', () => {
      // Arrange
      const changeOrder: ChangeOrderItem = {
        contractTotal: 100000,
        cost: 85000,
        fee: 15000,
        summaryDetails: 'Additional scope for mobile app',
        status: 'Approved'
      };

      // Assert
      expect(changeOrder.contractTotal).toBe(100000);
      expect(changeOrder.cost).toBe(85000);
      expect(changeOrder.fee).toBe(15000);
      expect(changeOrder.summaryDetails).toBe('Additional scope for mobile app');
      expect(changeOrder.status).toBe('Approved');
    });

    it('should support all status values', () => {
      // Arrange
      const statuses: ChangeOrderItem['status'][] = ['Proposed', 'Submitted', 'Approved'];

      // Act & Assert
      statuses.forEach(status => {
        const changeOrder: ChangeOrderItem = {
          contractTotal: 50000,
          cost: 40000,
          fee: 10000,
          summaryDetails: `Change order with ${status} status`,
          status: status
        };
        expect(changeOrder.status).toBe(status);
      });
    });

    it('should handle null financial values', () => {
      // Arrange
      const changeOrder: ChangeOrderItem = {
        contractTotal: null,
        cost: null,
        fee: null,
        summaryDetails: 'Pending financial details',
        status: 'Proposed'
      };

      // Assert
      expect(changeOrder.contractTotal).toBeNull();
      expect(changeOrder.cost).toBeNull();
      expect(changeOrder.fee).toBeNull();
    });
  });

  describe('ActionItem Interface', () => {
    it('should accept valid action item object', () => {
      // Arrange
      const actionItem: ActionItem = {
        description: 'Complete user testing',
        date: '2024-01-15',
        comments: 'Focus on mobile experience',
        priority: 'H'
      };

      // Assert
      expect(actionItem.description).toBe('Complete user testing');
      expect(actionItem.date).toBe('2024-01-15');
      expect(actionItem.comments).toBe('Focus on mobile experience');
      expect(actionItem.priority).toBe('H');
    });

    it('should support all priority values', () => {
      // Arrange
      const priorities: ActionItem['priority'][] = ['H', 'M', 'L'];

      // Act & Assert
      priorities.forEach(priority => {
        const actionItem: ActionItem = {
          description: `${priority} priority task`,
          date: '2024-01-15',
          comments: 'Test priority',
          priority: priority
        };
        expect(actionItem.priority).toBe(priority);
      });
    });

    it('should handle optional priority', () => {
      // Arrange
      const actionItem: ActionItem = {
        description: 'Task without priority',
        date: '2024-01-15',
        comments: 'No priority set'
      };

      // Assert
      expect(actionItem.priority).toBeUndefined();
    });
  });

  describe('DeliverableItem Interface', () => {
    it('should accept valid deliverable item object', () => {
      // Arrange
      const deliverable: DeliverableItem = {
        milestone: 'Phase 1 Completion',
        dueDateContract: '2024-03-31',
        dueDatePlanned: '2024-03-25',
        achievedDate: '2024-03-20',
        paymentDue: 25000,
        invoiceDate: '2024-03-21',
        paymentReceivedDate: '2024-04-05',
        comments: 'Delivered ahead of schedule'
      };

      // Assert
      expect(deliverable.milestone).toBe('Phase 1 Completion');
      expect(deliverable.dueDateContract).toBe('2024-03-31');
      expect(deliverable.dueDatePlanned).toBe('2024-03-25');
      expect(deliverable.achievedDate).toBe('2024-03-20');
      expect(deliverable.paymentDue).toBe(25000);
      expect(deliverable.invoiceDate).toBe('2024-03-21');
      expect(deliverable.paymentReceivedDate).toBe('2024-04-05');
      expect(deliverable.comments).toBe('Delivered ahead of schedule');
    });

    it('should handle null payment due', () => {
      // Arrange
      const deliverable: DeliverableItem = {
        milestone: 'Documentation',
        dueDateContract: '2024-02-28',
        dueDatePlanned: '2024-02-28',
        achievedDate: '2024-02-25',
        paymentDue: null,
        invoiceDate: '',
        paymentReceivedDate: '',
        comments: 'No payment associated'
      };

      // Assert
      expect(deliverable.paymentDue).toBeNull();
    });
  });

  describe('MonthlyReviewModel Interface', () => {
    it('should accept valid monthly review model object', () => {
      // Arrange
      const monthlyReview: MonthlyReviewModel = {
        fees: { net: 50000, serviceTax: 9000, total: 59000 },
        budgetCosts: { odcs: 10000, staff: 35000, subTotal: 45000 },
        contractType: { lumpsum: true, tAndE: false, percentage: null },
        actualCosts: { odcs: 8000, staff: 32000, subtotal: 40000 },
        accruals: 2000,
        costsToComplete: { odcs: 2000, staff: 8000, subtotal: 10000 },
        totalEACEstimate: 52000,
        grossProfitPercentage: 15.5,
        budgetComparison: {
          originalBudget: { revenue: 60000, cost: 45000, profit: 15000 },
          currentBudget: { revenue: 59000, cost: 50000, profit: 9000 }
        },
        completion: { percentCompleteOnCosts: 80, percentCompleteOnEV: 75 },
        schedule: {
          dateOfIssueWOLOI: '2024-01-01',
          completionDateAsPerContract: '2024-06-30',
          completionDateAsPerExtension: '2024-07-15',
          expectedCompletionDate: '2024-07-10',
          spi: 0.95
        },
        manpowerPlanning: [],
        changeOrders: { proposed: [], submitted: [], approved: [] },
        lastMonthActions: [],
        currentMonthActions: [],
        deliverables: []
      };

      // Assert
      expect(monthlyReview.fees.total).toBe(59000);
      expect(monthlyReview.contractType.lumpsum).toBe(true);
      expect(monthlyReview.grossProfitPercentage).toBe(15.5);
      expect(monthlyReview.completion.percentCompleteOnCosts).toBe(80);
    });

    it('should handle contract type variations', () => {
      // Arrange
      const lumpsumContract: MonthlyReviewModel['contractType'] = {
        lumpsum: true,
        tAndE: false,
        percentage: null
      };

      const tAndEContract: MonthlyReviewModel['contractType'] = {
        lumpsum: false,
        tAndE: true,
        percentage: null
      };

      const percentageContract: MonthlyReviewModel['contractType'] = {
        lumpsum: false,
        tAndE: false,
        percentage: 15.5
      };

      // Assert
      expect(lumpsumContract.lumpsum).toBe(true);
      expect(tAndEContract.tAndE).toBe(true);
      expect(percentageContract.percentage).toBe(15.5);
    });

    it('should support budget comparison calculations', () => {
      // Arrange
      const budgetComparison: MonthlyReviewModel['budgetComparison'] = {
        originalBudget: { revenue: 100000, cost: 80000, profit: 20000 },
        currentBudget: { revenue: 95000, cost: 85000, profit: 10000 }
      };

      // Act
      const revenueVariance = (budgetComparison.currentBudget.revenue || 0) - (budgetComparison.originalBudget.revenue || 0);
      const profitVariance = (budgetComparison.currentBudget.profit || 0) - (budgetComparison.originalBudget.profit || 0);

      // Assert
      expect(revenueVariance).toBe(-5000);
      expect(profitVariance).toBe(-10000);
    });
  });

  describe('Initial Data', () => {
    it('should have valid initial manpower data', () => {
      // Assert
      expect(initialManpowerData).toHaveLength(8);
      expect(initialManpowerData[0].workAssignment).toBe('Topographical Survey');
      expect(initialManpowerData[0].assignee).toEqual(['Lavisha Surveyor']);
      expect(initialManpowerData[2].assignee).toHaveLength(3);
      
      // All initial values should be null for numeric fields
      initialManpowerData.forEach(item => {
        expect(item.planned).toBeNull();
        expect(item.consumed).toBeNull();
        expect(item.balance).toBeNull();
        expect(item.nextMonthPlanning).toBeNull();
      });
    });

    it('should have valid initial form state', () => {
      // Assert
      expect(initialFormState.fees.net).toBeNull();
      expect(initialFormState.contractType.lumpsum).toBe(false);
      expect(initialFormState.contractType.tAndE).toBe(false);
      expect(initialFormState.manpowerPlanning).toEqual(initialManpowerData);
      expect(initialFormState.lastMonthActions).toHaveLength(3);
      expect(initialFormState.currentMonthActions).toHaveLength(3);
      expect(initialFormState.deliverables).toHaveLength(1);
    });

    it('should have proper action items structure in initial state', () => {
      // Assert
      expect(initialFormState.lastMonthActions[0].description).toContain('MCGM');
      expect(initialFormState.currentMonthActions[0].priority).toBe('H');
      expect(initialFormState.currentMonthActions[0].date).toBe('8/10/15');
      
      // Last month actions should have undefined priority
      initialFormState.lastMonthActions.forEach(action => {
        expect(action.priority).toBeUndefined();
      });
    });

    it('should have proper change orders structure', () => {
      // Assert
      expect(initialFormState.changeOrders.proposed).toEqual([]);
      expect(initialFormState.changeOrders.submitted).toEqual([]);
      expect(initialFormState.changeOrders.approved).toEqual([]);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize monthly review model correctly', () => {
      // Arrange
      const original: MonthlyReviewModel = {
        fees: { net: 10000, serviceTax: 1800, total: 11800 },
        budgetCosts: { odcs: 2000, staff: 7000, subTotal: 9000 },
        contractType: { lumpsum: false, tAndE: true, percentage: null },
        actualCosts: { odcs: 1800, staff: 6500, subtotal: 8300 },
        accruals: 500,
        costsToComplete: { odcs: 200, staff: 1000, subtotal: 1200 },
        totalEACEstimate: 9500,
        grossProfitPercentage: 19.5,
        budgetComparison: {
          originalBudget: { revenue: 12000, cost: 9000, profit: 3000 },
          currentBudget: { revenue: 11800, cost: 9500, profit: 2300 }
        },
        completion: { percentCompleteOnCosts: 87, percentCompleteOnEV: 85 },
        schedule: {
          dateOfIssueWOLOI: '2024-01-01',
          completionDateAsPerContract: '2024-03-31',
          completionDateAsPerExtension: '2024-04-15',
          expectedCompletionDate: '2024-04-10',
          spi: 1.05
        },
        manpowerPlanning: [
          {
            workAssignment: 'Testing',
            assignee: ['Tester1'],
            planned: 20,
            consumed: 18,
            balance: 2,
            nextMonthPlanning: 5,
            comments: 'Almost done'
          }
        ],
        changeOrders: {
          proposed: [{ contractTotal: 5000, cost: 4000, fee: 1000, summaryDetails: 'Extra feature', status: 'Proposed' }],
          submitted: [],
          approved: []
        },
        lastMonthActions: [{ description: 'Review', date: '2024-01-15', comments: 'Done' }],
        currentMonthActions: [{ description: 'Deploy', date: '2024-02-01', comments: 'In progress', priority: 'H' }],
        deliverables: [
          {
            milestone: 'Beta', dueDateContract: '2024-02-28', dueDatePlanned: '2024-02-25',
            achievedDate: '2024-02-20', paymentDue: 5000, invoiceDate: '2024-02-21',
            paymentReceivedDate: '2024-03-05', comments: 'Early delivery'
          }
        ]
      };

      // Act
      const serialized = JSON.stringify(original);
      const deserialized: MonthlyReviewModel = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(original);
      expect(typeof deserialized.fees.net).toBe('number');
      expect(typeof deserialized.contractType.lumpsum).toBe('boolean');
      expect(Array.isArray(deserialized.manpowerPlanning)).toBe(true);
    });
  });
});