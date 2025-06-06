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
import { AuthUser } from '../../../models/userModel';
import { getUsersByRole, getUserById } from '../../../services/userApi';
import { changeControlApi } from '../../../services/changeControlApi';
import { projectApi } from '../../../services/projectApi';

interface SendForReviewProps {
  open: boolean;
  onClose: () => void;
  changeControlId?: number;
  projectId?: number;
  currentUser: string | undefined;
  onSubmit?: () => void;
  onReviewSent?: () => void;
}

const SendForReview: React.FC<SendForReviewProps> = ({ 
  open, 
  onClose, 
  changeControlId,
  projectId,
  currentUser,
  onSubmit,
  onReviewSent
}) => {
  const [selectedReviewer, setSelectedReviewer] = useState<string>('');
  const [reviewers, setReviewers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manager, setManager] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        console.log('Fetching Senior Project Managers...');
        const seniorProjectManagers = await getUsersByRole('Senior Project Manager');
        console.log('Senior Project Managers fetched:', seniorProjectManagers);
        
        // Specifically log the names you're expecting
        const managerNames = seniorProjectManagers.map(rm => rm.name);
        console.log('RSenior Project Manager Names:', managerNames);
        
        setReviewers(seniorProjectManagers);
        
        // If no managers found, set an error
        if (seniorProjectManagers.length === 0) {
          setError('No Senior Project Manager found');
        }
      } catch (fetchError: unknown) {
        const errorMessage = fetchError instanceof Error 
          ? fetchError.message 
          : 'Failed to fetch Senior Project Managers';
        console.error('Error fetching Senior Project Managers:', fetchError);
        setError(errorMessage);
      }
    };

    const checkManager = async () => {
      if (changeControlId && projectId) {
        try {
          
          // Check if there's an existing review manager for this change control
          const response = await projectApi.getById(projectId.toString());
          const workflowData = response;
          
          if (workflowData && workflowData.seniorProjectManagerId) {
            const managerUser = await getUserById(workflowData.seniorProjectManagerId);
            if (managerUser) {
              setManager(managerUser.name);
              setSelectedReviewer(workflowData.seniorProjectManagerId);
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
  }, [changeControlId, projectId]);

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
      setError('Please select a Senior Project Manager');
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

    if (!currentUser) {
      setError('Current user information is missing');
      return;
    }

    try {
        ;
      // Find selected reviewer details
      const selectedReviewerDetails = reviewers.find(r => r.id === selectedReviewer);
      if (!selectedReviewerDetails) {
        throw new Error('Selected reviewer not found');
      }

      // Send the change control for review
   
      await changeControlApi.sendToReview({
        entityId: changeControlId,
        entityType: 'ChangeControl',
        assignedToId: selectedReviewer,
        action:"Review",
        comments: `Sent for review by ${currentUser}`
      });

    
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
      <DialogTitle>Senior Project Manager</DialogTitle>
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
              <InputLabel>Senior Project Manager</InputLabel>
              <Select
                value={selectedReviewer}
                onChange={handleReviewerChange}
                label="Senior Project Manager"
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
