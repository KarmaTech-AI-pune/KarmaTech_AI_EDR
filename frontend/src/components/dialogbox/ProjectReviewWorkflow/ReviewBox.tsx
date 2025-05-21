import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
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

const ReviewBox: React.FC<ReviewBoxProps> = ({
  open,
  onClose,
  onSubmit,
  entityId,
  entityType = "Project",
  formType
}) => {
  const context = useContext(projectManagementAppContext);
  const [reviewer, setReviewer] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchManagerData = async () => {
          if (!context?.selectedProject) return;

          const project = context.selectedProject as Project;
          const managerIds = [
            project.projectManagerId,
            project.seniorProjectManagerId,
            project.regionalManagerId
          ].filter(Boolean);
          if (managerIds.length === 0) return;
          try {
            const fetchedNames: {[key: string]: string} = {};

            for (const id of managerIds) {
              try {
                const userData = await getUserById(id);
                if (userData) {
                  fetchedNames[id] = userData.name;
                }
              } catch (err) {
                console.error(`Error fetching user with ID ${id}:`, err);
                fetchedNames[id] = 'Not assigned';
              }
            }
            setReviewer(fetchedNames);
          } catch (err) {
            console.error('Error fetching manager data:', err);
          }
        }
        fetchManagerData();
  }, []);

  const getReviewerName = (managerId: string) => {
    if (!managerId) return 'Not assigned';
    return reviewer[managerId] || 'Loading...';
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = () => {
    if (!context?.selectedProject?.id) {
      console.error('No project selected');
      return;
    }

    if (!context?.currentUser?.id) {
      console.error('No current user');
      return;
    }

    // Get the senior project manager ID from the project
    const seniorProjectManagerId = context.selectedProject && 'seniorProjectManagerId' in context.selectedProject
      ? context.selectedProject.seniorProjectManagerId
      : '';

    if (!seniorProjectManagerId) {
      console.error('No senior project manager assigned');
      return;
    }

    console.log("ReviewBox - Submitting review with entity ID:", entityId, "and entity type:", entityType);

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

    console.log("ReviewBox - Prepared payload:", payload);

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
          position: "relative",
        },
        zIndex: 1300, // Standard MUI dialog z-index
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
          <div style={{ textAlign:"center" }}>Send to {getReviewerName(context?.selectedProject && 'seniorProjectManagerId' in context.selectedProject ? context.selectedProject.seniorProjectManagerId || '' : '')} for approval</div>
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
          // disabled={!selectedReviewer}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewBox;
