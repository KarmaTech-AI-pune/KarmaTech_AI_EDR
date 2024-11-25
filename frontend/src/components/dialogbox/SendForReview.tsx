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
import { UserRole } from '../../dummyapi/database/dummyusers';
import { getUsersByRole, getUserById } from '../../dummyapi/database/dummyusers';
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { updateWorkflow } from '../../dummyapi/opportunityWorkflowApi';
import { AuthUser } from '../../dummyapi/database/dummyusers';
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
    // Get all Business Development Head users
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
    const bdHeads = getUsersByRole(UserRole.BusinessDevelopmentHead);
    setReviewers(bdHeads);
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
      setError('Please select a Business Development Head');
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

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      onClick={(e) => e.stopPropagation()}
      sx={{
        '& .MuiDialog-paper': {
          zIndex: 10000,
          position: 'relative'
        },
        zIndex: 10000
      }}
      BackdropComponent={Backdrop}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          zIndex: 9999
        }
      }}
      PaperProps={{
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
      }}
    >
      <DialogTitle>Send for Review</DialogTitle>
      <DialogContent>
        <FormControl 
          fullWidth 
          margin="normal" 
          error={!!error}
          sx={{
            '& .MuiOutlinedInput-root': {
              zIndex: 10001
            },
            '& .MuiSelect-select': {
              zIndex: 10002
            }
          }}
        >
         
          {manager ? (
            <div>
              Send to {manager} for review?
            </div>
          ) : (
            <>
              <InputLabel>Business Development Head</InputLabel>
              <Select
                value={selectedReviewer}
                onChange={handleReviewerChange}
                label="Business Development Head"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      zIndex: 10003
                    }
                  },
                  sx: {
                    zIndex: 10003
                  }
                }}
              >
                {reviewers.map((reviewer) => (
                  <MenuItem 
                    key={reviewer.id} 
                    value={reviewer.id}
                    sx={{
                      zIndex: 10004
                    }}
                  >
                    {reviewer.name}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
          
          {error && <FormHelperText sx={{ zIndex: 1560 }}>{error}</FormHelperText>}
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ zIndex: 1550 }}>
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
