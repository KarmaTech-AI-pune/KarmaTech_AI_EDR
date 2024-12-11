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
import { getUsersByRole, getUserById } from '../../dummyapi/database/dummyusers';
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { updateWorkflow } from '../../dummyapi/opportunityWorkflowApi';
import { UserRole, AuthUser} from '../../models'
import { HistoryLoggingService } from '../../services/historyLoggingService';

interface SendForApprovalProps {
  open: boolean;
  onClose: () => void;
  opportunityId: number;
  currentUser: string;
  onSubmit?: () => void;
}

const SendForApproval: React.FC<SendForApprovalProps> = ({ 
  open, 
  onClose, 
  opportunityId,
  currentUser,
  onSubmit 
}) => {
  const [selectedApprover, setSelectedApprover] = useState<number>(0);
  const [approvers, setApprovers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [director, setDirector] = useState<string | null>(null);

  useEffect(() => {
    const checkDirector = async() =>{
      if(opportunityId){
        let res =  await opportunityApi.getById(opportunityId)

        if(res.approvalManagerId)
        {
          let directorUser = await getUserById(res.approvalManagerId)
          if(directorUser)
          {
          setDirector(directorUser.name)
          setSelectedApprover(res.approvalManagerId)
          }
          else setError("404: DirectorUser not found")
        }
      }
      else console.error("No ID set for opp")
    }
    // Get all Regional Directors
    const regionalDirectors = getUsersByRole(UserRole.RegionalDirector);
    setApprovers(regionalDirectors);
    checkDirector();
  }, [selectedApprover]);

  const handleApproverChange = (event: SelectChangeEvent) => {
    setSelectedApprover(Number(event.target.value));
    setError(null);
  };

  const handleCancel = () => {
    setSelectedApprover(0);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedApprover) {
      setError('Please select a Regional Director');
      return;
    }

    try {
      // Find selected approver details
      const selectedApproverDetails = approvers.find(a => a.id === selectedApprover);
      if (!selectedApproverDetails) {
        throw new Error('Selected approver not found');
      }

      // Update both workflow and opportunity in one atomic operation
      await updateWorkflow(opportunityId, 4, { // 4 is the ID for "Sent for Approval" status
        approvalManagerId: selectedApprover,
        status: 'Pending Approval'
      });

      // Log the approval request
      await HistoryLoggingService.logCustomEvent(
        opportunityId,
        "Sent for Approval",
        currentUser,
        `Sent to ${selectedApproverDetails.name} for approval`
      );

      // Reset and close dialog
      setSelectedApprover(0);
      setError(null);
      
      if (onSubmit) {
        onSubmit();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send for approval');
    }
  };

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
      <DialogTitle>Send for Approval</DialogTitle>
      <DialogContent onClick={stopEventPropagation}>
        <FormControl 
          fullWidth 
          margin="normal"
          error={!!error}
        >
          {director ? (
            <div>
              Send to {director} for approval?
            </div>
          ) : (
            <>
              <InputLabel>Regional Director</InputLabel>
              <Select
                value={selectedApprover.toString()}
                onChange={handleApproverChange}
                label="Regional Director"
                onClick={stopEventPropagation}
                MenuProps={{
                  onClick: stopEventPropagation
                }}
              >
                {approvers.map((approver) => (
                  <MenuItem 
                    key={approver.id} 
                    value={approver.id}
                    onClick={stopEventPropagation}
                  >
                    {approver.name}
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
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!selectedApprover}
        >
          Send for Approval
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendForApproval;
