import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormHelperText,
  Backdrop,
  CircularProgress,
  Box,
  Typography
} from "@mui/material";
import { getUserById } from "../../../services/userApi";
import { HistoryLoggingService } from "../../../services/historyLoggingService";
import { projectManagementAppContext } from "../../../App";

interface ProjectSendForReviewProps {
  open: boolean;
  onClose: () => void;
  currentUser: string;
  projectId?: number;
  onSubmit?: () => Promise<void>;
  onReviewSent?: () => Promise<void>;
}

const SendForReview: React.FC<ProjectSendForReviewProps> = ({
  open,
  onClose,
  currentUser,
  projectId,
  onSubmit,
  onReviewSent
}) => {
  const context = useContext(projectManagementAppContext);
  const [error, setError] = useState<string | null>(null);
  const [seniorPM, setSeniorPM] = useState<string | null>(null);
  const [seniorPMId, setSeniorPMId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSeniorPM = async () => {
      try {
        setIsLoading(true);

        // Get the Senior Project Manager ID from the selected project in context
        const selectedProject = context?.selectedProject;
        if (!selectedProject) {
          setError("No project selected");
          setIsLoading(false);
          return;
        }

        // Check if selectedProject is a Project type (has seniorProjectManagerId)
        let spManagerId: string | null = null;

        if ('seniorProjectManagerId' in selectedProject) {
          spManagerId = selectedProject.seniorProjectManagerId;
          if (!spManagerId) {
            setError("No Senior Project Manager assigned to this project");
            setIsLoading(false);
            return;
          }
        } else {
          setError("Selected item is not a project");
          setIsLoading(false);
          return;
        }

        setSeniorPMId(spManagerId);

        // Get the Senior Project Manager details
        try {
          const seniorPMUser = await getUserById(spManagerId);
          if (seniorPMUser) {
            setSeniorPM(seniorPMUser.name);
          } else {
            setError("Senior Project Manager not found");
          }
        } catch (err) {
          console.error("Error fetching Senior PM details:", err);
          setError("Failed to fetch Senior Project Manager details");
        }
      } catch (err) {
        console.error("Error in fetchSeniorPM:", err);
        setError("Failed to fetch Senior Project Manager information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeniorPM();
  }, [context?.selectedProject]);

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    const selectedProject = context?.selectedProject;
    if (!selectedProject) {
      setError("No project selected");
      return;
    }

    // Use the projectId from props if available, otherwise from context
    const projectIdToUse = projectId || (selectedProject.id ? Number(selectedProject.id) : undefined);
    if (!projectIdToUse) {
      setError("Project ID is missing");
      return;
    }

    if (!currentUser) {
      setError("Current user information is missing");
      return;
    }

    if (!seniorPMId) {
      setError("Senior Project Manager information is missing");
      return;
    }

    try {
      setIsLoading(true);

      // In a real implementation, you would call your API to update the WBS status
      // For example:
      // await wbsApi.sendForReview({
      //   projectId: projectId,
      //   reviewerId: seniorPMId,
      //   comments: `Sent for review by ${currentUser}`
      // });

      // Log the review request
      await HistoryLoggingService.logCustomEvent(
        projectIdToUse,
        "WBS Manpower Sent for Review",
        currentUser,
        `Sent to ${seniorPM} for review`
      );

      // Reset dialog state
      setError(null);

      // Call callbacks in correct order with await to ensure proper sequence
      if (onSubmit) {
        await onSubmit(); // Wait for status update in parent
      }
      if (onReviewSent) {
        await onReviewSent(); // Wait for refresh to complete
      }
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : "Failed to send for review";
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
      <DialogTitle>Senior Project Manager</DialogTitle>
      <DialogContent onClick={stopEventPropagation}>
        <FormControl
          fullWidth
          margin="normal"
          error={!!error}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography>Loading Senior Project Manager...</Typography>
            </Box>
          ) : seniorPM ? (
            <Typography
              variant="body1"
              sx={{
                fontSize: "16px",
                padding: "8px 0",
                textAlign: "center"
              }}
            >
              Send to {seniorPM} for review?
            </Typography>
          ) : (
            <Typography
              variant="body1"
              sx={{
                fontSize: "16px",
                padding: "8px 0",
                textAlign: "center",
                color: "error.main"
              }}
            >
              {error || "Loading Senior Project Manager..."}
            </Typography>
          )}

          {error && !error.includes("Senior Project Manager") && (
            <FormHelperText error>
              {error}
            </FormHelperText>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions onClick={stopEventPropagation}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!seniorPM || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isLoading ? 'Sending...' : 'OK'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendForReview;
