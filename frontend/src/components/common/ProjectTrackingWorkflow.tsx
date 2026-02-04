import { Send } from "@mui/icons-material";
import { Button, Chip } from "@mui/material";
import { useContext, useState, useEffect, useMemo } from "react";
import ReviewBox from "../dialogbox/ProjectReviewWorkflow/ReviewBox";
import SendApprovalBox from "../dialogbox/ProjectReviewWorkflow/SendApprovalBox";
import { wbsWorkflowApi } from "../../services/wbsWorkflowApi";
import { projectManagementAppContext } from "../../App";
import { TaskType } from "../../features/wbs/types/wbs";
import { PermissionType } from "../../models/permissionTypeModel";
import { PMWorkflowHistory } from "../../models/pmWorkflowModel";

interface WorkflowDisplayStatus {
  statusId: number;
  name: string;
  status: string;
}


// Define workflow status enum to replace string comparisons
enum WorkflowStatus {
  INITIAL = "Initial",
  SENT_FOR_REVIEW = "Sent for Review",
  REVIEW_CHANGES = "Review Changes",
  SENT_FOR_APPROVAL = "Sent for Approval",
  APPROVAL_CHANGES = "Approval Changes",
  APPROVED = "Approved"
}

// Define workflow action types
type WorkflowAction = "Review" | "Approval" | "Reject" | "Approved";

// Define the workflow payload type
interface WorkflowPayload {
  entityId: number;
  entityType: string;
  assignedToId: string;
  comments: string;
  action: WorkflowAction;
}

export interface ProjectTrackingWorkflowProps { // Export the interface
  projectId: string;
  statusId: number;
  status: string;
  entityId?: number;
  entityType?: string;
  formType?: TaskType;
  onStatusUpdate?: (newStatus: string) => void;
}

export const ProjectTrackingWorkflow: React.FC<ProjectTrackingWorkflowProps> = ({
  projectId,
  statusId,
  status,
  entityId,
  entityType = "Project",
  formType,
  onStatusUpdate
}) => {
  const context = useContext(projectManagementAppContext);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canShowButton, setCanShowButton] = useState(false);

  // Normalize the workflow status
  const normalizedStatus = useMemo(() => {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('initial')) return WorkflowStatus.INITIAL;
    if (statusLower.includes('sent for review')) return WorkflowStatus.SENT_FOR_REVIEW;
    if (statusLower.includes('review changes')) return WorkflowStatus.REVIEW_CHANGES;
    if (statusLower.includes('sent for approval')) return WorkflowStatus.SENT_FOR_APPROVAL;
    if (statusLower.includes('approval changes')) return WorkflowStatus.APPROVAL_CHANGES;
    if (statusLower.includes('approved')) return WorkflowStatus.APPROVED;
    
    // Default to initial if no match
    return WorkflowStatus.INITIAL;
  }, [status,statusId]);

  // Extract permission checks using memoization to avoid recalculating
  const userPermissions = useMemo(() => {
    // Check permissions
    const permissions = context?.currentUser?.roleDetails?.permissions || [];
    const canSubmitForReview = permissions.includes(PermissionType.SUBMIT_PROJECT_FOR_REVIEW);
    // Check only PROJECT-specific permission, not Business Development permission
    const canSubmitForApproval = permissions.includes(PermissionType.SUBMIT_PROJECT_FOR_APPROVAL);
    const canApprove = permissions.includes(PermissionType.APPROVE_PROJECT);

    return {
      canSubmitForReview,
      canSubmitForApproval,
      canApprove
    };
  }, [context?.currentUser]);

  // Determine if button should be shown based on status and user permissions
  useEffect(() => {
    if (!entityId) {
      setCanShowButton(false);
      return;
    }

    // Simplified button visibility logic using the normalized status and permissions
    switch (normalizedStatus) {
      case WorkflowStatus.INITIAL:
      case WorkflowStatus.REVIEW_CHANGES:
        setCanShowButton(userPermissions.canSubmitForReview);
        break;
      case WorkflowStatus.SENT_FOR_REVIEW:
      case WorkflowStatus.APPROVAL_CHANGES:
        setCanShowButton(userPermissions.canSubmitForApproval);
        break;
      case WorkflowStatus.SENT_FOR_APPROVAL:
        setCanShowButton(userPermissions.canApprove);
        break;
      case WorkflowStatus.APPROVED:
        setCanShowButton(false);
        break;
      default:
        setCanShowButton(false);
    }
  }, [normalizedStatus, userPermissions, entityId]);

  const handleWorkflowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowDialogOpen(true);
  };

  const handleWorkflowClose = () => {
    setWorkflowDialogOpen(false);
  };

  // Optimized for clarity: directly uses permission checks to control workflow actions
  const handleSubmit = async (payload: any) => {
    if (!entityId) {
      console.error("Entity ID is required for workflow actions");
      setWorkflowDialogOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      let response: PMWorkflowHistory | undefined;

      // Prepare the request based on the action
      const request: WorkflowPayload = {
        entityId,
        entityType,
        assignedToId: payload.AssignedTo,
        comments: payload.comments || "",
        action: payload.Action
      };

      // Call the appropriate API endpoint based on the action
      switch (payload.Action) {
        case "Review":
          response = await wbsWorkflowApi.sendToReview(request);
          if (onStatusUpdate) onStatusUpdate(WorkflowStatus.SENT_FOR_REVIEW);
          break;
        case "Approval":
          response = await wbsWorkflowApi.sendToApproval(request);
          if (onStatusUpdate) onStatusUpdate(WorkflowStatus.SENT_FOR_APPROVAL);
          break;
        case "Reject":
          response = await wbsWorkflowApi.requestChanges({
            entityId: request.entityId,
            entityType: request.entityType,
            comments: request.comments,
            assignedToId: payload.AssignedTo,
            isApprovalChanges: normalizedStatus === WorkflowStatus.SENT_FOR_APPROVAL,
            action: "Reject"
          });
          if (onStatusUpdate) {
            onStatusUpdate(normalizedStatus === WorkflowStatus.SENT_FOR_APPROVAL 
              ? WorkflowStatus.APPROVAL_CHANGES 
              : WorkflowStatus.REVIEW_CHANGES);
          }
          break;
        case "Approved":
          response = await wbsWorkflowApi.approve(request);
          if (onStatusUpdate) onStatusUpdate(WorkflowStatus.APPROVED);
          break;
        default:
          console.error("Unknown action:", payload.Action);
      }

      // Refresh the status after a successful workflow action
      setTimeout(() => {
        if (onStatusUpdate && response?.status) {
          onStatusUpdate(response.status);
        }
      }, 1000);
    } catch (error) {
      console.error("Error in workflow action:", error);
      alert("An error occurred while processing your request. Please try again.");
    } finally {
      setIsSubmitting(false);
      setWorkflowDialogOpen(false);
    }
  };

  
  // Get button text based on current status
  const getWorkflowButtonText = () => {

    switch (normalizedStatus) {
      case WorkflowStatus.INITIAL:
      case WorkflowStatus.REVIEW_CHANGES:
        return "Send for Review";
      case WorkflowStatus.SENT_FOR_REVIEW:
      case WorkflowStatus.APPROVAL_CHANGES:
        return "Decide Review";
      case WorkflowStatus.SENT_FOR_APPROVAL:
        return "Decide Approval";
      default:
        return "Send for Review";
    }
  };

  const getWorkflowStatusById = (statusId: number): WorkflowDisplayStatus | null => {
  const statuses: Record<number, WorkflowDisplayStatus> = {
    1: { statusId: 1, name: 'Initial', status: 'Initial' },
    2: { statusId: 2, name: 'Sent for Review', status: 'Sent for Review' },
    3: { statusId: 3, name: 'Review Changes', status: 'Review Changes' },
    4: { statusId: 4, name: 'Sent for Approval', status: 'Sent for Approval' },
    5: { statusId: 5, name: 'Approval Changes', status: 'Approval Changes' },
    6: { statusId: 6, name: 'Approved', status: 'Approved' }
  };
  return statuses[statusId] || null;
};


  // Get the appropriate dialog based on current status
  const getWorkflowDialog = () => {
    switch (normalizedStatus) {
      case WorkflowStatus.INITIAL:
      case WorkflowStatus.REVIEW_CHANGES:
        return (
          <ReviewBox
            open={workflowDialogOpen}
            onClose={handleWorkflowClose}
            onSubmit={handleSubmit}
            entityId={entityId}
            entityType={entityType}
            formType={formType}
          />
        );
      case WorkflowStatus.SENT_FOR_REVIEW:
      case WorkflowStatus.APPROVAL_CHANGES:
        return (
          <SendApprovalBox
            open={workflowDialogOpen}
            onClose={handleWorkflowClose}
            onSubmit={handleSubmit}
            status={WorkflowStatus.SENT_FOR_REVIEW}
            projectId={projectId}
            entityId={entityId}
            entityType={entityType}
            formType={formType}
          />
        );
      case WorkflowStatus.SENT_FOR_APPROVAL:
        return (
          <SendApprovalBox
            open={workflowDialogOpen}
            onClose={handleWorkflowClose}
            onSubmit={handleSubmit}
            status={WorkflowStatus.SENT_FOR_APPROVAL}
            projectId={projectId}
            entityId={entityId}
            entityType={entityType}
            formType={formType}
          />
        );
      default:
        // Default to ReviewBox for any unhandled status
        return (
          <ReviewBox
            open={workflowDialogOpen}
            onClose={handleWorkflowClose}
            onSubmit={handleSubmit}
            entityId={entityId}
            entityType={entityType}
            formType={formType}
          />
        );
    }
  };

  return (
    <>
      {canShowButton ? (
        <Button
          onClick={handleWorkflowClick}
          variant="outlined"
          size="small"
          color="primary"
          startIcon={<Send />}
          disabled={isSubmitting}
        >
          {getWorkflowButtonText()}
        </Button>
      ):(
        <Chip         
          label={getWorkflowStatusById(statusId)?.status}
          color="primary"
          size="medium"
        />
      )}
      {workflowDialogOpen && getWorkflowDialog()}
    </>
  );
   
};