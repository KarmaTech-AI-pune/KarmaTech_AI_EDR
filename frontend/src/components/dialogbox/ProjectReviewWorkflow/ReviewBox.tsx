import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  CircularProgress,
  Typography
} from "@mui/material";
import { projectManagementAppContext } from "../../../App";
import { Project } from "../../../models";
import { getUserById } from "../../../services/userApi";
import { TaskType } from "../../../types/wbs";

interface ReviewBoxProps {
  open: boolean;
  onClose: () => void;
  status?: string;
  onSubmit?: (payload: any) => void;
  entityId?: number;
  entityType?: string;
  formType?: TaskType;
}

interface ManagerData {
  [key: string]: string;
}

const ReviewBox: React.FC<ReviewBoxProps> = ({
  open,
  onClose,
  onSubmit,
  entityId,
  entityType = "Project",
  formType
}) => {
  const context = useContext(projectManagementAppContext);
  const [reviewer, setReviewer] = useState<ManagerData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManagerData = async () => {
      if (!context?.selectedProject) {
        setLoading(false);
        return;
      }

      const project = context.selectedProject as Project;
      const managerIds = [
        project.projectManagerId,
        project.seniorProjectManagerId,
        project.regionalManagerId
      ].filter(Boolean);
      
      if (managerIds.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const fetchedNames: ManagerData = {};

        // Use Promise.all for parallel fetching
        await Promise.all(managerIds.map(async (id) => {
          try {
            const userData = await getUserById(id);
            if (userData) {
              fetchedNames[id] = userData.name;
            }
          } catch (err) {
            console.error(`Error fetching user with ID ${id}:`, err);
            fetchedNames[id] = 'Not assigned';
          }
        }));

        setReviewer(fetchedNames);
        setError(null);
      } catch (err) {
        console.error('Error fetching manager data:', err);
        setError('Failed to load reviewer data');
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchManagerData();
    }
  }, [context?.selectedProject, open]);

  const getReviewerName = (managerId: string) => {
    if (!managerId) return 'Not assigned';
    return reviewer[managerId] || 'Loading...';
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!context?.selectedProject?.id) {
      setError('No project selected');
      return;
    }

    if (!context?.currentUser?.id) {
      setError('No current user');
      return;
    }

    // Get the senior project manager ID from the project
    const seniorProjectManagerId = context.selectedProject && 'seniorProjectManagerId' in context.selectedProject
      ? context.selectedProject.seniorProjectManagerId
      : '';

    if (!seniorProjectManagerId) {
      setError('No senior project manager assigned');
      return;
    }

    // Prepare the payload for sending the form for review
    const payload = {
      statusId: 2,
      Action: "Review", // Changed from "Sent for Review" to match the backend action
      comments: "", // Changed from 'comment' to 'comments' to match backend expectation
      ActionBy: context.currentUser?.id || '',
      AssignedTo: seniorProjectManagerId,
      entityId: entityId,
      entityType: entityType,
      formType: formType
    };

    // Pass the payload to the parent component
    if (onSubmit) {
      onSubmit(payload);
    }

    // Close the dialog
    onClose();
  };

  const stopEventPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  // Get the reviewer name
  const reviewerName = context?.selectedProject && 'seniorProjectManagerId' in context.selectedProject
    ? getReviewerName(context.selectedProject.seniorProjectManagerId || '')
    : 'Not assigned';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      onClick={stopEventPropagation}
      onKeyDown={stopEventPropagation}
      sx={{
        "& .MuiDialog-paper": {
          position: "relative",
        },
        zIndex: 1300,
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }
      }}
      PaperProps={{
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        },
        onClick: stopEventPropagation,
      }}
    >
      <DialogTitle>Send For Review</DialogTitle>
      <DialogContent onClick={stopEventPropagation}>
        <FormControl
          fullWidth
          margin="normal"
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Loading reviewer information...
              </Typography>
            </div>
          ) : error ? (
            <Typography color="error" align="center">
              {error}
            </Typography>
          ) : (
            <div style={{ textAlign: "center" }}>
              Send to {reviewerName} for approval
            </div>
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
          disabled={loading || !!error || reviewerName === 'Not assigned'}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewBox;