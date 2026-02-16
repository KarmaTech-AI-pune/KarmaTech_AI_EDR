
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

interface ProjectDecideApprovalProps {
  open: boolean;
  onClose: (updated?: boolean) => void;
  projectId?: number;
  currentUser: string;
  onSubmit?: () => Promise<void>;
}

const DecideApproval: React.FC<ProjectDecideApprovalProps> = ({
  open,
  onClose,
  projectId,
  currentUser,
  onSubmit
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

  const handleDialogKeyDown = (event: React.KeyboardEvent) => {
    event.stopPropagation();
  };

  const handleSubmit = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!decision) {
      setError("decision");
      return;
    }

    if (!comments.trim()) {
      setError("comments");
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
      setError(null);

      // In a real implementation, you would call your API to update the WBS status
      // For example:
      // await wbsApi.decideApproval({
      //   projectId: projectId,
      //   decision: decision,
      //   comments: comments,
      //   approvedBy: currentUser
      // });

      // Log the approval decision
      const actionType = decision === "approve"
        ? "WBS Manpower Approved"
        : "WBS Manpower Rejected";

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

      // Call the callback
      if (onSubmit) {
        await onSubmit();
      } else {
        onClose(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : "Failed to submit approval decision";
      setError(errorMessage);
      console.error("Error submitting approval decision:", err);
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
      onKeyDown={handleDialogKeyDown}
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
        onClick: handleDialogClick,
        onKeyDown: handleDialogKeyDown
      }}
    >
      <DialogTitle onClick={handleDialogClick}>Decide Approval</DialogTitle>
      <DialogContent onClick={handleDialogClick}>
        <FormControl
          fullWidth
          margin="normal"
          error={error === "decision"}
          onClick={handleDialogClick}
        >
          <InputLabel id="decision-label" htmlFor="decision-select">Decision</InputLabel>
          <Select
            labelId="decision-label"
            id="decision-select"
            label="Decision"
            value={decision}
            onChange={handleDecisionChange}
            onClick={handleDialogClick}
            inputProps={{
              'data-testid': 'decision-select-input'
            }}
          >
            <MenuItem value="approve" onClick={(e) => e.stopPropagation()}>Approve</MenuItem>
            <MenuItem value="reject" onClick={(e) => e.stopPropagation()}>Reject</MenuItem>
          </Select>
          {error === "decision" && <FormHelperText>Please select a decision</FormHelperText>}
        </FormControl>

        <TextField
          id="comments-input"
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
          error={error === "comments"}
          helperText={error === "comments" ? "Comments are required" : (error && error !== "decision" && error !== "comments" ? error : "")}
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

export default DecideApproval;
