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
  FormHelperText,
  Backdrop
} from '@mui/material';
import { UserRole, AuthUser} from '../../models'
import { getUsersByRole, getUserById } from '../../dummyapi/usersApi';
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { updateWorkflow } from '../../dummyapi/opportunityWorkflowApi';
import { HistoryLoggingService } from '../../services/historyLoggingService';

interface SendForReviewProps {
  open: boolean;
  onClose: () => void;
  opportunityId?: number;
  currentUser: string | undefined;
  onSubmit?: () => void;
}

const SendForReview: React.FC<SendForReviewProps> = ({ 
  open, 
  onClose, 
  opportunityId,
  currentUser,
  onSubmit 
}) => {
  const [selectedReviewer, setSelectedReviewer] = useState<number | ''>('');
  const [reviewers, setReviewers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manager,setManager] = useState<string | null>(null);

  useEffect(() => {
    // Get all Regional Manager users
    const checkManager = async() =>{
      if(opportunityId){
        let res =  await opportunityApi.getById(opportunityId);
        if(res.reviewManagerId) {
          let managerUser = await getUserById(res.reviewManagerId);
          if(managerUser) {
            setManager(managerUser?.name);
            setSelectedReviewer(res.reviewManagerId);
          }
          else setError("404: ManagerUser not found");
        }
      }
    };
    const regionalManagers = getUsersByRole(UserRole.RegionalManager);
    setReviewers(regionalManagers);
    checkManager();
  }, [opportunityId]);

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
      setError('Please select a Regional Manager');
      return;
    }

    if (!opportunityId) {
      setError('Opportunity ID is missing');
      return;
    }

    if (!currentUser) {
      setError('Current user information is missing');
      return;
    }

    try {
      // Find selected reviewer details
      const selectedReviewerDetails = reviewers.find(r => r.id === selectedReviewer);
      if (!selectedReviewerDetails) {
        throw new Error('Selected reviewer not found');
      }

      // Update both workflow and opportunity in one atomic operation
      await updateWorkflow(opportunityId, 2, { // 2 is the ID for "Sent for Review" status
        reviewManagerId: selectedReviewer,
        status: 'Under Review',
        submittedBy: currentUser
      });

      // Log the review request
      await HistoryLoggingService.logSentForReview(
        opportunityId,
        currentUser,
        selectedReviewerDetails.name
      );

      // Reset and close dialog
      setSelectedReviewer('');
      setError(null);
      
      if (onSubmit) {
        onSubmit();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send for review');
    }
  };

  // Don't render the dialog if currentUser is not available
  if (!currentUser) {
    return null;
  }

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
        zIndex: 1300 // Standard MUI dialog z-index
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
      <DialogTitle>Regional Manager</DialogTitle>
      <DialogContent onClick={stopEventPropagation}>
        <FormControl 
          fullWidth 
          margin="normal" 
          error={!!error}
        >
          {manager ? (
            <div>
              Send to {manager} for review?
            </div>
          ) : (
            <>
              <InputLabel>Regional Manager</InputLabel>
              <Select
                value={selectedReviewer}
                onChange={handleReviewerChange}
                label="Regional Manager"
                onClick={stopEventPropagation}
                MenuProps={{
                  onClick: stopEventPropagation
                }}
              >
                {reviewers.map((reviewer) => (
                  <MenuItem 
                    key={reviewer.id} 
                    value={reviewer.id}
                    onClick={stopEventPropagation}
                  >
                    {reviewer.name}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
          
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      </DialogContent>
      <DialogActions onClick={stopEventPropagation}>
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
