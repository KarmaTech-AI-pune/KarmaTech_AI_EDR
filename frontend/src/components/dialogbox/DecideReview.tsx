import React, { useState, useEffect } from 'react';
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

import { getUsersByRole } from '../../services/userApi';
import { AuthUser } from '../../models/userModel';

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
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [regionalDirectors, setRegionalDirectors] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get all Regional Director users
    getRoles()   
  }, []);

  const getRoles = async()=>{
          const roles= await getUsersByRole('Regional Director');
          setRegionalDirectors(roles);
  }

  const handleDecisionChange = (event: any) => {
    event.stopPropagation();
    setDecision(event.target.value);
    setError(null);
    // Reset fields when decision changes
    setComments('');
    setSelectedManager('');
  };

  const handleManagerChange = (event: any) => {
    event.stopPropagation();
    setSelectedManager(event.target.value);
    setError(null);
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
    setSelectedManager('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!decision) {
      setError('Please select a decision');
      return;
    }

    if (decision === 'approve' && !selectedManager) {
      setError('Please select a Regional Director');
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
      const workflowId = decision === 'approve' ? "4" : "3"; // "4" for "Sent for Approval", "3" for "Review Changes"

      // Notify parent immediately for optimistic update
      if (onDecisionMade) {
        onDecisionMade();
      }

      // Update both workflow and opportunity in one atomic operation
      if(decision === 'approve'){
        await opportunityApi.sendToApproval({
          opportunityId: opportunityId,
          approvalManagerId: selectedManager,
          action: decision,
          comments: comments
        });
      } else {
        await opportunityApi.RejectByRegionManagerSentToBidManager({
          opportunityId: opportunityId,
          approvalManagerId: selectedManager,
          action: decision,
          comments: comments || `Rejected by ${currentUser}`
        });
      }

      // Log the review decision
      if (decision === 'approve') {
        const selectedDirectorDetails = regionalDirectors.find(m => m.id === selectedManager);
        await HistoryLoggingService.logReviewDecision(
          opportunityId,
          'approved',
          currentUser,
          `Sent for approval to ${selectedDirectorDetails?.name}`
        );
      } else {
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
      setSelectedManager('');
      setError(null);
      onClose();
    } catch (err: any) {
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

        {decision === 'approve' && (
          <FormControl 
            fullWidth 
            margin="normal"
            error={!!error && !selectedManager}
            onClick={handleDialogClick}
          >
            <InputLabel>Regional Director</InputLabel>
            <Select
              value={selectedManager}
              onChange={handleManagerChange}
              label="Regional Director"
              onClick={handleDialogClick}
            >
              {regionalDirectors.map((director) => (
                <MenuItem 
                  key={director.id} 
                  value={director.id}
                  onClick={(e) => e.stopPropagation()}
                >
                  {director.name}
                </MenuItem>
              ))}
            </Select>
            {error && !selectedManager && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        )}

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
