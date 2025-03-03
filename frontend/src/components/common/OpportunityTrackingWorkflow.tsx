import {Button} from '@mui/material';
import { Send} from '@mui/icons-material';
import { DecideApproval, DecideReview, SendForReview, SendForApproval } from '../dialogbox';
import { useState, useContext, useEffect } from 'react';
import { getWorkflowStatusById } from '../../dummyapi/database/dummyOpporunityWorkflow';
import { projectManagementAppContext } from '../../App';
import { OpportunityTracking } from '../../models/opportunityTrackingModel';

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
const isValidWorkflowStatus = (status: any): status is WorkflowStatus => {
  return status && typeof status.status === 'string';
};

type OTWProps = {
  onOpportunityUpdated?: (() => void) | undefined;
  opportunity: OpportunityTracking;
}

export const OpportunityTrackingWorkflow : React.FC<OTWProps> = ({
  onOpportunityUpdated,
  opportunity
}) => {
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [localStatusId, setLocalStatusId] = useState<number>(opportunity.currentHistory?.statusId || 0);
  const context = useContext(projectManagementAppContext);

  useEffect(() => {
    setLocalStatusId(opportunity.currentHistory?.statusId || 0);
  }, [opportunity.currentHistory.statusId]);

  const handleWorkflowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowDialogOpen(true);
  };

  const handleWorkflowClose = async (success: boolean = false) => {
    setWorkflowDialogOpen(false);
    if (success) {
      // Update status immediately for instant feedback
      const nextStatusId = (opportunity.currentHistory?.statusId || 0) + 1;
      setLocalStatusId(nextStatusId);
      if (onOpportunityUpdated) {
        await onOpportunityUpdated();
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
            onDecisionMade={async () => {
              // Update status immediately when decision is made
              const nextStatusId = (opportunity.currentHistory?.statusId || 0) + 1;
              setLocalStatusId(nextStatusId);
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
          {getWorkflowButtonText(localStatusId)}
        </Button>
      )}
      {workflowDialogOpen && getWorkflowDialog()}
    </>
  )
}
