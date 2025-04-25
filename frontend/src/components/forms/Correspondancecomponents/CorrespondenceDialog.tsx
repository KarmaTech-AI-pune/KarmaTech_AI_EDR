import { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import { InwardRow, OutwardRow } from '../../../services/correspondenceApi';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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

interface CorrespondenceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  type: 'inward' | 'outward';
  editData?: InwardRow | OutwardRow;
  isEdit?: boolean;
}

export default function CorrespondenceDialog({ open, onClose, onSave, type, editData, isEdit = false }: CorrespondenceDialogProps) {
  const getInitialFormData = () => {
    if (type === 'inward') {
      return {
        incomingLetterNo: '',
        letterDate: '',
        njsInwardNo: '',
        receiptDate: '',
        from: '',
        subject: '',
        attachmentDetails: '',
        actionTaken: '',
        storagePath: '',
        remarks: '',
        repliedDate: ''
      };
    } else {
      return {
        letterNo: '',
        letterDate: '',
        to: '',
        subject: '',
        attachmentDetails: '',
        actionTaken: '',
        storagePath: '',
        remarks: '',
        acknowledgement: ''
      };
    }
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // Update form data when editData changes or dialog opens
  useEffect(() => {
    if (open && editData) {
      let formattedData: any; // Use 'any' temporarily for flexibility during formatting

      if (type === 'inward') {
        const inwardData = editData as InwardRow; // Assert type first
        formattedData = {
          ...getInitialFormData(), // Start with initial structure
          ...inwardData, // Spread the actual data
          // Format dates and ensure required fields exist
          letterDate: inwardData.letterDate ? new Date(inwardData.letterDate).toISOString().split('T')[0] : '',
          receiptDate: inwardData.receiptDate ? new Date(inwardData.receiptDate).toISOString().split('T')[0] : '',
          repliedDate: inwardData.repliedDate ? new Date(inwardData.repliedDate).toISOString().split('T')[0] : '',
          // Ensure optional fields have default values if undefined
          attachmentDetails: inwardData.attachmentDetails ?? '',
          actionTaken: inwardData.actionTaken ?? '',
          storagePath: inwardData.storagePath ?? '',
          remarks: inwardData.remarks ?? '',
        };
      } else { // type === 'outward'
        const outwardData = editData as OutwardRow; // Assert type first
        formattedData = {
          ...getInitialFormData(), // Start with initial structure
          ...outwardData, // Spread the actual data
          // Format dates and ensure required fields exist
          letterDate: outwardData.letterDate ? new Date(outwardData.letterDate).toISOString().split('T')[0] : '',
          // Ensure optional fields have default values if undefined
          attachmentDetails: outwardData.attachmentDetails ?? '',
          actionTaken: outwardData.actionTaken ?? '',
          storagePath: outwardData.storagePath ?? '',
          remarks: outwardData.remarks ?? '',
          acknowledgement: outwardData.acknowledgement ?? '',
        };
      }

      // Now formattedData matches the state structure
      setFormData(formattedData);
    } else if (open) {
      // Reset form when opening for a new entry
      setFormData(getInitialFormData());
    }
  }, [open, editData, type]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Validate form data before submission
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (type === 'inward') {
      if (!formData.incomingLetterNo) errors.incomingLetterNo = 'Incoming Letter No is required';
      if (!formData.letterDate) errors.letterDate = 'Letter Date is required';
      if (!formData.njsInwardNo) errors.njsInwardNo = 'NJS Inward No is required';
      if (!formData.receiptDate) errors.receiptDate = 'Receipt Date is required';
      if (!formData.from) errors.from = 'From is required';
      if (!formData.subject) errors.subject = 'Subject is required';
    } else {
      if (!formData.letterNo) errors.letterNo = 'Letter No is required';
      if (!formData.letterDate) errors.letterDate = 'Letter Date is required';
      if (!formData.to) errors.to = 'To is required';
      if (!formData.subject) errors.subject = 'Subject is required';
    }

    return errors;
  };

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

  const handleSubmit = () => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Clear any previous errors
    setFormErrors({});
    setFormSubmitError(null);

    // If editing, include the ID in the data
    const dataToSave = isEdit && editData ? { ...formData, id: editData.id } : formData;

    try {
      onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormSubmitError('Failed to save data. Please try again.');
    }
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
          {isEdit
            ? (type === 'inward' ? 'Edit Inward Correspondence' : 'Edit Outward Correspondence')
            : (type === 'inward' ? 'Add Inward Correspondence' : 'Add Outward Correspondence')
          }
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
        {formSubmitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formSubmitError}
          </Alert>
        )}
        {type === 'inward' ? (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography sx={sectionTitleStyle}>
                Letter Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Incoming Letter No"
                    value={formData.incomingLetterNo}
                    onChange={handleChange('incomingLetterNo')}
                    sx={textFieldStyle}
                    required
                    error={!!formErrors.incomingLetterNo}
                    helperText={formErrors.incomingLetterNo}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Letter Date"
                    value={formData.letterDate}
                    onChange={handleChange('letterDate')}
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldStyle}
                    required
                    error={!!formErrors.letterDate}
                    helperText={formErrors.letterDate}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography sx={sectionTitleStyle}>
                Receipt Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="NJS Inward No"
                    value={formData.njsInwardNo}
                    onChange={handleChange('njsInwardNo')}
                    sx={textFieldStyle}
                    required
                    error={!!formErrors.njsInwardNo}
                    helperText={formErrors.njsInwardNo}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Receipt Date"
                    value={formData.receiptDate}
                    onChange={handleChange('receiptDate')}
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldStyle}
                    required
                    error={!!formErrors.receiptDate}
                    helperText={formErrors.receiptDate}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="From"
                    value={formData.from}
                    onChange={handleChange('from')}
                    sx={textFieldStyle}
                    required
                    error={!!formErrors.from}
                    helperText={formErrors.from}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography sx={sectionTitleStyle}>
                Content Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={formData.subject}
                    onChange={handleChange('subject')}
                    sx={textFieldStyle}
                    required
                    error={!!formErrors.subject}
                    helperText={formErrors.subject}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Attachment Details"
                    value={formData.attachmentDetails}
                    onChange={handleChange('attachmentDetails')}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Storage Path"
                    value={formData.storagePath}
                    onChange={handleChange('storagePath')}
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography sx={sectionTitleStyle}>
                Follow-up Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Action Taken"
                    value={formData.actionTaken}
                    onChange={handleChange('actionTaken')}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Replied Date"
                    value={formData.repliedDate}
                    onChange={handleChange('repliedDate')}
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Remarks"
                    value={formData.remarks}
                    onChange={handleChange('remarks')}
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography sx={sectionTitleStyle}>
                Letter Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Letter No"
                    value={formData.letterNo}
                    onChange={handleChange('letterNo')}
                    sx={textFieldStyle}
                    required
                    error={!!formErrors.letterNo}
                    helperText={formErrors.letterNo}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Letter Date"
                    value={formData.letterDate}
                    onChange={handleChange('letterDate')}
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldStyle}
                    required
                    error={!!formErrors.letterDate}
                    helperText={formErrors.letterDate}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="To"
                    value={formData.to}
                    onChange={handleChange('to')}
                    sx={textFieldStyle}
                    required
                    error={!!formErrors.to}
                    helperText={formErrors.to}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography sx={sectionTitleStyle}>
                Content Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={formData.subject}
                    onChange={handleChange('subject')}
                    sx={textFieldStyle}
                    required
                    error={!!formErrors.subject}
                    helperText={formErrors.subject}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Attachment Details"
                    value={formData.attachmentDetails}
                    onChange={handleChange('attachmentDetails')}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Storage Path"
                    value={formData.storagePath}
                    onChange={handleChange('storagePath')}
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography sx={sectionTitleStyle}>
                Follow-up Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Action Taken"
                    value={formData.actionTaken}
                    onChange={handleChange('actionTaken')}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Acknowledgement"
                    value={formData.acknowledgement}
                    onChange={handleChange('acknowledgement')}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Remarks"
                    value={formData.remarks}
                    onChange={handleChange('remarks')}
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>
            </Box>
          </>
        )}
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
          {isEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
