import { Button } from "@mui/material";
import { Send } from "@mui/icons-material";
import { useContext, useState } from "react";
import { projectManagementAppContext } from "../../../App";
import ProjectSendForReview from "./ProjectSendForReview";
import ProjectDecideApproval from "./ProjectDecideApproval";
import ProjectSendForApproval from "./ProjectSendForApproval";
import ProjectDecideReview from "./ProjectDecideReview";

type PTWProps = {
  statusId: string;
  projectId?: number;
  onStatusUpdate?: (newStatus: string) => void;
};

export const ProjectTrackingWorkflow: React.FC<PTWProps> = ({
  statusId,
  projectId,
  onStatusUpdate
}) => {
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(statusId);

  const context = useContext(projectManagementAppContext);

  const handleWorkflowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflowDialogOpen(true);
  };

  const handleWorkflowClose = async (updated = false) => {
    setWorkflowDialogOpen(false);
    if (updated && onStatusUpdate) {
      // In a real implementation, you would fetch the updated status from the API
      // For now, we'll simulate status updates based on the current status
      let newStatus = currentStatus;

      switch (currentStatus) {
        case "Initial":
          newStatus = "Sent for Review";
          break;
        case "Review Changes":
          newStatus = "Sent for Review";
          break;
        case "Sent for Review":
          // This would depend on the decision made in ProjectDecideReview
          // For simplicity, we'll assume approval here
          newStatus = "Sent for Approval";
          break;
        case "Approval Changes":
          newStatus = "Sent for Approval";
          break;
        case "Sent for Approval":
          // This would depend on the decision made in ProjectDecideApproval
          // For simplicity, we'll assume approval here
          newStatus = "Approved";
          break;
        default:
          break;
      }

      setCurrentStatus(newStatus);
      onStatusUpdate(newStatus);
    }
  };

  const getWorkflowButtonText = (statusId: string) => {
    const status = statusId;
    switch (status) {
      case "Initial":
      case "Review Changes":
        return "Send for Review";
      case "Sent for Review":
        return "Decide Review";
      case "Approval Changes":
        return "Send for Approval";
      case "Sent for Approval":
        return "Decide Approval";
      case "Approved":
        return "Approved";
      case "Rejected":
        return "Rejected";
      default:
        return "Send for Review";
    }
  };

  const getWorkflowDialog = () => {
    if (!context?.currentUser?.name) return null;
    const status = statusId;

    // Determine user role for conditional rendering
    const isPM = true; // In a real implementation, check if user is PM
    const isSPM = true; // In a real implementation, check if user is SPM
    const isRMRD = true; // In a real implementation, check if user is RM/RD

    switch (status) {
      case "Initial":
      case "Review Changes":
        // Only PM can send for review
        if (isPM) {
          return (
            <ProjectSendForReview
              open={workflowDialogOpen}
              onClose={() => handleWorkflowClose()}
              currentUser={context.currentUser.name}
              projectId={projectId}
              onSubmit={async () => await handleWorkflowClose(true)}
            />
          );
        }
        return null;

      case "Sent for Review":
        // Only SPM can decide review
        if (isSPM) {
          return (
            <ProjectDecideReview
              open={workflowDialogOpen}
              onClose={(updated) => handleWorkflowClose(updated)}
              projectId={projectId}
              currentUser={context.currentUser.name}
              onDecisionMade={async () => {
                await handleWorkflowClose(true);
              }}
            />
          );
        }
        return null;

      case "Approval Changes":
        // Only SPM can send for approval
        if (isSPM) {
          return (
            <ProjectSendForApproval
              open={workflowDialogOpen}
              onClose={() => handleWorkflowClose()}
              projectId={projectId}
              currentUser={context.currentUser.name}
              onSubmit={async () => await handleWorkflowClose(true)}
            />
          );
        }
        return null;

      case "Sent for Approval":
        // Only RM/RD can decide approval
        if (isRMRD) {
          return (
            <ProjectDecideApproval
              open={workflowDialogOpen}
              onClose={(updated) => handleWorkflowClose(updated)}
              projectId={projectId}
              currentUser={context.currentUser.name}
              onSubmit={async () => await handleWorkflowClose(true)}
            />
          );
        }
        return null;

      default:
        return null;
    }
  };

  // Don't show workflow button for final states
  const isFinalState = statusId === "Approved" || statusId === "Rejected";

  return (
    <>
      {!isFinalState && (
        <Button
          onClick={handleWorkflowClick}
          size="small"
          color="primary"
          startIcon={<Send />}
          disabled={!context?.currentUser?.name}
        >
          {getWorkflowButtonText(statusId)}
        </Button>
      )}

      {workflowDialogOpen && getWorkflowDialog()}
    </>
  );
};
