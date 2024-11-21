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
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { WorkflowStatus } from '../../dummyapi/database/dummyopportunityTracking';
import { HistoryLoggingService } from '../../services/historyLoggingService';

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

  const handleDecisionChange = (event: any) => {
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

    if (!comments.trim()) {
      setError('Please provide comments for your decision');
      return;
    }

    if (!opportunityId) {
      setError('Opportunity ID is missing');
      return;
    }

    try {
      const opportunity = await opportunityApi.getById(opportunityId);
      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      let newWorkflowStatus: WorkflowStatus;
      let newStatus: string;

      switch (decision) {
        case 'approve':
          newWorkflowStatus = WorkflowStatus.SentForApproval;
          newStatus = 'Pending Approval';
          break;
        case 'reject':
          newWorkflowStatus = WorkflowStatus.Initial;
          newStatus = 'Review Rejected';
          break;
        case 'revise':
          newWorkflowStatus = WorkflowStatus.ReviewChanges;
          newStatus = 'Review Changes Required';
          break;
        default:
          throw new Error('Invalid decision');
      }

      const updatedOpportunity = {
        ...opportunity,
        workflowStatus: newWorkflowStatus,
        status: newStatus,
        reviewComments: comments
      };

      await opportunityApi.update(updatedOpportunity);

      // Log the review decision
      if (decision === 'approve' || decision === 'reject') {
        await HistoryLoggingService.logReviewDecision(
          opportunityId,
          decision === 'approve' ? 'approved' : 'rejected',
          currentUser,
          comments
        );
      } else if (decision === 'revise') {
        await HistoryLoggingService.logCustomEvent(
          opportunityId,
          'Review Changes Requested',
          currentUser,
          comments
        );
      }

      // Also log status change
      await HistoryLoggingService.logStatusChange(
        opportunityId,
        opportunity.status,
        newStatus,
        currentUser
      );
      
      // Reset form and close dialog
      setDecision('');
      setComments('');
      setError(null);
      onClose();
      
      // Notify parent component to refresh the opportunities list
      if (onDecisionMade) {
        onDecisionMade();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit review decision');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Decide Review</DialogTitle>
      <DialogContent>
        <FormControl 
          fullWidth 
          margin="normal"
          error={!!error}
        >
          <InputLabel>Decision</InputLabel>
          <Select
            value={decision}
            onChange={handleDecisionChange}
            label="Decision"
          >
            <MenuItem value="approve">Approve and Send for Final Approval</MenuItem>
            <MenuItem value="reject">Reject</MenuItem>
            <MenuItem value="revise">Request Revision</MenuItem>
          </Select>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>

        <TextField
          margin="normal"
          label="Comments"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          placeholder="Enter your decision comments"
          value={comments}
          onChange={handleCommentsChange}
          error={!!error && !comments.trim()}
          helperText={error && !comments.trim() ? 'Comments are required' : ''}
        />
      </DialogContent>
      <DialogActions>
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
