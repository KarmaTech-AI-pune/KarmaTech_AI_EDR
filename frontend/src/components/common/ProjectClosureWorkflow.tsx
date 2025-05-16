import { Button } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useState, useContext, useEffect } from 'react';
import { projectManagementAppContext } from '../../App';
import { ProjectClosureRow } from '../../models/projectClosureRowModel';
import {
  SendForReview,
  DecideReview,
  SendForApproval,
  DecideApproval
} from '../dialogbox/projectclosure';

interface WorkflowStatus {
  id: number;
  name: string;
  status: string;
}

const isValidWorkflowStatus = (status: unknown): status is WorkflowStatus => {
  return status !== null &&
    typeof status === 'object' &&
    'status' in status &&
    typeof (status as Record<string, unknown>).status === 'string';
};

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

type PCWProps = {
  onProjectClosureUpdated?: ((updatedClosure?: ProjectClosureRow) => void) | undefined;
  projectClosure: ProjectClosureRow & { workflowStatusId?: number; id?: number; };
}

export const ProjectClosureWorkflow: React.FC<PCWProps> = ({
  onProjectClosureUpdated,
  projectClosure
}) => {
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [localStatusId, setLocalStatusId] = useState<number>(
    projectClosure.workflowStatusId || 1
  );
  const context = useContext(projectManagementAppContext);

  useEffect(() => {
    setLocalStatusId(projectClosure.workflowStatusId || 1);
  }, [projectClosure.workflowStatusId]);

  useEffect(() => {
    console.log('canProjectSubmitForReview:', context?.canProjectSubmitForReview);
    console.log('workflowStatusId:', localStatusId);
  }, [context, localStatusId]);

  const handleWorkflowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowDialogOpen(true);
  };

  const handleWorkflowClose = async (success: boolean = false, updatedClosure?: ProjectClosureRow) => {
    setWorkflowDialogOpen(false);
    if (success) {
      // Update status immediately for instant feedback
      const nextStatusId = (projectClosure.workflowStatusId || 1) + 1;
      setLocalStatusId(nextStatusId);
      if (onProjectClosureUpdated) {
        try {
          await onProjectClosureUpdated(updatedClosure);
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
    switch (status) {
      case "Initial":
      case "Review Changes":
        return (
          <SendForReview
            open={workflowDialogOpen}
            onClose={() => handleWorkflowClose(false)}
            currentUser={context.currentUser.name}
            projectClosureId={projectClosure.id}
            projectId={projectClosure.projectId ? Number(projectClosure.projectId) : undefined}
            onSubmit={async () => await handleWorkflowClose(true)}
            onReviewSent={onProjectClosureUpdated}
          />
        );
      case "Approval Changes":
      case "Sent for Approval":
        if (context?.canProjectCanApprove) {
          return (
            <DecideApproval
              open={workflowDialogOpen}
              onClose={() => handleWorkflowClose(false)}
              projectClosureId={projectClosure.id}
              projectId={projectClosure.projectId ? Number(projectClosure.projectId) : undefined}
              currentUser={context?.currentUser.name}
              onSubmit={async () => await handleWorkflowClose(true)}
            />
          );
        } else if (context?.canProjectSubmitForApproval) {
          return (
            <SendForApproval
              open={workflowDialogOpen}
              onClose={() => handleWorkflowClose(false)}
              projectClosureId={projectClosure.id}
              projectId={projectClosure.projectId ? Number(projectClosure.projectId) : undefined}
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
            projectClosureId={projectClosure.id}
            projectId={projectClosure.projectId ? Number(projectClosure.projectId) : undefined}
            currentUser={context.currentUser.name}
            onDecisionMade={async () => await handleWorkflowClose(true)}
          />
        );
      default:
        return null;
    }
  };

  if (!canShowWorkflowButton()) return null;

  return (
    <>
      <Button
        onClick={handleWorkflowClick}
        size="small"
        color="primary"
        startIcon={<Send />}
        disabled={!context?.currentUser?.name}
      >
        {getWorkflowButtonText(localStatusId)}
      </Button>
      {workflowDialogOpen && getWorkflowDialog()}
    </>
  );
};

export default ProjectClosureWorkflow; 