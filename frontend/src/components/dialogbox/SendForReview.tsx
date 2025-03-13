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
  SelectChangeEvent,
  FormHelperText,
  Backdrop
} from '@mui/material';
import { AuthUser } from '../../models/userModel';
import { getUsersByRole, getUserById } from '../../services/userApi';
import { opportunityApi } from '../../services/opportunityApi';
import { HistoryLoggingService } from '../../services/historyLoggingService';

interface SendForReviewProps {
  open: boolean;
  onClose: () => void;
  opportunityId?: number;
  currentUser: string | undefined;
  onSubmit?: () => void;
  onReviewSent?: () => void; // New prop for refreshing the page
}

const SendForReview: React.FC<SendForReviewProps> = ({ 
  open, 
  onClose, 
  opportunityId,
  currentUser,
  onSubmit,
  onReviewSent // New prop
}) => {
  const [selectedReviewer, setSelectedReviewer] = useState<string>('');
  const [reviewers, setReviewers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manager, setManager] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        console.log('Fetching Regional Managers...');
        const regionalManagers = await getUsersByRole('Regional Manager');
        console.log('Regional Managers fetched:', regionalManagers);
        
        // Specifically log the names you're expecting
        const managerNames = regionalManagers.map(rm => rm.name);
        console.log('Regional Manager Names:', managerNames);
        
        setReviewers(regionalManagers);
        
        // If no managers found, set an error
        if (regionalManagers.length === 0) {
          setError('No Regional Managers found');
        }
      } catch (fetchError: unknown) {
        const errorMessage = fetchError instanceof Error 
          ? fetchError.message 
          : 'Failed to fetch regional managers';
        console.error('Error fetching regional managers:', fetchError);
        setError(errorMessage);
      }
    };

    const checkManager = async () => {
      if (opportunityId) {
        try {
          const res = await opportunityApi.getById(opportunityId);
          if (res.reviewManagerId) {
            const managerUser = await getUserById(res.reviewManagerId);
            if (managerUser) {
              setManager(managerUser.name);
              setSelectedReviewer(res.reviewManagerId);
            } else {
              setError("404: Manager User not found");
            }
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Failed to retrieve manager information';
          console.error('Error checking manager:', err);
          setError(errorMessage);
        }
      }
    };

    fetchReviewers();
    checkManager();
  }, [opportunityId]);

  const handleReviewerChange = (event: SelectChangeEvent<string>) => {
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

      // Update opportunity with review manager
      await opportunityApi.sendToReview({
        opportunityId: opportunityId,
        reviewManagerId: selectedReviewer,
        comments: `Sent for review by ${currentUser}`
      });

      // Log the review request
      await HistoryLoggingService.logSentForReview(
        opportunityId,
        currentUser,
        selectedReviewerDetails.name
      );

      // Reset dialog state
      setSelectedReviewer('');
      setError(null);
      
      // Call callbacks in correct order with await to ensure proper sequence
      if (onSubmit) {
        await onSubmit(); // Wait for status update in parent
      }
      if (onReviewSent) {
        await onReviewSent(); // Wait for refresh to complete
      }
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to send for review';
      setError(errorMessage);
      console.error(err);
      onClose(); // Close dialog even on error
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
            <div style={{ 
              fontSize: '16px',
              padding: '8px 0',
              textAlign: 'center'
            }}>
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
          
          {error && (
            <FormHelperText error>
              {error}
            </FormHelperText>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions onClick={stopEventPropagation}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!selectedReviewer}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendForReview;
