import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
  Backdrop
} from "@mui/material";
import { HistoryLoggingService } from "../../../services/historyLoggingService";

type DecisionType = "approve" | "reject";

interface ProjectDecideReviewProps {
  open: boolean;
  onClose: (updated?: boolean) => void;
  projectId?: number;
  currentUser: string;
  onDecisionMade?: (updatedProject?: any) => Promise<void>;
}

const DecideReview: React.FC<ProjectDecideReviewProps> = ({
  open,
  onClose,
  projectId,
  currentUser,
  onDecisionMade
}) => {
  const [decision, setDecision] = useState<DecisionType | "">("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDecisionChange = (event: SelectChangeEvent) => {
    event.stopPropagation();
    setDecision(event.target.value as DecisionType);
    setError(null);
  };

  const handleCommentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setComments(event.target.value);
    setError(null);
  };

  const handleCancel = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDecision("");
    setComments("");
    setError(null);
    onClose();
  };

  const handleDialogClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleSubmit = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!decision) {
      setError("Please select a decision");
      return;
    }

    if (!comments.trim()) {
      setError("Please provide comments");
      return;
    }

    if (!projectId) {
      setError("Project ID is missing");
      return;
    }

    if (!currentUser) {
      setError("Current user information is missing");
      return;
    }

    try {
      setIsLoading(true);

      // In a real implementation, you would call your API to update the WBS status
      // For example:
      // const updatedProject = await wbsApi.decideReview({
      //   projectId: projectId,
      //   decision: decision,
      //   comments: comments,
      //   reviewedBy: currentUser
      // });

      // Log the review decision
      const actionType = decision === "approve"
        ? "WBS Manpower Review Approved"
        : "WBS Manpower Review Rejected";

      await HistoryLoggingService.logCustomEvent(
        projectId,
        actionType,
        currentUser,
        comments
      );

      // Reset form state
      setDecision("");
      setComments("");
      setError(null);

      // Call the callback with the updated project (if available)
      if (onDecisionMade) {
        // In a real implementation, you would pass the updated project data
        await onDecisionMade(/* updatedProject */);
      } else {
        onClose(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : "Failed to submit review decision";
      setError(errorMessage);
      console.error("Error submitting review decision:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      maxWidth="sm"
      fullWidth
      onClick={handleDialogClick}
      sx={{
        "& .MuiDialog-paper": {
          position: "relative"
        },
        zIndex: 1300
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
        onClick: handleDialogClick
      }}
    >
      <DialogTitle onClick={handleDialogClick}>Decide Review</DialogTitle>
      <DialogContent onClick={handleDialogClick}>
        <FormControl
          fullWidth
          margin="normal"
          error={!!error && !decision}
          onClick={handleDialogClick}
        >
          <InputLabel>Decision</InputLabel>
          <Select
            label="Decision"
            value={decision}
            onChange={handleDecisionChange}
            onClick={handleDialogClick}
          >
            <MenuItem value="approve" onClick={(e) => e.stopPropagation()}>Approve</MenuItem>
            <MenuItem value="reject" onClick={(e) => e.stopPropagation()}>Reject</MenuItem>
          </Select>
          {error && !decision && <FormHelperText>Please select a decision</FormHelperText>}
        </FormControl>

        <TextField
          margin="normal"
          label="Comments"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          placeholder={decision === "reject" ?
            "Please provide rejection comments" :
            "Enter your approval comments"}
          value={comments}
          onChange={handleCommentsChange}
          error={!!error && !comments.trim()}
          helperText={error && !comments.trim() ? "Comments are required" : error}
          onClick={handleDialogClick}
        />
      </DialogContent>
      <DialogActions onClick={handleDialogClick}>
        <Button
          onClick={handleCancel}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!decision || !comments.trim() || isLoading}
        >
          {isLoading ? "Submitting..." : "Submit Decision"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DecideReview;
