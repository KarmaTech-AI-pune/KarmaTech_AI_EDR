import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormHelperText,
  Backdrop,
  TextField
} from "@mui/material";
import { getUserById } from "../../../services/userApi";
import { HistoryLoggingService } from "../../../services/historyLoggingService";

interface ProjectSendForApprovalProps {
  open: boolean;
  onClose: () => void;
  projectId?: number;
  currentUser: string;
  onSubmit?: () => Promise<void>;
}

const SendForApproval: React.FC<ProjectSendForApprovalProps> = ({
  open,
  onClose,
  projectId,
  currentUser,
  onSubmit
}) => {
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<string>("");
  const [regionalManager, setRegionalManager] = useState<string | null>(null);
  const [regionalManagerId, setRegionalManagerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchRegionalManager = async () => {
      if (projectId) {
        try {
          setIsLoading(true);
          // In a real implementation, you would fetch the project details to get the Regional Manager
          // For now, we'll simulate this with a placeholder
          // const project = await projectApi.getById(projectId);
          // const regionalManagerId = project.regionalManagerId;

          // Placeholder - replace with actual API call
          const regionalManagerId = "regional-manager-id"; // This would come from your project data
          setRegionalManagerId(regionalManagerId);

          if (regionalManagerId) {
            const regionalManagerUser = await getUserById(regionalManagerId);
            if (regionalManagerUser) {
              setRegionalManager(regionalManagerUser.name);
            } else {
              setError("Regional Manager/Director not found");
            }
          } else {
            setError("No Regional Manager/Director assigned to this project");
          }
        } catch (err) {
          console.error("Error fetching Regional Manager:", err);
          setError("Failed to fetch Regional Manager/Director information");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchRegionalManager();
  }, [projectId]);

  const handleCancel = () => {
    setComments("");
    setError(null);
    onClose();
  };

  const handleCommentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComments(event.target.value);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!projectId) {
      setError("Project ID is missing");
      return;
    }

    if (!currentUser) {
      setError("Current user information is missing");
      return;
    }

    if (!regionalManagerId) {
      setError("Regional Manager/Director information is missing");
      return;
    }

    try {
      setIsLoading(true);

      // In a real implementation, you would call your API to update the WBS status
      // For example:
      // await wbsApi.sendForApproval({
      //   projectId: projectId,
      //   approverId: regionalManagerId,
      //   comments: comments || `Sent for approval by ${currentUser}`
      // });

      // Log the approval request
      await HistoryLoggingService.logCustomEvent(
        projectId,
        "WBS Manpower Sent for Approval",
        currentUser,
        `Sent to ${regionalManager} for approval${comments ? ": " + comments : ""}`
      );

      // Reset dialog state
      setComments("");
      setError(null);

      // Call callback
      if (onSubmit) {
        await onSubmit();
      }
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : "Failed to send for approval";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the dialog if currentUser is not available
  if (!currentUser) {
    return null;
  }

  const stopEventPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      onClick={stopEventPropagation}
      onKeyDown={stopEventPropagation}
      sx={{
        "& .MuiDialog-paper": {
          position: "relative"
        },
        zIndex: 1300 // Standard MUI dialog z-index
      }}
      BackdropComponent={Backdrop}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.5)"
        }
      }}
      PaperProps={{
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        },
        onClick: stopEventPropagation
      }}
    >
      <DialogTitle>Regional Manager/Director</DialogTitle>
      <DialogContent onClick={stopEventPropagation}>
        {regionalManager ? (
          <div style={{
            fontSize: "16px",
            padding: "16px 0",
            textAlign: "center"
          }}>
            Send to <strong>{regionalManager}</strong> for approval?
          </div>
        ) : (
          <div style={{
            fontSize: "16px",
            padding: "16px 0",
            textAlign: "center",
            color: "red"
          }}>
            {error || "Loading Regional Manager/Director..."}
          </div>
        )}

        <TextField
          margin="normal"
          label="Comments (Optional)"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          placeholder="Add any comments for the approver"
          value={comments}
          onChange={handleCommentsChange}
          onClick={stopEventPropagation}
        />

        {error && !error.includes("Regional Manager") && (
          <FormHelperText error>
            {error}
          </FormHelperText>
        )}
      </DialogContent>
      <DialogActions onClick={stopEventPropagation}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!regionalManager || isLoading}
        >
          {isLoading ? "Sending..." : "Send for Approval"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendForApproval;
