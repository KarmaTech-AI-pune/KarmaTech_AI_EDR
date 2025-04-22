import { useState } from 'react';
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
}

export default function CorrespondenceDialog({ open, onClose, onSave, type }: CorrespondenceDialogProps) {
  const [formData, setFormData] = useState(type === 'inward' ? {
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
  } : {
    letterNo: '',
    letterDate: '',
    to: '',
    subject: '',
    attachmentDetails: '',
    actionTaken: '',
    storagePath: '',
    remarks: '',
    acknowledgement: ''
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    setFormData(type === 'inward' ? {
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
    } : {
      letterNo: '',
      letterDate: '',
      to: '',
      subject: '',
      attachmentDetails: '',
      actionTaken: '',
      storagePath: '',
      remarks: '',
      acknowledgement: ''
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
          {type === 'inward' ? 'Add Inward Correspondence' : 'Add Outward Correspondence'}
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="From"
                    value={formData.from}
                    onChange={handleChange('from')}
                    sx={textFieldStyle}
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="To"
                    value={formData.to}
                    onChange={handleChange('to')}
                    sx={textFieldStyle}
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
          Save
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
