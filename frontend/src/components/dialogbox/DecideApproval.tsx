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
  SelectChangeEvent,
  FormHelperText
} from '@mui/material';
import { HistoryLoggingService } from '../../services/historyLoggingService';
import { updateWorkflow } from '../../dummyapi/opportunityWorkflowApi';

interface DecideApprovalProps {
  open: boolean;
  onClose: () => void;
  opportunityId: string;
  currentUser: string;
  onSubmit?: () => void;
}

type DecisionType = 'approve' | 'reject';

const DecideApproval: React.FC<DecideApprovalProps> = ({ 
  open, 
  onClose, 
  opportunityId,
  currentUser,
  onSubmit 
}) => {
  const [decision, setDecision] = useState<DecisionType | ''>('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

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

    if (!comments.trim()) {
      setError('Please provide comments for your decision');
      return;
    }

    try {
      const newStatus = decision === 'approve' ? 'Approved' : 'Approval Rejected';
      const workflowId = decision === 'approve' ? "6" : "5"; // "6" for Approved, "5" for Approval Changes

      // Update both workflow and opportunity in one atomic operation
      await updateWorkflow(opportunityId, workflowId, {
        status: newStatus,
        approvalComments: comments
      });

      // Map decision to the correct format for history logging
      const mappedDecision = decision === 'approve' ? 'approved' : 'rejected';

      // Log the approval decision
      await HistoryLoggingService.logApprovalDecision(
        opportunityId,
        mappedDecision,
        currentUser,
        comments
      );

      // Log status change
      await HistoryLoggingService.logStatusChange(
        opportunityId,
        decision === 'approve' ? 'Pending Approval' : 'Approval Rejected',
        newStatus,
        currentUser
      );

      // Reset form and close dialog
      setDecision('');
      setComments('');
      setError(null);
      
      if (onSubmit) {
        onSubmit();
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to submit approval decision:', err);
      setError(err.message || 'Failed to submit approval decision');
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
      <DialogTitle onClick={handleDialogClick}>Decide Approval</DialogTitle>
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
          placeholder={decision === 'reject' ? 
            "Please provide rejection comments" : 
            "Enter your approval comments"}
          value={comments}
          onChange={handleCommentsChange}
          error={!!error && !comments.trim()}
          helperText={error && !comments.trim() ? 'Comments are required' : error}
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
          disabled={!decision || !comments.trim()}
        >
          Submit Decision
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DecideApproval;
