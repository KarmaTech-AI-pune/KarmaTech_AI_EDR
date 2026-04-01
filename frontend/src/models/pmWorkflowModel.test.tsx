/**
 * Unit Tests for PM Workflow Model
 * 
 * Tests enum, interfaces, and workflow-related types.
 * Ensures proper TypeScript compilation and workflow constraints.
 */

import { describe, it, expect } from 'vitest';
import { 
  PMWorkflowStatus,
  type PMWorkflowHistory,
  type PMWorkflowHistoryResponse,
  type SendToReviewRequest,
  type SendToApprovalRequest,
  type RequestChangesRequest,
  type ApproveRequest
} from './pmWorkflowModel';

describe('PM Workflow Model', () => {
  describe('PMWorkflowStatus Enum', () => {
    it('should have correct enum values', () => {
      // Assert
      expect(PMWorkflowStatus.Initial).toBe(1);
      expect(PMWorkflowStatus.SentForReview).toBe(2);
      expect(PMWorkflowStatus.ReviewChanges).toBe(3);
      expect(PMWorkflowStatus.SentForApproval).toBe(4);
      expect(PMWorkflowStatus.ApprovalChanges).toBe(5);
      expect(PMWorkflowStatus.Approved).toBe(6);
    });

    it('should support workflow progression', () => {
      // Arrange
      const workflowProgression = [
        PMWorkflowStatus.Initial,
        PMWorkflowStatus.SentForReview,
        PMWorkflowStatus.ReviewChanges,
        PMWorkflowStatus.SentForApproval,
        PMWorkflowStatus.ApprovalChanges,
        PMWorkflowStatus.Approved
      ];

      // Act & Assert
      for (let i = 0; i < workflowProgression.length - 1; i++) {
        expect(workflowProgression[i]).toBeLessThan(workflowProgression[i + 1]);
      }
    });
  });

  describe('PMWorkflowHistory Interface', () => {
    it('should accept valid workflow history object', () => {
      // Arrange
      const history: PMWorkflowHistory = {
        id: 1,
        entityId: 123,
        entityType: 'Project',
        statusId: 2,
        status: 'SentForReview',
        action: 'Submit for Review',
        comments: 'Ready for review',
        actionBy: 'user-123',
        actionByName: 'John Doe',
        assignedToId: 'user-456',
        assignedToName: 'Jane Smith',
        actionDate: '2024-01-15T10:30:00Z'
      };

      // Assert
      expect(history.id).toBe(1);
      expect(history.entityId).toBe(123);
      expect(history.entityType).toBe('Project');
      expect(history.statusId).toBe(2);
      expect(history.status).toBe('SentForReview');
      expect(history.action).toBe('Submit for Review');
      expect(history.comments).toBe('Ready for review');
      expect(history.actionBy).toBe('user-123');
      expect(history.actionByName).toBe('John Doe');
      expect(history.assignedToId).toBe('user-456');
      expect(history.assignedToName).toBe('Jane Smith');
      expect(history.actionDate).toBe('2024-01-15T10:30:00Z');
    });
  });

  describe('PMWorkflowHistoryResponse Interface', () => {
    it('should accept valid workflow history response', () => {
      // Arrange
      const historyItem: PMWorkflowHistory = {
        id: 1, entityId: 123, entityType: 'Project', statusId: 2,
        status: 'SentForReview', action: 'Submit', comments: 'Test',
        actionBy: 'user1', actionByName: 'User One', assignedToId: 'user2',
        assignedToName: 'User Two', actionDate: '2024-01-15T10:30:00Z'
      };

      const response: PMWorkflowHistoryResponse = {
        entityId: 123,
        entityType: 'Project',
        currentStatusId: 2,
        currentStatus: 'SentForReview',
        history: [historyItem]
      };

      // Assert
      expect(response.entityId).toBe(123);
      expect(response.entityType).toBe('Project');
      expect(response.currentStatusId).toBe(2);
      expect(response.currentStatus).toBe('SentForReview');
      expect(response.history).toHaveLength(1);
      expect(response.history[0]).toEqual(historyItem);
    });
  });

  describe('SendToReviewRequest Interface', () => {
    it('should accept valid send to review request', () => {
      // Arrange
      const request: SendToReviewRequest = {
        entityId: 123,
        entityType: 'Project',
        assignedToId: 'reviewer-456',
        action: 'SendForReview',
        comments: 'Please review this project'
      };

      // Assert
      expect(request.entityId).toBe(123);
      expect(request.entityType).toBe('Project');
      expect(request.assignedToId).toBe('reviewer-456');
      expect(request.action).toBe('SendForReview');
      expect(request.comments).toBe('Please review this project');
    });
  });

  describe('SendToApprovalRequest Interface', () => {
    it('should accept valid send to approval request', () => {
      // Arrange
      const request: SendToApprovalRequest = {
        entityId: 456,
        entityType: 'Document',
        assignedToId: 'approver-789',
        comments: 'Ready for final approval',
        action: 'SendForApproval'
      };

      // Assert
      expect(request.entityId).toBe(456);
      expect(request.entityType).toBe('Document');
      expect(request.assignedToId).toBe('approver-789');
      expect(request.comments).toBe('Ready for final approval');
      expect(request.action).toBe('SendForApproval');
    });
  });

  describe('RequestChangesRequest Interface', () => {
    it('should accept valid request changes request', () => {
      // Arrange
      const request: RequestChangesRequest = {
        entityId: 789,
        entityType: 'Report',
        comments: 'Please update the financial section',
        isApprovalChanges: false,
        assignedToId: 'author-123',
        action: 'RequestChanges'
      };

      // Assert
      expect(request.entityId).toBe(789);
      expect(request.entityType).toBe('Report');
      expect(request.comments).toBe('Please update the financial section');
      expect(request.isApprovalChanges).toBe(false);
      expect(request.assignedToId).toBe('author-123');
      expect(request.action).toBe('RequestChanges');
    });

    it('should handle optional assignedToId', () => {
      // Arrange
      const request: RequestChangesRequest = {
        entityId: 999,
        entityType: 'Proposal',
        comments: 'Needs revision',
        isApprovalChanges: true,
        action: 'RequestApprovalChanges'
      };

      // Assert
      expect(request.assignedToId).toBeUndefined();
      expect(request.isApprovalChanges).toBe(true);
    });
  });

  describe('ApproveRequest Interface', () => {
    it('should accept valid approve request', () => {
      // Arrange
      const request: ApproveRequest = {
        entityId: 555,
        entityType: 'Contract',
        comments: 'Approved with no changes required',
        action: 'Approve',
        assignedToId: 'manager-999'
      };

      // Assert
      expect(request.entityId).toBe(555);
      expect(request.entityType).toBe('Contract');
      expect(request.comments).toBe('Approved with no changes required');
      expect(request.action).toBe('Approve');
      expect(request.assignedToId).toBe('manager-999');
    });

    it('should handle optional assignedToId', () => {
      // Arrange
      const request: ApproveRequest = {
        entityId: 777,
        entityType: 'Budget',
        comments: 'Final approval granted',
        action: 'FinalApprove'
      };

      // Assert
      expect(request.assignedToId).toBeUndefined();
    });
  });

  describe('Workflow Operations', () => {
    it('should support workflow status transitions', () => {
      // Arrange
      const validTransitions = new Map([
        [PMWorkflowStatus.Initial, [PMWorkflowStatus.SentForReview]],
        [PMWorkflowStatus.SentForReview, [PMWorkflowStatus.ReviewChanges, PMWorkflowStatus.SentForApproval]],
        [PMWorkflowStatus.ReviewChanges, [PMWorkflowStatus.SentForReview]],
        [PMWorkflowStatus.SentForApproval, [PMWorkflowStatus.ApprovalChanges, PMWorkflowStatus.Approved]],
        [PMWorkflowStatus.ApprovalChanges, [PMWorkflowStatus.SentForApproval]],
        [PMWorkflowStatus.Approved, []]
      ]);

      // Act
      const canTransition = (from: PMWorkflowStatus, to: PMWorkflowStatus) => {
        const allowedTransitions = validTransitions.get(from) || [];
        return allowedTransitions.includes(to);
      };

      // Assert
      expect(canTransition(PMWorkflowStatus.Initial, PMWorkflowStatus.SentForReview)).toBe(true);
      expect(canTransition(PMWorkflowStatus.SentForReview, PMWorkflowStatus.Approved)).toBe(false);
      expect(canTransition(PMWorkflowStatus.SentForApproval, PMWorkflowStatus.Approved)).toBe(true);
      expect(canTransition(PMWorkflowStatus.Approved, PMWorkflowStatus.Initial)).toBe(false);
    });

    it('should support workflow history tracking', () => {
      // Arrange
      const history: PMWorkflowHistory[] = [
        {
          id: 1, entityId: 100, entityType: 'Project', statusId: 1, status: 'Initial',
          action: 'Create', comments: 'Project created', actionBy: 'user1',
          actionByName: 'Creator', assignedToId: 'user1', assignedToName: 'Creator',
          actionDate: '2024-01-01T10:00:00Z'
        },
        {
          id: 2, entityId: 100, entityType: 'Project', statusId: 2, status: 'SentForReview',
          action: 'SendForReview', comments: 'Ready for review', actionBy: 'user1',
          actionByName: 'Creator', assignedToId: 'user2', assignedToName: 'Reviewer',
          actionDate: '2024-01-02T14:00:00Z'
        },
        {
          id: 3, entityId: 100, entityType: 'Project', statusId: 4, status: 'SentForApproval',
          action: 'SendForApproval', comments: 'Review complete', actionBy: 'user2',
          actionByName: 'Reviewer', assignedToId: 'user3', assignedToName: 'Approver',
          actionDate: '2024-01-03T16:00:00Z'
        }
      ];

      // Act
      const sortedHistory = history.sort((a, b) => new Date(a.actionDate).getTime() - new Date(b.actionDate).getTime());
      const currentStatus = sortedHistory[sortedHistory.length - 1];

      // Assert
      expect(sortedHistory).toHaveLength(3);
      expect(currentStatus.status).toBe('SentForApproval');
      expect(currentStatus.statusId).toBe(4);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize workflow history correctly', () => {
      // Arrange
      const original: PMWorkflowHistory = {
        id: 999,
        entityId: 888,
        entityType: 'TestEntity',
        statusId: 3,
        status: 'ReviewChanges',
        action: 'RequestChanges',
        comments: 'Needs updates',
        actionBy: 'reviewer-123',
        actionByName: 'Test Reviewer',
        assignedToId: 'author-456',
        assignedToName: 'Test Author',
        actionDate: '2024-01-15T12:30:00Z'
      };

      // Act
      const serialized = JSON.stringify(original);
      const deserialized: PMWorkflowHistory = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(original);
      expect(typeof deserialized.id).toBe('number');
      expect(typeof deserialized.entityId).toBe('number');
      expect(typeof deserialized.statusId).toBe('number');
    });

    it('should serialize workflow response correctly', () => {
      // Arrange
      const response: PMWorkflowHistoryResponse = {
        entityId: 123,
        entityType: 'Project',
        currentStatusId: 6,
        currentStatus: 'Approved',
        history: [
          {
            id: 1, entityId: 123, entityType: 'Project', statusId: 6,
            status: 'Approved', action: 'Approve', comments: 'Final approval',
            actionBy: 'approver', actionByName: 'Approver Name',
            assignedToId: '', assignedToName: '', actionDate: '2024-01-15T10:00:00Z'
          }
        ]
      };

      // Act
      const serialized = JSON.stringify(response);
      const deserialized: PMWorkflowHistoryResponse = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(response);
      expect(deserialized.history).toHaveLength(1);
      expect(deserialized.currentStatusId).toBe(6);
    });
  });
});