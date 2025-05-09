import {Button} from '@mui/material';
import { Send} from '@mui/icons-material';
import { DecideApproval, DecideReview, SendForReview, SendForApproval } from '../dialogbox';
import { useState, useContext, useEffect } from 'react';
import { getWorkflowStatusById } from '../../dummyapi/database/dummyOpporunityWorkflow';
import { projectManagementAppContext } from '../../App';
import { OpportunityTracking } from '../../models';

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
  const context = useContext(projectManagementAppContext);

  useEffect(() => {
    // Handle both single object and array cases
    const history = Array.isArray(opportunity.currentHistory) 
      ? opportunity.currentHistory[0] 
      : opportunity.currentHistory;
    
    setLocalStatusId(history?.statusId || 0);
  }, [
    // Use optional chaining in dependency array and handle array case
    Array.isArray(opportunity.currentHistory)
      ? opportunity.currentHistory[0]?.statusId
      : opportunity.currentHistory?.statusId
  ]);

  const handleWorkflowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowDialogOpen(true);
  };

  const handleWorkflowClose = async (success: boolean = false, updatedOpp?: OpportunityTracking) => {
    setWorkflowDialogOpen(false);
    if (success) {
      // Update status immediately for instant feedback
      const nextStatusId = (Array.isArray(opportunity.currentHistory)
        ? opportunity.currentHistory[0]?.statusId || 0
        : opportunity.currentHistory?.statusId || 0) + 1;
      setLocalStatusId(nextStatusId);
      if (onOpportunityUpdated) {
        try {
          await onOpportunityUpdated();
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const getWorkflowButtonText = (workflowId: number) => {
    const workflowStatus = getWorkflowStatusById(workflowId);
    const status = isValidWorkflowStatus(workflowStatus) ? workflowStatus.status : '';
    switch (status) {
      case "Initial":
      case "Review Changes":
        return 'Send for Review';
      case "Sent for Review":
        return 'Decide Review';
      case "Approval Changes":
      case "Sent for Approval":
        if (context?.canApproveBD) {
          return 'Decide Approval';
        } else if (context?.canSubmitForApproval) {
          return 'Send for Approval';
        }
        return '';
      default:
        return 'Send for Review';
    }
  };

  const canShowWorkflowButton = () => {
    if (!context) return false;
    
    const workflowStatus = getWorkflowStatusById(localStatusId);
    const status = isValidWorkflowStatus(workflowStatus) ? workflowStatus.status : '';
    if (!status || status === "Approved") {
      return false;
    }

    switch (status) {
      case "Initial":
      case "Review Changes":
        return context.canSubmitForReview;
      case "Sent for Review":
        return context.canReviewBD;
      case "Approval Changes":
        return context.canSubmitForApproval;
      case "Sent for Approval":
        return context.canApproveBD;
      default:
        return false;
    }
  };

  const getWorkflowDialog = () => {
    if (!context?.currentUser?.name) return null;

    const workflowStatus = getWorkflowStatusById(localStatusId);
    const status = isValidWorkflowStatus(workflowStatus) ? workflowStatus.status : '';
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
            onDecisionMade={async (updatedOpportunity) => {
              // If we have the updated opportunity, use it
              if (updatedOpportunity) {
                await handleWorkflowClose(true, updatedOpportunity);
              } else {
                // Fallback to original behavior
                const nextStatusId = (Array.isArray(opportunity.currentHistory)
                  ? opportunity.currentHistory[0]?.statusId || 0
                  : opportunity.currentHistory?.statusId || 0) + 1;
                setLocalStatusId(nextStatusId);
                await handleWorkflowClose(true);
              }
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
          {getWorkflowButtonText(localStatusId)}
        </Button>
      )}
      {workflowDialogOpen && getWorkflowDialog()}
    </>
  )
}
