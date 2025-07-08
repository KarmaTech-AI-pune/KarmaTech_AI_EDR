import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PreviewIcon from '@mui/icons-material/Preview';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { exportToExcel } from '../../services/excelExportService';

interface MonthlyReportDialogProps {
  open: boolean;
  onClose: () => void;
  report: { id: number; month: string } | null;
}

export const MonthlyReportDialog: React.FC<MonthlyReportDialogProps> = ({ 
  open, 
  onClose, 
  report 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDownload = async () => {
    if (!report) return;
    
    setIsDownloading(true);
    setDownloadStatus('idle');
    
    try {
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call the export function
      exportToExcel(report.month);
      
      // Set success status
      setDownloadStatus('success');
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setDownloadStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus('error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    if (!isDownloading) {
      setDownloadStatus('idle');
      onClose();
    }
  };

  if (!report) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={isDownloading}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{report.month} Month Report</Typography>
          <IconButton onClick={handleClose} disabled={isDownloading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography gutterBottom>
          Please choose an action for the {report.month} report.
        </Typography>
        
        {downloadStatus === 'success' && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon fontSize="inherit" />}
            sx={{ mt: 2 }}
          >
            Excel file downloaded successfully!
          </Alert>
        )}
        
        {downloadStatus === 'error' && (
          <Alert 
            severity="error" 
            sx={{ mt: 2 }}
          >
            Download failed. Please try again.
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          startIcon={<PreviewIcon />}
          disabled={isDownloading}
          sx={{
            color: '#ff5a00',
            borderColor: '#ff5a00',
            '&:hover': {
              backgroundColor: 'rgba(230, 81, 0, 0.1)',
              borderColor: '#ff5a00',
            },
          }}
        >
          Preview
        </Button>
        
        <Button
          onClick={handleDownload}
          variant="contained"
          startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          disabled={isDownloading}
          sx={{
            backgroundColor: 'green',
            '&:hover': {
              backgroundColor: 'darkgreen',
            },
            '&:disabled': {
              backgroundColor: 'rgba(0, 128, 0, 0.3)',
            },
          }}
        >
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MonthlyReportDialog;