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
import { useProject } from '../../context/ProjectContext';
import { MonthlyProgressAPI, MonthlyReport } from '../../services/monthlyProgressApi';
import { getMonthName } from '../../utils/dateUtils';
interface MonthlyReportDialogProps {
  open: boolean;
  onClose: () => void;
  report: MonthlyReport | null;
}

export const MonthlyReportDialog: React.FC<MonthlyReportDialogProps> = ({ 
  open, 
  onClose, 
  report 
}) => {
  const { projectId } = useProject();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDownload = async () => {
    if (!report || !projectId) return;
    
    setIsDownloading(true);
    setDownloadStatus('idle');
    
    try {
      const reportData = await MonthlyProgressAPI.getMonthlyReportByYearMonth(
        projectId,
        report.year,
        parseInt(report.month, 10)
      );
      
      const blob = exportToExcel(reportData);
      const monthName = getMonthName(report.month);
      const filename = `${monthName}_${report.year}_Report.xlsx`;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      onClose();
      
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
          <Typography variant="h6">{getMonthName(report.month)} {report.year} Report</Typography>
          <IconButton onClick={handleClose} disabled={isDownloading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography gutterBottom>
          Please choose an action for the {getMonthName(report.month)} {report.year} report.
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
