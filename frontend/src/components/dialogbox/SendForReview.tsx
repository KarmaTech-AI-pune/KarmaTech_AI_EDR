import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { UserRole } from '../../dummyapi/database/dummyusers';
import { getUsersByRole } from '../../dummyapi/database/dummyusers';
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { WorkflowStatus } from '../../dummyapi/database/dummyopportunityTracking';
import { AuthUser } from '../../dummyapi/database/dummyusers';

interface SendForReviewProps {
  open: boolean;
  onClose: () => void;
  opportunityId?: number;
}

const SendForReview: React.FC<SendForReviewProps> = ({ open, onClose, opportunityId }) => {
  const [selectedReviewer, setSelectedReviewer] = useState<number | ''>('');
  const [reviewers, setReviewers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get all Business Development Head users
    const bdHeads = getUsersByRole(UserRole.BusinessDevelopmentHead);
    setReviewers(bdHeads);
  }, []);

  const handleReviewerChange = (event: any) => {
    setSelectedReviewer(event.target.value);
    setError(null);
  };

  const handleCancel = () => {
    setSelectedReviewer('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedReviewer) {
      setError('Please select a Business Development Head');
      return;
    }

    if (!opportunityId) {
      setError('Opportunity ID is missing');
      return;
    }

    try {
      // Get current opportunity
      const opportunity = await opportunityApi.getById(opportunityId);
      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      // Update opportunity with new workflow status and reviewer
      const updatedOpportunity = {
        ...opportunity,
        workflowStatus: WorkflowStatus.SentForReview,
        reviewManagerId: selectedReviewer,
        status: 'Under Review' // Also update the status to reflect the review state
      };

      await opportunityApi.update(updatedOpportunity);
      console.log(updatedOpportunity)
      // Reset and close dialog
      setSelectedReviewer('');
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send for review');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Send for Review</DialogTitle>
      <DialogContent>
        <FormControl 
          fullWidth 
          margin="normal" 
          error={!!error}
        >
          <InputLabel>Business Development Head</InputLabel>
          <Select
            value={selectedReviewer}
            onChange={handleReviewerChange}
            label="Business Development Head"
          >
            {reviewers.map((reviewer) => (
              <MenuItem key={reviewer.id} value={reviewer.id}>
                {reviewer.name}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendForReview;
