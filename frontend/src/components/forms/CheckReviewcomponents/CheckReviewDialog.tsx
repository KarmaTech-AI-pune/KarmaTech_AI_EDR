import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  Grid,
  styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CheckReviewRow } from "../../../models";

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

interface CheckReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<CheckReviewRow, 'projectId' | 'activityNo'>) => void;
  nextActivityNo: string;
}

export const CheckReviewDialog = ({ open, onClose, onSave, nextActivityNo }: CheckReviewDialogProps) => {
  const [formData, setFormData] = useState<Omit<CheckReviewRow, 'projectId' | 'activityNo'>>({
    activityName: '',
    objective: '',
    references: '',
    fileName: '',
    qualityIssues: '',
    completion: 'N',
    checkedBy: '',
    approvedBy: '',
    actionTaken: ''
  });

  const handleChange = (field: keyof Omit<CheckReviewRow, 'projectId' | 'activityNo'>) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value
      });
    };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      completion: event.target.checked ? 'Y' : 'N'
    });
  };

  const handleSubmit = () => {
    onSave(formData);
    setFormData({
      activityName: '',
      objective: '',
      references: '',
      fileName: '',
      qualityIssues: '',
      completion: 'N',
      checkedBy: '',
      approvedBy: '',
      actionTaken: ''
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
          Add Check Review - Activity No: {nextActivityNo}
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
        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Activity Name"
                value={formData.activityName}
                onChange={handleChange('activityName')}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Objective"
                value={formData.objective}
                onChange={handleChange('objective')}
                fullWidth
                multiline
                rows={2}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Reference Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="References and Standards"
                value={formData.references}
                onChange={handleChange('references')}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="File Name"
                value={formData.fileName}
                onChange={handleChange('fileName')}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Quality Assessment
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Specific Quality Issues"
                value={formData.qualityIssues}
                onChange={handleChange('qualityIssues')}
                fullWidth
                multiline
                rows={2}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.completion === 'Y'}
                    onChange={handleCheckboxChange}
                    sx={{ '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label="Completion"
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Review Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Checked by"
                type="date"
                value={formData.checkedBy}
                onChange={handleChange('checkedBy')}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Approved by"
                type="date"
                value={formData.approvedBy}
                onChange={handleChange('approvedBy')}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography sx={sectionTitleStyle}>
            Action Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Action Taken"
                value={formData.actionTaken}
                onChange={handleChange('actionTaken')}
                fullWidth
                multiline
                rows={2}
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
