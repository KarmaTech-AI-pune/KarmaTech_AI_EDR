import {Button} from '@mui/material';
import { Send} from '@mui/icons-material';
import { DecideApproval, DecideReview, SendForReview, SendForApproval } from '../dialogbox';
import { useState, useContext} from 'react';
import { WorkflowStatus } from '../../dummyapi/database/dummyopportunityTracking';
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

  const getWorkflowButtonText = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.Initial:
      case WorkflowStatus.ReviewChanges:
        return 'Send for Review';
      case WorkflowStatus.SentForReview:
        return 'Decide Review';
      case WorkflowStatus.ApprovalChanges:
      case WorkflowStatus.SentForApproval:
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
    if (!context || opportunity.workflowStatus === WorkflowStatus.Approved) {
      return false;
    }

    switch (opportunity.workflowStatus) {
      case WorkflowStatus.Initial:
      case WorkflowStatus.ReviewChanges:
        return context.canSubmitForReview;
      case WorkflowStatus.SentForReview:
        return context.canReviewBD;
      case WorkflowStatus.ApprovalChanges:
        return context.canSubmitForApproval; // Changed from canReviewBD to canSubmitForReview
      case WorkflowStatus.SentForApproval:
        return context.canApproveBD;
      default:
        return false;
    }
  };

  const getWorkflowDialog = () => {
    if (!context?.currentUser?.name) return null;

    switch (opportunity.workflowStatus) {
      case WorkflowStatus.Initial:
      case WorkflowStatus.ReviewChanges:
        return (
          <SendForReview 
            open={workflowDialogOpen} 
            onClose={handleWorkflowClose}
            currentUser={context.currentUser.name}
            opportunityId={opportunity.id}
            onSubmit={onOpportunityUpdated}
          />
        );
        case WorkflowStatus.ApprovalChanges:
        case WorkflowStatus.SentForApproval:
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
            };
      case WorkflowStatus.SentForReview:
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
          {getWorkflowButtonText(opportunity.workflowStatus)}
        </Button>
      )}
      {getWorkflowDialog()}
    </>
  )
}
