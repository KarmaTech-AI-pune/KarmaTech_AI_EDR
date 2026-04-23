/**
 * Unit Tests for Workflow Model
 * 
 * Tests enums, interfaces, and workflow-related functions.
 * Ensures proper TypeScript compilation and workflow logic.
 */

import { describe, it, expect } from 'vitest';
import { 
  GoNoGoVersionStatus, 
  WorkflowStatus, 
  getStatusesForRole,
  type WorkflowStep,
  type WorkflowTransition,
  type WorkflowVersion,
  type WorkflowInstance
} from './workflowModel';

describe('Workflow Model', () => {
  describe('GoNoGoVersionStatus Enum', () => {
    it('should have correct enum values', () => {
      // Assert
      expect(GoNoGoVersionStatus.BDM_PENDING).toBe(0);
      expect(GoNoGoVersionStatus.BDM_APPROVED).toBe(1);
      expect(GoNoGoVersionStatus.RM_PENDING).toBe(2);
      expect(GoNoGoVersionStatus.RM_APPROVED).toBe(3);
      expect(GoNoGoVersionStatus.RD_PENDING).toBe(4);
      expect(GoNoGoVersionStatus.RD_APPROVED).toBe(5);
      expect(GoNoGoVersionStatus.COMPLETED).toBe(6);
    });

    it('should support status progression logic', () => {
      // Arrange
      const statusProgression = [
        GoNoGoVersionStatus.BDM_PENDING,
        GoNoGoVersionStatus.BDM_APPROVED,
        GoNoGoVersionStatus.RM_PENDING,
        GoNoGoVersionStatus.RM_APPROVED,
        GoNoGoVersionStatus.RD_PENDING,
        GoNoGoVersionStatus.RD_APPROVED,
        GoNoGoVersionStatus.COMPLETED
      ];

      // Act & Assert
      for (let i = 0; i < statusProgression.length - 1; i++) {
        expect(statusProgression[i]).toBeLessThan(statusProgression[i + 1]);
      }
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

    it('should support status filtering', () => {
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
      const isActiveStatus = (status: WorkflowStatus) => activeStatuses.includes(status);
      const isFinalStatus = (status: WorkflowStatus) => finalStatuses.includes(status);

      // Assert
      expect(isActiveStatus(WorkflowStatus.InProgress)).toBe(true);
      expect(isActiveStatus(WorkflowStatus.Completed)).toBe(false);
      expect(isFinalStatus(WorkflowStatus.Approved)).toBe(true);
      expect(isFinalStatus(WorkflowStatus.Initiated)).toBe(false);
    });
  });

  describe('getStatusesForRole Function', () => {
    it('should return correct status for BDM role', () => {
      // Act
      const result = getStatusesForRole('BDM');

      // Assert
      expect(result).toBe(GoNoGoVersionStatus.BDM_APPROVED);
    });

    it('should return correct status for RM role', () => {
      // Act
      const result = getStatusesForRole('RM');

      // Assert
      expect(result).toBe(GoNoGoVersionStatus.RM_PENDING);
    });

    it('should return correct status for RD role', () => {
      // Act
      const result = getStatusesForRole('RD');

      // Assert
      expect(result).toBe(GoNoGoVersionStatus.RD_APPROVED);
    });

    it('should return COMPLETED for unknown roles', () => {
      // Act
      const result1 = getStatusesForRole('UNKNOWN');
      const result2 = getStatusesForRole('');
      const result3 = getStatusesForRole('ADMIN');

      // Assert
      expect(result1).toBe(GoNoGoVersionStatus.COMPLETED);
      expect(result2).toBe(GoNoGoVersionStatus.COMPLETED);
      expect(result3).toBe(GoNoGoVersionStatus.COMPLETED);
    });

    it('should handle case sensitivity', () => {
      // Act
      const lowerCase = getStatusesForRole('bdm');
      const upperCase = getStatusesForRole('BDM');
      const mixedCase = getStatusesForRole('Bdm');

      // Assert
      expect(upperCase).toBe(GoNoGoVersionStatus.BDM_APPROVED);
      expect(lowerCase).toBe(GoNoGoVersionStatus.COMPLETED); // Case sensitive
      expect(mixedCase).toBe(GoNoGoVersionStatus.COMPLETED); // Case sensitive
    });
  });

  describe('WorkflowStep Interface', () => {
    it('should accept valid workflow step object', () => {
      // Arrange
      const workflowStep: WorkflowStep = {
        id: 'step-1',
        name: 'Initial Review',
        order: 1,
        roles: ['BDM', 'RM'],
        actions: ['review', 'approve', 'reject']
      };

      // Assert
      expect(workflowStep.id).toBe('step-1');
      expect(workflowStep.name).toBe('Initial Review');
      expect(workflowStep.order).toBe(1);
      expect(workflowStep.roles).toEqual(['BDM', 'RM']);
      expect(workflowStep.actions).toEqual(['review', 'approve', 'reject']);
    });

    it('should support step ordering', () => {
      // Arrange
      const steps: WorkflowStep[] = [
        { id: 'step-3', name: 'Final', order: 3, roles: ['RD'], actions: ['complete'] },
        { id: 'step-1', name: 'Initial', order: 1, roles: ['BDM'], actions: ['start'] },
        { id: 'step-2', name: 'Review', order: 2, roles: ['RM'], actions: ['review'] }
      ];

      // Act
      const sortedSteps = steps.sort((a, b) => a.order - b.order);

      // Assert
      expect(sortedSteps[0].order).toBe(1);
      expect(sortedSteps[1].order).toBe(2);
      expect(sortedSteps[2].order).toBe(3);
      expect(sortedSteps[0].name).toBe('Initial');
    });
  });

  describe('WorkflowTransition Interface', () => {
    it('should accept valid workflow transition object', () => {
      // Arrange
      const transition: WorkflowTransition = {
        id: 'trans-1',
        fromStep: 'step-1',
        toStep: 'step-2',
        requiredRole: 'BDM',
        conditions: ['approved', 'documented']
      };

      // Assert
      expect(transition.id).toBe('trans-1');
      expect(transition.fromStep).toBe('step-1');
      expect(transition.toStep).toBe('step-2');
      expect(transition.requiredRole).toBe('BDM');
      expect(transition.conditions).toEqual(['approved', 'documented']);
    });

    it('should handle optional conditions', () => {
      // Arrange
      const transitionWithoutConditions: WorkflowTransition = {
        id: 'trans-2',
        fromStep: 'step-2',
        toStep: 'step-3',
        requiredRole: 'RM'
      };

      // Assert
      expect(transitionWithoutConditions.conditions).toBeUndefined();
    });
  });

  describe('WorkflowVersion Interface', () => {
    it('should accept valid workflow version object', () => {
      // Arrange
      const version: WorkflowVersion = {
        id: 'version-1',
        workflowInstanceId: 'instance-1',
        versionNumber: 1,
        data: '{"status": "draft"}',
        createdBy: 'user-123',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        comments: 'Initial version',
        status: 'active'
      };

      // Assert
      expect(version.id).toBe('version-1');
      expect(version.versionNumber).toBe(1);
      expect(version.data).toBe('{"status": "draft"}');
      expect(version.createdBy).toBe('user-123');
      expect(version.createdAt).toBeInstanceOf(Date);
    });

    it('should support version comparison', () => {
      // Arrange
      const version1: WorkflowVersion = {
        id: 'v1', workflowInstanceId: 'i1', versionNumber: 1,
        data: '{}', createdBy: 'user', createdAt: new Date(),
        comments: '', status: 'active'
      };
      const version2: WorkflowVersion = {
        id: 'v2', workflowInstanceId: 'i1', versionNumber: 2,
        data: '{}', createdBy: 'user', createdAt: new Date(),
        comments: '', status: 'active'
      };

      // Assert
      expect(version2.versionNumber).toBeGreaterThan(version1.versionNumber);
    });
  });

  describe('WorkflowInstance Interface', () => {
    it('should accept valid workflow instance object', () => {
      // Arrange
      const currentStep: WorkflowStep = {
        id: 'step-1',
        name: 'Review',
        order: 1,
        roles: ['BDM'],
        actions: ['review']
      };

      const instance: WorkflowInstance = {
        id: 'instance-1',
        workflowType: 'GoNoGo',
        status: WorkflowStatus.InProgress,
        currentStepOrder: 1,
        currentStep: currentStep,
        steps: [currentStep],
        transitions: [],
        versions: [],
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z'),
        entityId: 'entity-123'
      };

      // Assert
      expect(instance.id).toBe('instance-1');
      expect(instance.workflowType).toBe('GoNoGo');
      expect(instance.status).toBe(WorkflowStatus.InProgress);
      expect(instance.currentStepOrder).toBe(1);
      expect(instance.currentStep).toEqual(currentStep);
    });

    it('should support workflow progression tracking', () => {
      // Arrange
      const steps: WorkflowStep[] = [
        { id: 'step-1', name: 'Start', order: 1, roles: ['BDM'], actions: ['start'] },
        { id: 'step-2', name: 'Review', order: 2, roles: ['RM'], actions: ['review'] },
        { id: 'step-3', name: 'Approve', order: 3, roles: ['RD'], actions: ['approve'] }
      ];

      const instance: WorkflowInstance = {
        id: 'instance-1', workflowType: 'GoNoGo', status: WorkflowStatus.InProgress,
        currentStepOrder: 2, currentStep: steps[1], steps: steps,
        transitions: [], versions: [], createdAt: new Date(), updatedAt: new Date(),
        entityId: 'entity-1'
      };

      // Act
      const isFirstStep = instance.currentStepOrder === 1;
      const isLastStep = instance.currentStepOrder === instance.steps.length;
      const progressPercentage = (instance.currentStepOrder / instance.steps.length) * 100;

      // Assert
      expect(isFirstStep).toBe(false);
      expect(isLastStep).toBe(false);
      expect(progressPercentage).toBeCloseTo(66.67, 2);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize workflow instance correctly', () => {
      // Arrange
      const step: WorkflowStep = {
        id: 'step-1', name: 'Test', order: 1,
        roles: ['USER'], actions: ['test']
      };

      const original: WorkflowInstance = {
        id: 'test-instance', workflowType: 'Test', status: WorkflowStatus.Initiated,
        currentStepOrder: 1, currentStep: step, steps: [step],
        transitions: [], versions: [], 
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z'),
        entityId: 'entity-test'
      };

      // Act
      const serialized = JSON.stringify(original);
      const deserialized: WorkflowInstance = JSON.parse(serialized);

      // Assert
      expect(deserialized.id).toBe(original.id);
      expect(deserialized.status).toBe(original.status);
      expect(deserialized.currentStepOrder).toBe(original.currentStepOrder);
      expect(typeof deserialized.createdAt).toBe('string'); // Dates become strings in JSON
    });
  });
});