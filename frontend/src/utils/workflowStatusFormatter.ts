import { getWorkflowStatusById } from '../dummyapi/database/dummyOpporunityWorkflow';

export const getEnhancedWorkflowStatus = (
  statusId: number,
  reviewerName: string | null,
  reviewerDesignation: string | null,
  approverName: string | null,
  approverDesignation: string | null
): string => {
  const status = getWorkflowStatusById(statusId)?.status;
  
  switch (statusId) {
    case 1: // Initial
      return 'Initial';
    case 2: // Sent for Review
      return reviewerName 
        ? `Awaiting Review at ${reviewerName} (${reviewerDesignation || 'Regional Manager'})`
        : 'Sent for Review';
    case 3: // Review Changes
      // Assuming the last action was a rejection by the reviewer
      return reviewerName 
        ? `Rejected by ${reviewerName} (${reviewerDesignation || 'Regional Manager'})`
        : 'Review Changes Required';
    case 4: // Sent for Approval
      return approverName 
        ? `Awaiting Approval at ${approverName} (${approverDesignation || 'Regional Director'})`
        : 'Sent for Approval';
    case 5: // Approval Changes
      // Assuming the last action was a rejection by the approver
      return approverName 
        ? `Rejected by ${approverName} (${approverDesignation || 'Regional Director'})`
        : 'Approval Changes Required';
    case 6: // Approved
      return approverName 
        ? `Approved by ${approverName} (${approverDesignation || 'Regional Director'})`
        : 'Approved';
    default:
      return status || 'Unknown Status';
  }
};
