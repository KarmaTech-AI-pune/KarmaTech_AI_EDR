import { describe, it, expect } from 'vitest';
import { ChangeControl, WorkflowHistory } from './changeControlModel';

describe('ChangeControl Model', () => {
  describe('Type Definition', () => {
    it('should have required properties', () => {
      const changeControl: ChangeControl = {
        id: 1,
        projectId: 100,
        srNo: 1,
        dateLogged: '2024-01-01',
        originator: 'John Doe',
        description: 'Change request description',
        costImpact: 'High',
        timeImpact: 'Medium',
        resourcesImpact: 'Low',
        qualityImpact: 'None',
        changeOrderStatus: 'Pending',
        clientApprovalStatus: 'Awaiting',
        claimSituation: 'No Claim'
      };

      expect(changeControl.id).toBe(1);
      expect(changeControl.projectId).toBe(100);
      expect(changeControl.description).toBe('Change request description');
    });

    it('should have optional properties', () => {
      const changeControl: ChangeControl = {
        id: 1,
        projectId: 100,
        srNo: 1,
        dateLogged: '2024-01-01',
        originator: 'John Doe',
        description: 'Change request',
        costImpact: 'High',
        timeImpact: 'Medium',
        resourcesImpact: 'Low',
        qualityImpact: 'None',
        changeOrderStatus: 'Pending',
        clientApprovalStatus: 'Awaiting',
        claimSituation: 'No Claim',
        workflowStatusId: 1,
        reviewManagerId: 'manager1',
        approvalManagerId: 'manager2',
        createdBy: 'user1',
        updatedBy: 'user2',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
      };

      expect(changeControl.workflowStatusId).toBe(1);
      expect(changeControl.reviewManagerId).toBe('manager1');
      expect(changeControl.approvalManagerId).toBe('manager2');
    });
  });

  describe('Impact Properties', () => {
    it('should store different impact levels', () => {
      const impacts = ['None', 'Low', 'Medium', 'High', 'Critical'];

      impacts.forEach(impact => {
        const changeControl: ChangeControl = {
          id: 1,
          projectId: 100,
          srNo: 1,
          dateLogged: '2024-01-01',
          originator: 'John Doe',
          description: 'Test',
          costImpact: impact,
          timeImpact: impact,
          resourcesImpact: impact,
          qualityImpact: impact,
          changeOrderStatus: 'Pending',
          clientApprovalStatus: 'Awaiting',
          claimSituation: 'No Claim'
        };

        expect(changeControl.costImpact).toBe(impact);
        expect(changeControl.timeImpact).toBe(impact);
        expect(changeControl.resourcesImpact).toBe(impact);
        expect(changeControl.qualityImpact).toBe(impact);
      });
    });
  });

  describe('Status Properties', () => {
    it('should handle different change order statuses', () => {
      const statuses = ['Pending', 'Approved', 'Rejected', 'In Progress', 'Completed'];

      statuses.forEach(status => {
        const changeControl: ChangeControl = {
          id: 1,
          projectId: 100,
          srNo: 1,
          dateLogged: '2024-01-01',
          originator: 'John Doe',
          description: 'Test',
          costImpact: 'Low',
          timeImpact: 'Low',
          resourcesImpact: 'Low',
          qualityImpact: 'None',
          changeOrderStatus: status,
          clientApprovalStatus: 'Awaiting',
          claimSituation: 'No Claim'
        };

        expect(changeControl.changeOrderStatus).toBe(status);
      });
    });

    it('should handle different client approval statuses', () => {
      const approvalStatuses = ['Awaiting', 'Approved', 'Rejected', 'Pending Review'];

      approvalStatuses.forEach(status => {
        const changeControl: ChangeControl = {
          id: 1,
          projectId: 100,
          srNo: 1,
          dateLogged: '2024-01-01',
          originator: 'John Doe',
          description: 'Test',
          costImpact: 'Low',
          timeImpact: 'Low',
          resourcesImpact: 'Low',
          qualityImpact: 'None',
          changeOrderStatus: 'Pending',
          clientApprovalStatus: status,
          claimSituation: 'No Claim'
        };

        expect(changeControl.clientApprovalStatus).toBe(status);
      });
    });
  });

  describe('Workflow History', () => {
    it('should include workflow history', () => {
      const workflowHistory: WorkflowHistory = {
        id: 1,
        changeControlId: 1,
        actionDate: new Date('2024-01-01'),
        comments: 'Approved by manager',
        statusId: 2,
        action: 'Approve',
        actionBy: 'manager1',
        assignedToId: 'user1'
      };

      const changeControl: ChangeControl = {
        id: 1,
        projectId: 100,
        srNo: 1,
        dateLogged: '2024-01-01',
        originator: 'John Doe',
        description: 'Test',
        costImpact: 'Low',
        timeImpact: 'Low',
        resourcesImpact: 'Low',
        qualityImpact: 'None',
        changeOrderStatus: 'Approved',
        clientApprovalStatus: 'Approved',
        claimSituation: 'No Claim',
        workflowHistory: workflowHistory
      };

      expect(changeControl.workflowHistory).toBeDefined();
      expect(changeControl.workflowHistory?.action).toBe('Approve');
    });
  });

  describe('Timestamps', () => {
    it('should track creation and update timestamps', () => {
      const changeControl: ChangeControl = {
        id: 1,
        projectId: 100,
        srNo: 1,
        dateLogged: '2024-01-01',
        originator: 'John Doe',
        description: 'Test',
        costImpact: 'Low',
        timeImpact: 'Low',
        resourcesImpact: 'Low',
        qualityImpact: 'None',
        changeOrderStatus: 'Pending',
        clientApprovalStatus: 'Awaiting',
        claimSituation: 'No Claim',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-15T15:30:00Z'
      };

      expect(changeControl.createdAt).toContain('2024-01-01');
      expect(changeControl.updatedAt).toContain('2024-01-15');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in description', () => {
      const changeControl: ChangeControl = {
        id: 1,
        projectId: 100,
        srNo: 1,
        dateLogged: '2024-01-01',
        originator: "O'Brien & Associates",
        description: 'Change request with "quotes" and special chars: @#$%',
        costImpact: 'Low',
        timeImpact: 'Low',
        resourcesImpact: 'Low',
        qualityImpact: 'None',
        changeOrderStatus: 'Pending',
        clientApprovalStatus: 'Awaiting',
        claimSituation: 'No Claim'
      };

      expect(changeControl.originator).toContain("'");
      expect(changeControl.description).toContain('"');
    });

    it('should handle large serial numbers', () => {
      const changeControl: ChangeControl = {
        id: 999999,
        projectId: 999999,
        srNo: 999999,
        dateLogged: '2024-01-01',
        originator: 'John Doe',
        description: 'Test',
        costImpact: 'Low',
        timeImpact: 'Low',
        resourcesImpact: 'Low',
        qualityImpact: 'None',
        changeOrderStatus: 'Pending',
        clientApprovalStatus: 'Awaiting',
        claimSituation: 'No Claim'
      };

      expect(changeControl.id).toBe(999999);
      expect(changeControl.srNo).toBe(999999);
    });

    it('should handle undefined optional fields', () => {
      const changeControl: ChangeControl = {
        id: 1,
        projectId: 100,
        srNo: 1,
        dateLogged: '2024-01-01',
        originator: 'John Doe',
        description: 'Test',
        costImpact: 'Low',
        timeImpact: 'Low',
        resourcesImpact: 'Low',
        qualityImpact: 'None',
        changeOrderStatus: 'Pending',
        clientApprovalStatus: 'Awaiting',
        claimSituation: 'No Claim'
      };

      expect(changeControl.workflowStatusId).toBeUndefined();
      expect(changeControl.reviewManagerId).toBeUndefined();
      expect(changeControl.workflowHistory).toBeUndefined();
    });
  });
});

describe('WorkflowHistory Model', () => {
  describe('Type Definition', () => {
    it('should have all required properties', () => {
      const workflowHistory: WorkflowHistory = {
        id: 1,
        changeControlId: 100,
        actionDate: new Date('2024-01-01'),
        comments: 'Approved',
        statusId: 2,
        action: 'Approve',
        actionBy: 'manager1',
        assignedToId: 'user1'
      };

      expect(workflowHistory.id).toBe(1);
      expect(workflowHistory.changeControlId).toBe(100);
      expect(workflowHistory.action).toBe('Approve');
    });

    it('should handle different actions', () => {
      const actions = ['Approve', 'Reject', 'Review', 'Submit', 'Cancel'];

      actions.forEach(action => {
        const workflowHistory: WorkflowHistory = {
          id: 1,
          changeControlId: 100,
          actionDate: new Date('2024-01-01'),
          comments: `Action: ${action}`,
          statusId: 1,
          action: action,
          actionBy: 'user1',
          assignedToId: 'user2'
        };

        expect(workflowHistory.action).toBe(action);
      });
    });
  });

  describe('Date Handling', () => {
    it('should store action date as Date object', () => {
      const actionDate = new Date('2024-01-15T10:30:00Z');
      const workflowHistory: WorkflowHistory = {
        id: 1,
        changeControlId: 100,
        actionDate: actionDate,
        comments: 'Test',
        statusId: 1,
        action: 'Approve',
        actionBy: 'user1',
        assignedToId: 'user2'
      };

      expect(workflowHistory.actionDate).toBeInstanceOf(Date);
      expect(workflowHistory.actionDate.getFullYear()).toBe(2024);
    });
  });

  describe('Edge Cases', () => {
    it('should handle long comments', () => {
      const longComment = 'A'.repeat(1000);
      const workflowHistory: WorkflowHistory = {
        id: 1,
        changeControlId: 100,
        actionDate: new Date(),
        comments: longComment,
        statusId: 1,
        action: 'Approve',
        actionBy: 'user1',
        assignedToId: 'user2'
      };

      expect(workflowHistory.comments.length).toBe(1000);
    });
  });
});
