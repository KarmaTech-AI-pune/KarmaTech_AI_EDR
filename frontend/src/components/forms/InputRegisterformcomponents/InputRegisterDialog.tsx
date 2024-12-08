import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Grid,
  Box,
  Typography,
  IconButton,
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createInputRegister, updateInputRegister } from '../../../dummyapi/inputRegisterApi';

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

interface InputRegisterRow {
  id: number;
  projectId: number;
  dataReceived: string;
  receiptDate: string;
  receivedFrom: string;
  filesFormat: string;
  noOfFiles: number;
  fitForPurpose: boolean;
  check: boolean;
  checkedBy: string;
  checkedDate: string;
  custodian: string;
  storagePath: string;
  remarks: string;
}

interface InputRegisterDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: InputRegisterRow) => void;
  initialData?: InputRegisterRow;
  projectId: number;
}

const emptyRow = (projectId: number): Omit<InputRegisterRow, 'id'> => ({
  projectId,
  dataReceived: '',
  receiptDate: '',
  receivedFrom: '',
  filesFormat: '',
  noOfFiles: 0,
  fitForPurpose: false,
  check: false,
  checkedBy: '',
  checkedDate: '',
  custodian: '',
  storagePath: '',
  remarks: '',
});

const InputRegisterDialog: React.FC<InputRegisterDialogProps> = ({
  open,
  onClose,
  onSave,
  initialData,
  projectId,
}) => {
  const [formData, setFormData] = useState<Omit<InputRegisterRow, 'id'>>(emptyRow(projectId));

  // Reset form data when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      setFormData(initialData ? { ...initialData } : emptyRow(projectId));
    }
  }, [open, initialData, projectId]);

  const handleChange = (field: keyof Omit<InputRegisterRow, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (initialData) {
      const updatedData = updateInputRegister(initialData.id, formData);
      if (updatedData) {
        onSave(updatedData);
      }
    } else {
      const newData = createInputRegister(formData);
      onSave(newData);
    }
    onClose();
  };

  const handleDialogClose = () => {
    setFormData(emptyRow(projectId)); // Reset form data when dialog closes
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
    <StyledDialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ color: '#1976d2', fontWeight: 500 }}>
          {initialData ? 'Edit Input Register Entry' : 'Add Input Register Entry'}
        </Typography>
        <IconButton
          onClick={handleDialogClose}
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data Received"
                value={formData.dataReceived}
                onChange={(e) => handleChange('dataReceived', e.target.value)}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Receipt Date"
                value={formData.receiptDate}
                onChange={(e) => handleChange('receiptDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Received From"
                value={formData.receivedFrom}
                onChange={(e) => handleChange('receivedFrom', e.target.value)}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            File Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Files Format"
                value={formData.filesFormat}
                onChange={(e) => handleChange('filesFormat', e.target.value)}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Number of Files"
                value={formData.noOfFiles}
                onChange={(e) => handleChange('noOfFiles', parseInt(e.target.value))}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Storage Path"
                value={formData.storagePath}
                onChange={(e) => handleChange('storagePath', e.target.value)}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Verification Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.fitForPurpose}
                    onChange={(e) => handleChange('fitForPurpose', e.target.checked)}
                    sx={{ '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label="Fit for Purpose"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.check}
                    onChange={(e) => handleChange('check', e.target.checked)}
                    sx={{ '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label="Checked"
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Verification Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Checked By"
                value={formData.checkedBy}
                onChange={(e) => handleChange('checkedBy', e.target.value)}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Checked Date"
                value={formData.checkedDate}
                onChange={(e) => handleChange('checkedDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Custodian"
                value={formData.custodian}
                onChange={(e) => handleChange('custodian', e.target.value)}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography sx={sectionTitleStyle}>
            Additional Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarks"
                value={formData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleDialogClose}
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
          {initialData ? 'Save Changes' : 'Add Entry'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default InputRegisterDialog;
