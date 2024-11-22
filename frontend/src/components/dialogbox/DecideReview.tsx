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
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { WorkflowStatus } from '../../dummyapi/database/dummyopportunityTracking';
import { HistoryLoggingService } from '../../services/historyLoggingService';
import { getUsersByRole, UserRole, AuthUser } from '../../dummyapi/database/dummyusers';

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
  const [selectedManager, setSelectedManager] = useState<number | ''>('');
  const [regionalManagers, setRegionalManagers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get all Regional Manager users
    const managers = getUsersByRole(UserRole.RegionalManager);
    setRegionalManagers(managers);
  }, []);

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
      setError('Please select a Regional Manager');
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
      const opportunity = await opportunityApi.getById(opportunityId);
      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      let newWorkflowStatus: WorkflowStatus;
      let newStatus: string;

      if (decision === 'approve') {
        newWorkflowStatus = WorkflowStatus.SentForApproval;
        newStatus = 'Pending Approval';
      } else {
        newWorkflowStatus = WorkflowStatus.Initial;
        newStatus = 'Review Rejected';
      }

      const updatedOpportunity = {
        ...opportunity,
        workflowStatus: newWorkflowStatus,
        status: newStatus,
        reviewComments: comments,
        approvalManagerId: typeof selectedManager === 'number' ? selectedManager : undefined
      };
      console.log(updatedOpportunity)
      let res =  await opportunityApi.update(updatedOpportunity);
      console.log(res)
      // Log the review decision
      if (decision === 'approve') {
        const selectedManagerDetails = regionalManagers.find(m => m.id === selectedManager);
        await HistoryLoggingService.logReviewDecision(
          opportunityId,
          'approved',
          currentUser,
          `Sent for approval to ${selectedManagerDetails?.name}`
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
        opportunity.status,
        newStatus,
        currentUser
      );
      
      // Reset form and close dialog
      setDecision('');
      setComments('');
      setSelectedManager('');
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
            <InputLabel>Regional Manager</InputLabel>
            <Select
              value={selectedManager}
              onChange={handleManagerChange}
              label="Regional Manager"
              onClick={handleDialogClick}
            >
              {regionalManagers.map((manager) => (
                <MenuItem 
                  key={manager.id} 
                  value={manager.id}
                  onClick={(e) => e.stopPropagation()}
                >
                  {manager.name}
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
