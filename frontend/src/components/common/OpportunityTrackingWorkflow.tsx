import {Button} from '@mui/material';
import { Send} from '@mui/icons-material';
import { DecideApproval, DecideReview, SendForReview, SendForApproval } from '../dialogbox';
import { useState, useContext, useEffect } from 'react';
import { getWorkflowStatusById } from '../../dummyapi/database/dummyOpporunityWorkflow';
import { projectManagementAppContext } from '../../App';
import { OpportunityTracking } from '../../models';
import { getUserById } from '../../services/userApi'; // Import getUserById

interface WorkflowStatus {
  id: number;
  name: string;
  status: string;
}

// interface OpportunityHistory {
//   statusId: number;
// }

// interface OpportunityTracking {
//   id: number;
//   currentHistory: OpportunityHistory;
// }

// Type guard to check if workflow status is valid
const isValidWorkflowStatus = (status: unknown): status is WorkflowStatus => {
  return status !== null && 
         typeof status === 'object' && 
         'status' in status && 
         typeof (status as Record<string, unknown>).status === 'string';
};

type OTWProps = {
  onOpportunityUpdated?: ((updatedOpportunity?: OpportunityTracking) => void) | undefined;
  opportunity: OpportunityTracking;
}

export const OpportunityTrackingWorkflow : React.FC<OTWProps> = ({
  onOpportunityUpdated,
  opportunity
}) => {
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [localStatusId, setLocalStatusId] = useState<number>(
    Array.isArray(opportunity.currentHistory)
      ? opportunity.currentHistory[0]?.statusId || 0
      : opportunity.currentHistory?.statusId || 0
  );
  const [reviewerName, setReviewerName] = useState<string | null>(null); // State to store reviewer's name
  const [approverName, setApproverName] = useState<string | null>(null); // State to store approver's name
  const context = useContext(projectManagementAppContext);

  useEffect(() => {
    // Handle both single object and array cases
    const history = Array.isArray(opportunity.currentHistory) 
      ? opportunity.currentHistory[0] 
      : opportunity.currentHistory;
    
    setLocalStatusId(history?.statusId || 0);

    // Fetch reviewer's name if reviewManagerId is available
    const fetchReviewerName = async () => {
      if (opportunity.reviewManagerId) {
        try {
          const user = await getUserById(opportunity.reviewManagerId);
          if (user) {
            setReviewerName(user.name);
          } else {
            setReviewerName(null);
          }
        } catch (error) {
          console.error("Error fetching reviewer name:", error);
          setReviewerName(null);
        }
      } else {
        setReviewerName(null);
      }
    };

    // Fetch approver's name if approvalManagerId is available
    const fetchApproverName = async () => {
      if (opportunity.approvalManagerId) {
        try {
          const user = await getUserById(opportunity.approvalManagerId);
          if (user) {
            setApproverName(user.name);
          } else {
            setApproverName(null);
          }
        } catch (error) {
          console.error("Error fetching approver name:", error);
          setApproverName(null);
        }
      } else {
        setApproverName(null);
      }
    };

    fetchReviewerName();
    fetchApproverName();
  }, [
    // Use optional chaining in dependency array and handle array case
    Array.isArray(opportunity.currentHistory)
      ? opportunity.currentHistory[0]?.statusId
      : opportunity.currentHistory?.statusId,
    opportunity.reviewManagerId, // Add reviewManagerId to dependencies
    opportunity.approvalManagerId // Add approvalManagerId to dependencies
  ]);

  const handleWorkflowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowDialogOpen(true);
  };

  const handleWorkflowClose = async (success: boolean = false) => {
    setWorkflowDialogOpen(false);
    if (success && onOpportunityUpdated) {
      try {
        await onOpportunityUpdated();
      } catch (error) {
        console.error("Error updating opportunity:", error);
      }
    }
  };

  const history = Array.isArray(opportunity.currentHistory) 
    ? opportunity.currentHistory[0] 
    : opportunity.currentHistory;
  
  const workflowStatus = getWorkflowStatusById(localStatusId);
  const status = history?.status || (isValidWorkflowStatus(workflowStatus) ? workflowStatus.status : (typeof opportunity.status === 'string' ? opportunity.status : '')) || '';

  const getWorkflowButtonText = () => {
    switch (status) {
      case "Initial":
      case "Review Changes":
        return reviewerName ? `Send for Review to ${reviewerName}` : 'Send for Review';
      case "Sent for Review":
        return 'Decide Review';
      case "Approval Changes":
      case "Sent for Approval":
        if (context?.canApproveBD) {
          return 'Decide Approval';
        } else if (context?.canSubmitForApproval) {
          return approverName ? `Send for Approval to ${approverName}` : 'Send for Approval';
        }
        return '';
      default:
        return 'Send for Review';
    }
  };

  const canShowWorkflowButton = () => {
    if (!context) return false;
    
    if (!status || status === "Approved") {
      return false;
    }

    switch (status) {
      case "Initial":
      case "Review Changes":
        return context.canEditOpportunity; // BDM can send for review if they can edit
      case "Sent for Review":
        return context.canReviewBD; // RM can decide review
      case "Approval Changes":
        return context.canSubmitForApproval; // RM can submit for approval
      case "Sent for Approval":
        return context.canApproveBD; // RD can approve
      default:
        return false;
    }
  };

  const getWorkflowDialog = () => {
    if (!context?.currentUser?.name) return null;
    switch (status) {
      case "Initial":
      case "Review Changes":
        return (
          <SendForReview 
            open={workflowDialogOpen} 
            onClose={() => handleWorkflowClose(false)}
            currentUser={context.currentUser.name}
            opportunityId={opportunity.id}
            onSubmit={async () => await handleWorkflowClose(true)}
            onReviewSent={onOpportunityUpdated}
          />
        );
      case "Approval Changes":
      case "Sent for Approval":
        if (context?.canApproveBD) {
          return (
            <DecideApproval 
              open={workflowDialogOpen} 
            onClose={() => handleWorkflowClose(false)}
            opportunityId={opportunity.id}
            currentUser={context?.currentUser.name}
            onSubmit={async () => await handleWorkflowClose(true)}
            />
          );
        } else if (context?.canSubmitForApproval) {
          return (
            <SendForApproval
              open={workflowDialogOpen}
            onClose={() => handleWorkflowClose(false)}
            opportunityId={opportunity.id}
            currentUser={context?.currentUser.name}
            onSubmit={async () => await handleWorkflowClose(true)}
            />
          );
        }
        return null;
      case "Sent for Review":
        return (
          <DecideReview 
            open={workflowDialogOpen} 
            onClose={() => handleWorkflowClose(false)}
            opportunityId={opportunity.id}
            currentUser={context.currentUser.name}
            onDecisionMade={async () => {
              await handleWorkflowClose(true);
            }}
          />
        );
      default:
        return null;
    }
  };

  return(
    <>
      {canShowWorkflowButton() && (
        <Button 
          onClick={handleWorkflowClick}
          size="small"
          color="primary"
          startIcon={<Send />}
        >
          {getWorkflowButtonText()}
        </Button>
      )}
      {workflowDialogOpen && getWorkflowDialog()}
    </>
  )
}
