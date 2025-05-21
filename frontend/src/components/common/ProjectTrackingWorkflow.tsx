import { Send } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import ReviewBox from "../dialogbox/ProjectReviewWorkflow/ReviewBox";
import SendApprovalBox from "../dialogbox/ProjectReviewWorkflow/SendApprovalBox";
import { wbsWorkflowApi } from "../../services/wbsWorkflowApi";
import { projectManagementAppContext } from "../../App";
import { TaskType } from "../../types/wbs";
import { PermissionType } from "../../models/permissionTypeModel";
import { PMWorkflowHistory } from "../../models/pmWorkflowModel";

interface ProjectTrackingWorkflowProps {
  projectId: string;
  status: string;
  entityId?: number;
  entityType?: string;
  formType?: TaskType;
  onStatusUpdate?: (newStatus: string) => void;
}

export const ProjectTrackingWorkflow: React.FC<ProjectTrackingWorkflowProps> = ({
  projectId,
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

  // Check user roles
  const isPM = context?.currentUser?.roles?.some(role => role.name === 'Project Manager') || false;
  const isSPM = context?.currentUser?.roles?.some(role => role.name === 'Senior Project Manager') || false;
  const isRMRD = context?.currentUser?.roles?.some(role =>
    role.name === 'Regional Manager' || role.name === 'Regional Director'
  ) || false;

  // Log user roles for debugging
  console.log("User roles:", context?.currentUser?.roles);

  // Check permissions
  const canSubmitForReview = context?.currentUser?.roleDetails?.permissions.includes(PermissionType.SUBMIT_PROJECT_FOR_REVIEW) || false;

  // Check for both SUBMIT_PROJECT_FOR_APPROVAL and SUBMIT_FOR_APPROVAL permissions
  // This is because SPMs have SUBMIT_FOR_APPROVAL but not SUBMIT_PROJECT_FOR_APPROVAL
  const canSubmitForApproval =
    context?.currentUser?.roleDetails?.permissions.includes(PermissionType.SUBMIT_PROJECT_FOR_APPROVAL) ||
    context?.currentUser?.roleDetails?.permissions.includes(PermissionType.SUBMIT_FOR_APPROVAL) ||
    false;

  const canApprove = context?.currentUser?.roleDetails?.permissions.includes(PermissionType.APPROVE_PROJECT) || false;

  // Log permissions for debugging
  console.log("User permissions:", {
    canSubmitForReview,
    canSubmitForApproval,
    canApprove,
    hasSubmitProjectForApproval: context?.currentUser?.roleDetails?.permissions.includes(PermissionType.SUBMIT_PROJECT_FOR_APPROVAL),
    hasSubmitForApproval: context?.currentUser?.roleDetails?.permissions.includes(PermissionType.SUBMIT_FOR_APPROVAL),
    allPermissions: context?.currentUser?.roleDetails?.permissions
  });

  // Determine if button should be shown based on status and user role/permissions
  useEffect(() => {
    // Normalize status for case-insensitive comparison
    const normalizedStatus = status?.toLowerCase() || '';

    console.log("ProjectTrackingWorkflow - Status:", status);
    console.log("ProjectTrackingWorkflow - Normalized Status:", normalizedStatus);
    console.log("ProjectTrackingWorkflow - User Roles:", {
      isPM,
      isSPM,
      isRMRD,
      canSubmitForReview,
      canSubmitForApproval,
      canApprove
    });
    console.log("ProjectTrackingWorkflow - Entity ID:", entityId);

    // Check if the status contains the key phrases rather than exact matching
    const isInitialOrReviewChanges = normalizedStatus.includes('initial') || normalizedStatus.includes('review changes');
    const isSentForReview = normalizedStatus.includes('sent for review');
    const isApprovalChanges = normalizedStatus.includes('approval changes');
    const isSentForApproval = normalizedStatus.includes('sent for approval');
    const isApproved = normalizedStatus.includes('approved');

    console.log("Status checks:", {
      isInitialOrReviewChanges,
      isSentForReview,
      isApprovalChanges,
      isSentForApproval,
      isApproved
    });

    // Determine button visibility based on status and role/permissions
    if (isApproved) {
      // For "Approved" status, never show the button
      setCanShowButton(false);
      console.log("Button visibility for Approved: false (button should be hidden)");
    }
    else if (isInitialOrReviewChanges) {
      setCanShowButton(isPM && canSubmitForReview);
      console.log("Button visibility for Initial/Review Changes:", isPM && canSubmitForReview);
    }
    else if (isSentForReview) {
      // For "Sent for Review" status, show the button if the user is an SPM
      // This is a special case to ensure SPMs can see the "Decide Review" button
      setCanShowButton(isSPM);
      console.log("Button visibility for Sent for Review:", isSPM, "isSPM:", isSPM);
    }
    else if (isApprovalChanges) {
      // For "Approval Changes" status, show the button if the user is an SPM
      // This is a special case to ensure SPMs can see the "Decide Review" button
      setCanShowButton(isSPM);
      console.log("Button visibility for Approval Changes:", isSPM, "isSPM:", isSPM);
    }
    else if (isSentForApproval) {
      setCanShowButton(isRMRD && canApprove);
      console.log("Button visibility for Sent for Approval:", isRMRD && canApprove);
    }
    else {
      console.log("ProjectTrackingWorkflow - Unhandled status:", status);
      setCanShowButton(false);
    }
  }, [status, isPM, isSPM, isRMRD, canSubmitForReview, canSubmitForApproval, canApprove, entityId]);

  const handleWorkflowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowDialogOpen(true);
  };

  const handleWorkflowClose = () => {
    setWorkflowDialogOpen(false);
  };

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
      const request = {
        entityId,
        entityType,
        assignedToId: payload.AssignedTo,
        comments: payload.comments || "", // Changed from comment to comments to match backend expectation
        action: payload.Action
      };


      // Call the appropriate API endpoint based on the action
      switch (payload.Action) {
        case "Review":
          response = await wbsWorkflowApi.sendToReview(request);
          console.log("Send to Review response:", response);
          if (onStatusUpdate) onStatusUpdate("Sent for Review");
          break;
        case "Approval":
          response = await wbsWorkflowApi.sendToApproval(request);
          console.log("Send to Approval response:", response);
          if (onStatusUpdate) onStatusUpdate("Sent for Approval");
          break;
        case "Reject":
          // Make sure we're passing the assignedToId correctly
          console.log("Reject payload:", payload);
          console.log("Reject request:", request);

          response = await wbsWorkflowApi.requestChanges({
            entityId: request.entityId,
            entityType: request.entityType,
            comments: request.comments,
            assignedToId: payload.AssignedTo, // Explicitly use the AssignedTo from the payload
            isApprovalChanges: status === "Sent for Approval",
            action: "Reject"
          });
          console.log("Request Changes response:", response);
          if (onStatusUpdate) onStatusUpdate(status === "Sent for Approval" ? "Approval Changes" : "Review Changes");
          break;
        case "Approved":
          try {
            response = await wbsWorkflowApi.approve(request);
            if (onStatusUpdate) onStatusUpdate("Approved");
          } catch (error: any) {
            console.error("Error in approve API call:", error);
            // Try to get more details about the error
            if (error.response) {
              console.error("Error response data:", error.response.data);
              console.error("Error response status:", error.response.status);
              console.error("Error response headers:", error.response.headers);
            }
            throw error;
          }
          break;
        default:
          console.error("Unknown action:", payload.Action);
      }

      console.log("Workflow response:", response);

      // Refresh the status after a successful workflow action
      setTimeout(() => {
        if (onStatusUpdate) {
          console.log("Refreshing status after workflow action");
          // This will trigger a refresh in the parent component
          onStatusUpdate(response?.status || "");
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

  const getWorkflowButtonText = () => {
    // Normalize status for case-insensitive comparison
    const normalizedStatus = status?.toLowerCase() || '';
    console.log("Getting button text for status:", status, "normalized:", normalizedStatus);

    // Check if the status contains the key phrases rather than exact matching
    if (normalizedStatus.includes('initial') || normalizedStatus.includes('review changes')) {
      return "Send for Review";
    }
    else if (normalizedStatus.includes('sent for review')) {
      return "Decide Review";
    }
    else if (normalizedStatus.includes('approval changes')) {
      return "Decide Review";
    }
    else if (normalizedStatus.includes('sent for approval')) {
      return "Decide Approval";
    }
    else {
      console.log("Using default button text for status:", status);
      return "Send for Review";
    }
  };

  const getWorkflowDialog = () => {
    // Normalize status for case-insensitive comparison
    const normalizedStatus = status?.toLowerCase() || '';
    console.log("Getting workflow dialog for status:", status, "normalized:", normalizedStatus);

    // Check if the status contains the key phrases rather than exact matching
    if (normalizedStatus.includes('initial') || normalizedStatus.includes('review changes')) {
      console.log("Showing ReviewBox for Initial/Review Changes");
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
    else if (normalizedStatus.includes('sent for review')) {
      console.log("Showing SendApprovalBox for Sent for Review");
      return (
        <SendApprovalBox
          open={workflowDialogOpen}
          onClose={handleWorkflowClose}
          onSubmit={handleSubmit}
          status="Sent for Review"
          projectId={projectId}
          entityId={entityId}
          entityType={entityType}
          formType={formType}
        />
      );
    }
    else if (normalizedStatus.includes('approval changes')) {
      console.log("Showing SendApprovalBox for Approval Changes");
      return (
        <SendApprovalBox
          open={workflowDialogOpen}
          onClose={handleWorkflowClose}
          onSubmit={handleSubmit}
          status="Sent for Review"
          projectId={projectId}
          entityId={entityId}
          entityType={entityType}
          formType={formType}
        />
      );
    }
    else if (normalizedStatus.includes('sent for approval')) {
      console.log("Showing SendApprovalBox for Sent for Approval");
      return (
        <SendApprovalBox
          open={workflowDialogOpen}
          onClose={handleWorkflowClose}
          onSubmit={handleSubmit}
          status="Sent for Approval"
          projectId={projectId}
          entityId={entityId}
          entityType={entityType}
          formType={formType}
        />
      );
    }
    else {
      // Default to ReviewBox for any unhandled status
      console.log("Showing default ReviewBox for unhandled status:", status);
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
      {canShowButton && (
        <Button
          onClick={handleWorkflowClick}
          variant="outlined"
          size="small"
          color="primary"
          startIcon={<Send />}
        >
          {getWorkflowButtonText()}
        </Button>
      )}
      {workflowDialogOpen && getWorkflowDialog()}
    </>
  );
};
