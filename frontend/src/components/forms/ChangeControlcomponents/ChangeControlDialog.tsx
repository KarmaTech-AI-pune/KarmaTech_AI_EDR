import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
  styled,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ChangeControl } from "../../../models";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(1),
  },
  '& .MuiDialogTitle-root': {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2, 3),
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa',
  },
}));

interface ChangeControlDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<ChangeControl, 'id' | 'projectId'>) => void;
  nextSrNo: number;
  editData?: ChangeControl;
}

export const ChangeControlDialog = ({ open, onClose, onSave, nextSrNo, editData }: ChangeControlDialogProps) => {
  const [formData, setFormData] = useState<Omit<ChangeControl, 'id' | 'projectId'>>({
    srNo: editData?.srNo || nextSrNo,
    dateLogged: editData?.dateLogged || '',
    originator: editData?.originator || '',
    description: editData?.description || '',
    costImpact: editData?.costImpact || '',
    timeImpact: editData?.timeImpact || '',
    resourcesImpact: editData?.resourcesImpact || '',
    qualityImpact: editData?.qualityImpact || '',
    changeOrderStatus: editData?.changeOrderStatus || '',
    clientApprovalStatus: editData?.clientApprovalStatus || '',
    claimSituation: editData?.claimSituation || ''
  });

  const [errors, setErrors] = useState({
    dateLogged: false,
    originator: false,
    description: false
  });

  // Update form data when editData changes
  useEffect(() => {
    if (editData) {
      // Format the date for the input field (YYYY-MM-DD)
      let formattedDate = '';
      try {
        const dateObj = new Date(editData.dateLogged);
        formattedDate = dateObj.toISOString().split('T')[0];
      } catch (err) {
        console.error('Error formatting date:', err);
        formattedDate = new Date().toISOString().split('T')[0];
      }

      setFormData({
        srNo: editData.srNo,
        dateLogged: formattedDate,
        originator: editData.originator,
        description: editData.description,
        costImpact: editData.costImpact || '',
        timeImpact: editData.timeImpact || '',
        resourcesImpact: editData.resourcesImpact || '',
        qualityImpact: editData.qualityImpact || '',
        changeOrderStatus: editData.changeOrderStatus || '',
        clientApprovalStatus: editData.clientApprovalStatus || '',
        claimSituation: editData.claimSituation || ''
      });
    } else {
      // Reset form when not editing and set today's date as default
      const today = new Date().toISOString().split('T')[0];

      setFormData({
        srNo: nextSrNo,
        dateLogged: today,
        originator: '',
        description: '',
        costImpact: '',
        timeImpact: '',
        resourcesImpact: '',
        qualityImpact: '',
        changeOrderStatus: '',
        clientApprovalStatus: '',
        claimSituation: ''
      });
    }
  }, [editData, nextSrNo]);

  const handleChange = (field: keyof Omit<ChangeControl, 'id' | 'projectId' | 'srNo'>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value
      });
    };

  const handleSubmit = () => {
    // Validate required fields
    const newErrors = {
      dateLogged: !formData.dateLogged,
      originator: !formData.originator,
      description: !formData.description
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (newErrors.dateLogged || newErrors.originator || newErrors.description) {
      return; // Don't submit if there are errors
    }

    // Ensure all string fields have values (even if empty)
    const sanitizedData = {
      ...formData,
      originator: formData.originator || '',
      description: formData.description || '',
      costImpact: formData.costImpact || '',
      timeImpact: formData.timeImpact || '',
      resourcesImpact: formData.resourcesImpact || '',
      qualityImpact: formData.qualityImpact || '',
      changeOrderStatus: formData.changeOrderStatus || '',
      clientApprovalStatus: formData.clientApprovalStatus || '',
      claimSituation: formData.claimSituation || ''
    };

    console.log("Submitting form data:", JSON.stringify(sanitizedData, null, 2));
    onSave(sanitizedData);
    setFormData({
      srNo: nextSrNo,
      dateLogged: '',
      originator: '',
      description: '',
      costImpact: '',
      timeImpact: '',
      resourcesImpact: '',
      qualityImpact: '',
      changeOrderStatus: '',
      clientApprovalStatus: '',
      claimSituation: ''
    });
    onClose();
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      backgroundColor: '#fff',
      '&:hover fieldset': {
        borderColor: '#1976d2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
      }
    }
  };

  const sectionTitleStyle = {
    color: '#1976d2',
    fontWeight: 500,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 2,
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ color: '#1976d2', fontWeight: 500 }}>
          {editData ? 'Edit' : 'Add'} Change Control - Sr. No: {formData.srNo}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {(errors.dateLogged || errors.originator || errors.description) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Please fill in all required fields.
          </Alert>
        )}
        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Date Logged"
                type="date"
                value={formData.dateLogged}
                onChange={handleChange('dateLogged')}
                fullWidth
                required
                error={errors.dateLogged}
                helperText={errors.dateLogged ? "Date is required" : ""}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Originator"
                value={formData.originator}
                onChange={handleChange('originator')}
                fullWidth
                required
                error={errors.originator}
                helperText={errors.originator ? "Originator is required" : ""}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                fullWidth
                required
                error={errors.description}
                helperText={errors.description ? "Description is required" : ""}
                multiline
                rows={2}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Project Impact
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Cost Impact"
                value={formData.costImpact}
                onChange={handleChange('costImpact')}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Time Impact"
                value={formData.timeImpact}
                onChange={handleChange('timeImpact')}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Resources Impact"
                value={formData.resourcesImpact}
                onChange={handleChange('resourcesImpact')}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Quality Impact"
                value={formData.qualityImpact}
                onChange={handleChange('qualityImpact')}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography sx={sectionTitleStyle}>
            Status Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Change Order Status"
                value={formData.changeOrderStatus}
                onChange={handleChange('changeOrderStatus')}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Client Approval Status"
                value={formData.clientApprovalStatus}
                onChange={handleChange('clientApprovalStatus')}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Claim Situation"
                value={formData.claimSituation}
                onChange={handleChange('claimSituation')}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: '#1976d2',
            '&:hover': {
              bgcolor: '#1565c0'
            }
          }}
        >
          Save
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};
