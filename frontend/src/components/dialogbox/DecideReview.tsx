import React, { useState } from 'react';
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
  FormHelperText
} from '@mui/material';
import { opportunityApi } from '../../services/opportunityApi';
import { HistoryLoggingService } from '../../services/historyLoggingService';
import { getUserById } from '../../services/userApi';

interface DecideReviewProps {
  open: boolean;
  onClose: () => void;
  opportunityId?: number;
  currentUser: string;
  onDecisionMade?: () => void;
}

const DecideReview: React.FC<DecideReviewProps> = ({ 
  open, 
  onClose, 
  opportunityId,
  currentUser,
  onDecisionMade 
}) => {
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDecisionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.stopPropagation();
    setDecision(event.target.value);
    setError(null);
    // Reset comments when decision changes
    setComments('');
  };

  const handleCommentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setComments(event.target.value);
    setError(null);
  };

  const handleCancel = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDecision('');
    setComments('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!decision) {
      setError('Please select a decision');
      return;
    }

    if (decision === 'reject' && !comments.trim()) {
      setError('Please provide comments for rejection');
      return;
    }

    if (!opportunityId) {
      setError('Opportunity ID is missing');
      return;
    }

    try {
      const newStatus = decision === 'approve' ? 'Pending Approval' : 'Review Rejected';

      // Notify parent immediately for optimistic update
      if (onDecisionMade) {
        onDecisionMade();
      }

      // Update both workflow and opportunity in one atomic operation
      if(decision === 'approve'){
        // Get opportunity to get the RD
        const opportunity = await opportunityApi.getById(opportunityId);
        const regionalDirectorId = opportunity.approvalManagerId;

        if (!regionalDirectorId) {
          setError('No Regional Director assigned to this opportunity');
          return;
        }

        await opportunityApi.sendToApproval({
          opportunityId: opportunityId,
          approvalManagerId: regionalDirectorId,
          action: decision,
          comments: comments
        });

        // Get RD name for logging
        const rdUser = await getUserById(regionalDirectorId);
        await HistoryLoggingService.logReviewDecision(
          opportunityId,
          'approved',
          currentUser,
          `Sent for approval to ${rdUser?.name || 'Regional Director'}`
        );
      } else {
        await opportunityApi.RejectByRegionManagerSentToBidManager({
          opportunityId: opportunityId,
          approvalManagerId: '', // Not needed for rejection
          action: decision,
          comments: comments || `Rejected by ${currentUser}`
        });

        await HistoryLoggingService.logReviewDecision(
          opportunityId,
          'rejected',
          currentUser,
          comments
        );
      }

      // Also log status change
      await HistoryLoggingService.logStatusChange(
        opportunityId,
        decision === 'approve' ? 'Under Review' : 'Review Rejected',
        newStatus,
        currentUser
      );
      
      // Reset form and close dialog
      setDecision('');
      setComments('');
      setError(null);
      onClose();
    } catch (err: Error) {
      setError(err.message || 'Failed to submit review decision');
    }
  };

  const handleDialogClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      onClick={handleDialogClick}
      sx={{
        '& .MuiDialog-paper': {
          zIndex: 9999
        }
      }}
      slotProps={{
        backdrop: {
          onClick: (event) => {
            event.stopPropagation();
            handleCancel(event as React.MouseEvent);
          }
        }
      }}
    >
      <DialogTitle onClick={handleDialogClick}>Decide Review</DialogTitle>
      <DialogContent onClick={handleDialogClick}>
        <FormControl 
          fullWidth 
          margin="normal"
          error={!!error}
          onClick={handleDialogClick}
        >
          <InputLabel>Decision</InputLabel>
          <Select
            value={decision}
            onChange={handleDecisionChange}
            label="Decision"
            onClick={handleDialogClick}
          >
            <MenuItem value="approve" onClick={(e) => e.stopPropagation()}>Approve</MenuItem>
            <MenuItem value="reject" onClick={(e) => e.stopPropagation()}>Reject</MenuItem>
          </Select>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>

        {decision === 'reject' && (
          <TextField
            margin="normal"
            label="Rejection Comments"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            placeholder="Enter your rejection comments"
            value={comments}
            onChange={handleCommentsChange}
            error={!!error && !comments.trim()}
            helperText={error && !comments.trim() ? 'Comments are required for rejection' : ''}
            required
            onClick={handleDialogClick}
          />
        )}
      </DialogContent>
      <DialogActions onClick={handleDialogClick}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit Decision
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DecideReview;
