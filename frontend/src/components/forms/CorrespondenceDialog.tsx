import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {type === 'inward' ? 'Add Inward Correspondence' : 'Add Outward Correspondence'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {type === 'inward' ? (
            // Inward correspondence fields
            <>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Incoming Letter No"
                  value={formData.incomingLetterNo}
                  onChange={handleChange('incomingLetterNo')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Letter Date"
                  value={formData.letterDate}
                  onChange={handleChange('letterDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="NJS Inward No"
                  value={formData.njsInwardNo}
                  onChange={handleChange('njsInwardNo')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Receipt Date"
                  value={formData.receiptDate}
                  onChange={handleChange('receiptDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="From"
                  value={formData.from}
                  onChange={handleChange('from')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={formData.subject}
                  onChange={handleChange('subject')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Attachment Details"
                  value={formData.attachmentDetails}
                  onChange={handleChange('attachmentDetails')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Action Taken"
                  value={formData.actionTaken}
                  onChange={handleChange('actionTaken')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Storage Path"
                  value={formData.storagePath}
                  onChange={handleChange('storagePath')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Remarks"
                  value={formData.remarks}
                  onChange={handleChange('remarks')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Replied Date"
                  value={formData.repliedDate}
                  onChange={handleChange('repliedDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          ) : (
            // Outward correspondence fields
            <>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Letter No"
                  value={formData.letterNo}
                  onChange={handleChange('letterNo')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Letter Date"
                  value={formData.letterDate}
                  onChange={handleChange('letterDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="To"
                  value={formData.to}
                  onChange={handleChange('to')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={formData.subject}
                  onChange={handleChange('subject')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Attachment Details"
                  value={formData.attachmentDetails}
                  onChange={handleChange('attachmentDetails')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Action Taken"
                  value={formData.actionTaken}
                  onChange={handleChange('actionTaken')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Storage Path"
                  value={formData.storagePath}
                  onChange={handleChange('storagePath')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Remarks"
                  value={formData.remarks}
                  onChange={handleChange('remarks')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Acknowledgement"
                  value={formData.acknowledgement}
                  onChange={handleChange('acknowledgement')}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
