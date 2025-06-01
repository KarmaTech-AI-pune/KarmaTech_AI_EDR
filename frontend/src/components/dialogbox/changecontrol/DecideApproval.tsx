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
import { changeControlApi } from '../../../services/changeControlApi';

interface DecideApprovalProps {
  open: boolean;
  onClose: () => void;
  changeControlId?: number;
  projectId?: number;
  currentUser: string;
  onSubmit?: () => void;
}

const DecideApproval: React.FC<DecideApprovalProps> = ({
  open,
  onClose,
  changeControlId,
  projectId,
  currentUser,
  onSubmit
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

    if (!changeControlId) {
      setError('Change Control ID is missing');
      return;
    }

    if (!projectId) {
      setError('Project ID is missing');
      return;
    }

    try {
      let projectResponse = await projectApi.getById(projectId.toString());
      if (decision === 'approve') {
        // Approve and final the result
        await changeControlApi.approvedByRDOrRM({
          entityId: changeControlId,
          entityType: 'ChangeControl',
          action: "Approved",
          comments: comments || `Approved by ${currentUser}`,
          assignedToId: projectResponse.regionalManagerId
        });
      } else {
        // Request changes sent back to SPM (not PM)
        await changeControlApi.rejectByRDOrRM({
          entityId: changeControlId,
          entityType: 'ChangeControl',
          action: "Approval Changes",
          comments: comments || `Changes requested by ${currentUser}`,
          assignedToId: projectResponse.seniorProjectManagerId, // Explicitly assign to SPM
        });
       
      }

      // Reset dialog state
      setDecision('');
      setComments('');
      setError(null);

      // Call the callback
      if (onSubmit) {
        await onSubmit();
      }

      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to submit approval decision';
      setError(errorMessage);
      console.error('Error submitting approval decision:', err);
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
      <DialogTitle>Approval Decision</DialogTitle>
      <DialogContent onClick={stopEventPropagation}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Please review the change control and make a final decision:
          </Typography>

          <FormControl component="fieldset" sx={{ mt: 2 }} error={!!error && !decision}>
            <RadioGroup
              aria-label="approval-decision"
              name="approval-decision"
              value={decision}
              onChange={handleDecisionChange}
            >
              <FormControlLabel
                value="approve"
                control={<Radio />}
                label="Approve"
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

export default DecideApproval;
