/**
 * Unit Tests for Types Model
 * 
 * Tests various enums used across the application.
 * Ensures proper TypeScript compilation and enum constraints.
 */

import { describe, it, expect } from 'vitest';
import { 
  GoNoGoStatus, 
  TypeOfBid, 
  WorkflowStatus, 
  GoNoGoVersionStatus, 
  ProjectStatus 
} from './types';

describe('Types Model', () => {
  describe('GoNoGoStatus Enum', () => {
    it('should have correct numeric enum values', () => {
      // Assert
      expect(GoNoGoStatus.Red).toBe(0);
      expect(GoNoGoStatus.Amber).toBe(1);
      expect(GoNoGoStatus.Green).toBe(2);
    });

    it('should support status comparison', () => {
      // Assert
      expect(GoNoGoStatus.Red).toBeLessThan(GoNoGoStatus.Amber);
      expect(GoNoGoStatus.Amber).toBeLessThan(GoNoGoStatus.Green);
      expect(GoNoGoStatus.Green).toBeGreaterThan(GoNoGoStatus.Red);
    });

    it('should support status categorization', () => {
      // Arrange
      const riskStatuses = [GoNoGoStatus.Red, GoNoGoStatus.Amber];
      const safeStatuses = [GoNoGoStatus.Green];

      // Act
      const isRiskStatus = (status: GoNoGoStatus) => riskStatuses.includes(status);
      const isSafeStatus = (status: GoNoGoStatus) => safeStatuses.includes(status);

      // Assert
      expect(isRiskStatus(GoNoGoStatus.Red)).toBe(true);
      expect(isRiskStatus(GoNoGoStatus.Amber)).toBe(true);
      expect(isRiskStatus(GoNoGoStatus.Green)).toBe(false);
      expect(isSafeStatus(GoNoGoStatus.Green)).toBe(true);
      expect(isSafeStatus(GoNoGoStatus.Red)).toBe(false);
    });
  });

  describe('TypeOfBid Enum', () => {
    it('should have correct numeric enum values', () => {
      // Assert
      expect(TypeOfBid.Lumpsum).toBe(0);
      expect(TypeOfBid.TimeAndExpense).toBe(1);
      expect(TypeOfBid.Percentage).toBe(2);
    });

    it('should support bid type filtering', () => {
      // Arrange
      const fixedPriceBids = [TypeOfBid.Lumpsum, TypeOfBid.Percentage];
      const variablePriceBids = [TypeOfBid.TimeAndExpense];

      // Act
      const isFixedPrice = (bidType: TypeOfBid) => fixedPriceBids.includes(bidType);
      const isVariablePrice = (bidType: TypeOfBid) => variablePriceBids.includes(bidType);

      // Assert
      expect(isFixedPrice(TypeOfBid.Lumpsum)).toBe(true);
      expect(isFixedPrice(TypeOfBid.Percentage)).toBe(true);
      expect(isFixedPrice(TypeOfBid.TimeAndExpense)).toBe(false);
      expect(isVariablePrice(TypeOfBid.TimeAndExpense)).toBe(true);
      expect(isVariablePrice(TypeOfBid.Lumpsum)).toBe(false);
    });

    it('should support enum iteration', () => {
      // Arrange
      const allBidTypes = Object.values(TypeOfBid).filter(value => typeof value === 'number');

      // Assert
      expect(allBidTypes).toHaveLength(3);
      expect(allBidTypes).toContain(TypeOfBid.Lumpsum);
      expect(allBidTypes).toContain(TypeOfBid.TimeAndExpense);
      expect(allBidTypes).toContain(TypeOfBid.Percentage);
    });
  });

  describe('WorkflowStatus Enum', () => {
    it('should have correct string enum values', () => {
      // Assert
      expect(WorkflowStatus.Initiated).toBe('Initiated');
      expect(WorkflowStatus.InProgress).toBe('InProgress');
      expect(WorkflowStatus.UnderReview).toBe('UnderReview');
      expect(WorkflowStatus.Approved).toBe('Approved');
      expect(WorkflowStatus.Rejected).toBe('Rejected');
      expect(WorkflowStatus.Completed).toBe('Completed');
    });

    it('should support workflow progression logic', () => {
      // Arrange
      const activeStatuses = [
        WorkflowStatus.Initiated,
        WorkflowStatus.InProgress,
        WorkflowStatus.UnderReview
      ];
      const finalStatuses = [
        WorkflowStatus.Approved,
        WorkflowStatus.Rejected,
        WorkflowStatus.Completed
      ];

      // Act
      const isActive = (status: WorkflowStatus) => activeStatuses.includes(status);
      const isFinal = (status: WorkflowStatus) => finalStatuses.includes(status);

      // Assert
      expect(isActive(WorkflowStatus.InProgress)).toBe(true);
      expect(isActive(WorkflowStatus.Completed)).toBe(false);
      expect(isFinal(WorkflowStatus.Approved)).toBe(true);
      expect(isFinal(WorkflowStatus.Initiated)).toBe(false);
    });

    it('should support status transitions', () => {
      // Arrange
      const validTransitions = new Map([
        [WorkflowStatus.Initiated, [WorkflowStatus.InProgress]],
        [WorkflowStatus.InProgress, [WorkflowStatus.UnderReview, WorkflowStatus.Rejected]],
        [WorkflowStatus.UnderReview, [WorkflowStatus.Approved, WorkflowStatus.Rejected]],
        [WorkflowStatus.Approved, [WorkflowStatus.Completed]],
        [WorkflowStatus.Rejected, []],
        [WorkflowStatus.Completed, []]
      ]);

      // Act
      const canTransition = (from: WorkflowStatus, to: WorkflowStatus) => {
        const allowedTransitions = validTransitions.get(from) || [];
        return allowedTransitions.includes(to);
      };

      // Assert
      expect(canTransition(WorkflowStatus.Initiated, WorkflowStatus.InProgress)).toBe(true);
      expect(canTransition(WorkflowStatus.Initiated, WorkflowStatus.Completed)).toBe(false);
      expect(canTransition(WorkflowStatus.UnderReview, WorkflowStatus.Approved)).toBe(true);
      expect(canTransition(WorkflowStatus.Completed, WorkflowStatus.InProgress)).toBe(false);
    });
  });

  describe('GoNoGoVersionStatus Enum', () => {
    it('should have correct string enum values', () => {
      // Assert
      expect(GoNoGoVersionStatus.BDM_PENDING).toBe('BDM_PENDING');
      expect(GoNoGoVersionStatus.BDM_APPROVED).toBe('BDM_APPROVED');
      expect(GoNoGoVersionStatus.RM_PENDING).toBe('RM_PENDING');
      expect(GoNoGoVersionStatus.RM_APPROVED).toBe('RM_APPROVED');
      expect(GoNoGoVersionStatus.RD_PENDING).toBe('RD_PENDING');
      expect(GoNoGoVersionStatus.RD_APPROVED).toBe('RD_APPROVED');
      expect(GoNoGoVersionStatus.COMPLETED).toBe('COMPLETED');
    });

    it('should support role-based status filtering', () => {
      // Arrange
      const bdmStatuses = [GoNoGoVersionStatus.BDM_PENDING, GoNoGoVersionStatus.BDM_APPROVED];
      const rmStatuses = [GoNoGoVersionStatus.RM_PENDING, GoNoGoVersionStatus.RM_APPROVED];
      const rdStatuses = [GoNoGoVersionStatus.RD_PENDING, GoNoGoVersionStatus.RD_APPROVED];

      // Act
      const isBDMStatus = (status: GoNoGoVersionStatus) => bdmStatuses.includes(status);
      const isRMStatus = (status: GoNoGoVersionStatus) => rmStatuses.includes(status);
      const isRDStatus = (status: GoNoGoVersionStatus) => rdStatuses.includes(status);

      // Assert
      expect(isBDMStatus(GoNoGoVersionStatus.BDM_PENDING)).toBe(true);
      expect(isBDMStatus(GoNoGoVersionStatus.RM_PENDING)).toBe(false);
      expect(isRMStatus(GoNoGoVersionStatus.RM_APPROVED)).toBe(true);
      expect(isRDStatus(GoNoGoVersionStatus.RD_PENDING)).toBe(true);
    });

    it('should support approval workflow progression', () => {
      // Arrange
      const approvalOrder = [
        GoNoGoVersionStatus.BDM_PENDING,
        GoNoGoVersionStatus.BDM_APPROVED,
        GoNoGoVersionStatus.RM_PENDING,
        GoNoGoVersionStatus.RM_APPROVED,
        GoNoGoVersionStatus.RD_PENDING,
        GoNoGoVersionStatus.RD_APPROVED,
        GoNoGoVersionStatus.COMPLETED
      ];

      // Act
      const getNextStatus = (currentStatus: GoNoGoVersionStatus) => {
        const currentIndex = approvalOrder.indexOf(currentStatus);
        return currentIndex < approvalOrder.length - 1 ? approvalOrder[currentIndex + 1] : null;
      };

      // Assert
      expect(getNextStatus(GoNoGoVersionStatus.BDM_PENDING)).toBe(GoNoGoVersionStatus.BDM_APPROVED);
      expect(getNextStatus(GoNoGoVersionStatus.RM_APPROVED)).toBe(GoNoGoVersionStatus.RD_PENDING);
      expect(getNextStatus(GoNoGoVersionStatus.COMPLETED)).toBeNull();
    });
  });

  describe('ProjectStatus Enum', () => {
    it('should have correct numeric enum values', () => {
      // Assert
      expect(ProjectStatus.Opportunity).toBe(0);
      expect(ProjectStatus.InProgress).toBe(1);
      expect(ProjectStatus.OnHold).toBe(2);
      expect(ProjectStatus.Completed).toBe(3);
      expect(ProjectStatus.Cancelled).toBe(4);
    });

    it('should support project lifecycle management', () => {
      // Arrange
      const activeStatuses = [ProjectStatus.Opportunity, ProjectStatus.InProgress];
      const pausedStatuses = [ProjectStatus.OnHold];
      const finalStatuses = [ProjectStatus.Completed, ProjectStatus.Cancelled];

      // Act
      const isActive = (status: ProjectStatus) => activeStatuses.includes(status);
      const isPaused = (status: ProjectStatus) => pausedStatuses.includes(status);
      const isFinal = (status: ProjectStatus) => finalStatuses.includes(status);

      // Assert
      expect(isActive(ProjectStatus.InProgress)).toBe(true);
      expect(isActive(ProjectStatus.Completed)).toBe(false);
      expect(isPaused(ProjectStatus.OnHold)).toBe(true);
      expect(isFinal(ProjectStatus.Completed)).toBe(true);
      expect(isFinal(ProjectStatus.Cancelled)).toBe(true);
      expect(isFinal(ProjectStatus.InProgress)).toBe(false);
    });

    it('should support status ordering', () => {
      // Arrange
      const projects = [
        { id: 1, status: ProjectStatus.Completed },
        { id: 2, status: ProjectStatus.Opportunity },
        { id: 3, status: ProjectStatus.InProgress }
      ];

      // Act
      const sortedByStatus = projects.sort((a, b) => a.status - b.status);

      // Assert
      expect(sortedByStatus[0].status).toBe(ProjectStatus.Opportunity);
      expect(sortedByStatus[1].status).toBe(ProjectStatus.InProgress);
      expect(sortedByStatus[2].status).toBe(ProjectStatus.Completed);
    });
  });

  describe('Enum Interoperability', () => {
    it('should handle enum value comparisons', () => {
      // Arrange
      const goNoGoGreen = GoNoGoStatus.Green;
      const projectInProgress = ProjectStatus.InProgress;

      // Assert
      expect(goNoGoGreen).toBe(2);
      expect(projectInProgress).toBe(1);
      expect(goNoGoGreen).toBeGreaterThan(projectInProgress);
    });

    it('should support enum arrays and filtering', () => {
      // Arrange
      const mixedStatuses = [
        { type: 'project', status: ProjectStatus.InProgress },
        { type: 'project', status: ProjectStatus.Completed },
        { type: 'gonogo', status: GoNoGoStatus.Green },
        { type: 'gonogo', status: GoNoGoStatus.Red }
      ];

      // Act
      const projectStatuses = mixedStatuses.filter(item => item.type === 'project');
      const gonogoStatuses = mixedStatuses.filter(item => item.type === 'gonogo');

      // Assert
      expect(projectStatuses).toHaveLength(2);
      expect(gonogoStatuses).toHaveLength(2);
      expect(projectStatuses[0].status).toBe(ProjectStatus.InProgress);
      expect(gonogoStatuses[0].status).toBe(GoNoGoStatus.Green);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize numeric enums correctly', () => {
      // Arrange
      const data = {
        projectStatus: ProjectStatus.InProgress,
        goNoGoStatus: GoNoGoStatus.Green,
        bidType: TypeOfBid.Lumpsum
      };

      // Act
      const serialized = JSON.stringify(data);
      const deserialized = JSON.parse(serialized);

      // Assert
      expect(deserialized.projectStatus).toBe(1);
      expect(deserialized.goNoGoStatus).toBe(2);
      expect(deserialized.bidType).toBe(0);
    });

    it('should serialize string enums correctly', () => {
      // Arrange
      const data = {
        workflowStatus: WorkflowStatus.InProgress,
        versionStatus: GoNoGoVersionStatus.BDM_APPROVED
      };

      // Act
      const serialized = JSON.stringify(data);
      const deserialized = JSON.parse(serialized);

      // Assert
      expect(deserialized.workflowStatus).toBe('InProgress');
      expect(deserialized.versionStatus).toBe('BDM_APPROVED');
    });
  });
});