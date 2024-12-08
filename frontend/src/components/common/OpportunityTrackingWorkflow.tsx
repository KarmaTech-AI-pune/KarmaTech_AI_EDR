import {Button} from '@mui/material';
import { Send} from '@mui/icons-material';
import { DecideApproval, DecideReview, SendForReview, SendForApproval } from '../dialogbox';
import { useState, useContext} from 'react';
import { getWorkflowStatusById } from '../../dummyapi/database/dummyOpporunityWorkflow';
import { projectManagementAppContext } from '../../App';
import { OpportunityTracking } from '../../types';

type OTWProps = {
  onOpportunityUpdated?: (() => void) | undefined;
  opportunity: OpportunityTracking;
}

export const OpportunityTrackingWorkflow : React.FC<OTWProps> = ({
  onOpportunityUpdated,
  opportunity
}) => {
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const context = useContext(projectManagementAppContext);

  const handleWorkflowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowDialogOpen(true);
  };

  const handleWorkflowClose = () => {
    setWorkflowDialogOpen(false);
    if (onOpportunityUpdated) {
      onOpportunityUpdated();
    }
  };

  const getWorkflowButtonText = (workflowId: number) => {
    const status = getWorkflowStatusById(workflowId)?.status;
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
    
    const status = getWorkflowStatusById(opportunity.workflowId)?.status;
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

    const status = getWorkflowStatusById(opportunity.workflowId)?.status;
    switch (status) {
      case "Initial":
      case "Review Changes":
        return (
          <SendForReview 
            open={workflowDialogOpen} 
            onClose={handleWorkflowClose}
            currentUser={context.currentUser.name}
            opportunityId={opportunity.id}
            onSubmit={onOpportunityUpdated}
          />
        );
      case "Approval Changes":
      case "Sent for Approval":
        if (context?.canApproveBD) {
          return (
            <DecideApproval 
              open={workflowDialogOpen} 
              onClose={handleWorkflowClose}
              opportunityId={opportunity.id}
              currentUser={context?.currentUser.name}
              onSubmit={onOpportunityUpdated}
            />
          );
        } else if (context?.canSubmitForApproval) {
          return (
            <SendForApproval
              open={workflowDialogOpen}
              onClose={handleWorkflowClose}
              opportunityId={opportunity.id}
              currentUser={context?.currentUser.name}
              onSubmit={onOpportunityUpdated}
            />
          );
        }
        return null;
      case "Sent for Review":
        return (
          <DecideReview 
            open={workflowDialogOpen} 
            onClose={handleWorkflowClose}
            opportunityId={opportunity.id}
            currentUser={context.currentUser.name}
            onDecisionMade={onOpportunityUpdated}
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
          {getWorkflowButtonText(opportunity.workflowId)}
        </Button>
      )}
      {getWorkflowDialog()}
    </>
  )
}
