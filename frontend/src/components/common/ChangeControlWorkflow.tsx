import { Button, Chip } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useState, useContext, useEffect } from 'react';
import { projectManagementAppContext } from '../../App';
import { ChangeControl } from '../../models';
import {
  SendForReview,
  DecideReview,
  SendForApproval,
  DecideApproval
} from '../dialogbox/changecontrol';

interface WorkflowStatus {
  id: number;
  name: string;
  status: string;
}

// Type guard to check if workflow status is valid
const isValidWorkflowStatus = (status: unknown): status is WorkflowStatus => {
  return status !== null &&
    typeof status === 'object' &&
    'status' in status &&
    typeof (status as Record<string, unknown>).status === 'string';
};

// Helper function to get workflow status by ID
const getWorkflowStatusById = (statusId: number): WorkflowStatus | null => {
  const statuses: Record<number, WorkflowStatus> = {
    1: { id: 1, name: 'Initial', status: 'Initial' },
    2: { id: 2, name: 'Sent for Review', status: 'Sent for Review' },
    3: { id: 3, name: 'Review Changes', status: 'Review Changes' },
    4: { id: 4, name: 'Sent for Approval', status: 'Sent for Approval' },
    5: { id: 5, name: 'Approval Changes', status: 'Approval Changes' },
    6: { id: 6, name: 'Approved', status: 'Approved' }
  };

  return statuses[statusId] || null;
};

type CCWProps = {
  onChangeControlUpdated?: ((updatedChangeControl?: ChangeControl) => void) | undefined;
  changeControl: ChangeControl & { statusId?: number };
}

export const ChangeControlWorkflow: React.FC<CCWProps> = ({
  onChangeControlUpdated,
  changeControl
}) => {
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [localStatusId, setLocalStatusId] = useState<number>(
    changeControl.workflowHistory?.statusId || 1
  );
  const context = useContext(projectManagementAppContext);

  useEffect(() => {
    setLocalStatusId(changeControl.workflowHistory?.statusId || 1);
  }, [changeControl.workflowHistory?.statusId]);

  const handleWorkflowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowDialogOpen(true);
  };

  const handleWorkflowClose = async (success: boolean = false, updatedCC?: ChangeControl) => {
    setWorkflowDialogOpen(false);
    if (success) {
      // Update status immediately for instant feedback
      const nextStatusId = (changeControl.workflowStatusId || 1) + 1;
      setLocalStatusId(nextStatusId);
      if (onChangeControlUpdated) {
        try {
          await onChangeControlUpdated(updatedCC);
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const getWorkflowButtonText = (workflowId: number) => {
    const workflowStatus = getWorkflowStatusById(workflowId);
    const status = isValidWorkflowStatus(workflowStatus) ? workflowStatus.status : '';
    debugger;
    switch (status) {
      case "Initial":
      case "Review Changes":
        return 'Send for Review';
      case "Sent for Review":
        return 'Decide Review';
      case "Approval Changes":
      case "Sent for Approval":
        if (context?.canProjectCanApprove) {
          return 'Decide Approval';
        } else if (context?.canProjectSubmitForApproval) {
          return 'Send for Approval';
        }
        return '';
      default:
        return 'Send for Review';
    }
  };

  const canShowWorkflowButton = () => {
    debugger;
    if (!context) return false;

    const workflowStatus = getWorkflowStatusById(localStatusId);
    const status = isValidWorkflowStatus(workflowStatus) ? workflowStatus.status : '';
    if (!status || status === "Approved") {
      return false;
    }

    switch (status) {
      case "Initial":
      case "Review Changes":
        return context.canProjectSubmitForReview;
      case "Sent for Review":
        return context.canProjectSubmitForApproval;
      case "Approval Changes":
        return context.canProjectSubmitForApproval;
      case "Sent for Approval":
        return context.canProjectCanApprove;
      default:
        return false;
    }
  };

  const getWorkflowDialog = () => {
    if (!context?.currentUser?.name) return null;

    const workflowStatus = getWorkflowStatusById(localStatusId);
    const status = isValidWorkflowStatus(workflowStatus) ? workflowStatus.status : '';
 debugger;
    switch (status) {
      case "Initial":
      case "Review Changes":
        return (
          <SendForReview
            open={workflowDialogOpen}
            onClose={() => handleWorkflowClose(false)}
            currentUser={context.currentUser.name}
            changeControlId={changeControl.id}
            projectId={changeControl.projectId}
            onSubmit={async () => await handleWorkflowClose(true)}
            onReviewSent={onChangeControlUpdated}
          />
        );
      case "Approval Changes":
      case "Sent for Approval":
        if (context?.canProjectCanApprove) {
          return (
            <DecideApproval
              open={workflowDialogOpen}
              onClose={() => handleWorkflowClose(false)}
              changeControlId={changeControl.id}
              projectId={changeControl.projectId}
              currentUser={context?.currentUser.name}
              onSubmit={async () => await handleWorkflowClose(true)}
            />
          );
        } else if (context?.canSubmitForApproval) {
          return (
            <SendForApproval
              open={workflowDialogOpen}
              onClose={() => handleWorkflowClose(false)}
              changeControlId={changeControl.id}
              projectId={changeControl.projectId}
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
            changeControlId={changeControl.id}
            projectId={changeControl.projectId}
            currentUser={context.currentUser.name}
            onDecisionMade={async (updatedChangeControl) => {
              // If we have the updated change control, use it
              if (updatedChangeControl) {
                await handleWorkflowClose(true, updatedChangeControl);
              } else {
                // Fallback to original behavior
                const nextStatusId = (changeControl.workflowStatusId || 1) + 1;
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

  return (
    <>
      {canShowWorkflowButton() ? (
        <Button
          onClick={handleWorkflowClick}
          size="small"
          color="primary"
          startIcon={<Send />}
        >
          {getWorkflowButtonText(localStatusId)}
        </Button>
      ) : (
        <Chip         
          label={getWorkflowStatusById(localStatusId)?.status}
          color="primary"
          size="medium"
        />
      )}
      {workflowDialogOpen && getWorkflowDialog()}
    </>
  )
}

export default ChangeControlWorkflow;
