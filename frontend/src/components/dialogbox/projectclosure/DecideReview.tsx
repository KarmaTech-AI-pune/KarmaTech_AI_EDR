import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  Typography,
  Box,
  Backdrop
} from '@mui/material';
import { projectApi } from '../../../services/projectApi';
import { pmWorkflowApi } from '../../../api/pmWorkflowApi';


interface DecideReviewProps {
  open: boolean;
  onClose: () => void;
  projectClosureId?: number;
  projectId?: number;
  currentUser: string;
   onDecisionMade?: () => void;
}

const DecideReview: React.FC<DecideReviewProps> = ({
  open,
  onClose,
  projectClosureId,
  projectId,
  currentUser,
  onDecisionMade
}) => {
  const [decision, setDecision] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleDecisionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDecision(event.target.value);
    setError(null);
  };

  const handleCommentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComments(event.target.value);
  };

  const handleCancel = () => {
    setDecision('');
    setComments('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!decision) {
      setError('Please select a decision');
      return;
    }

    if (!projectClosureId) {
      setError('Project Closure ID is missing');
      return;
    }

    if (!projectId) {
      setError('Project ID is missing');
      return;
    }

    try {        
             let projectResponse = await projectApi.getById(projectId.toString());
          if (decision === 'approve') {
            // Send to approval to RM or RD
          await pmWorkflowApi.sendToApproval({
              entityId: projectClosureId,
              entityType: 'ProjectClosure',
              action: "Approval",
              assignedToId: projectResponse.regionalManagerId,
              comments: comments || `Reviewed and sent for approval by ${currentUser}`
            });
          } else {
            // Request changes sent back to project manager
          await pmWorkflowApi.requestChanges({
              entityId: projectClosureId,
              entityType: 'ProjectClosure',
              action: "Reject",
              assignedToId: projectResponse.projectManagerId,
              comments: comments || `Changes requested by ${currentUser}`,
              isApprovalChanges: false,
            });
          }

      // Reset dialog state
      setDecision('');
      setComments('');
      setError(null);

      // Call the callback
      if (onDecisionMade) {
        onDecisionMade();
      }

      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to submit review decision';
      setError(errorMessage);
      console.error('Error submitting review decision:', err);
    }
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
        '& .MuiDialog-paper': {
          position: 'relative'
        },
        zIndex: 1300
      }}
      BackdropComponent={Backdrop}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
      PaperProps={{
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        },
        onClick: stopEventPropagation
      }}
    >
      <DialogTitle>Review Decision</DialogTitle>
      <DialogContent onClick={stopEventPropagation}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Please review the project closure form and make a decision:
          </Typography>

          <FormControl component="fieldset" sx={{ mt: 2 }} error={!!error && !decision}>
            <RadioGroup
              aria-label="review-decision"
              name="review-decision"
              value={decision}
              onChange={handleDecisionChange}
            >
              <FormControlLabel
                value="approve"
                control={<Radio />}
                label="Approve and send for final approval"
              />
              <FormControlLabel
                value="requestChanges"
                control={<Radio />}
                label="Request changes"
              />
            </RadioGroup>
          </FormControl>

          <TextField
            label="Comments"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={comments}
            onChange={handleCommentsChange}
            placeholder="Add your comments here (optional)"
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions onClick={stopEventPropagation}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!decision}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DecideReview;
