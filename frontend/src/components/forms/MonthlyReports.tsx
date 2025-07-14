import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import MonthlyReportDialog from '../dialogbox/MonthlyReportDialog';
import { MonthlyProgressAPI, MonthlyReport } from '../../services/monthlyProgressApi';
import { useProject } from '../../context/ProjectContext';

export const MonthlyReports: React.FC = () => {
  const { projectId } = useProject();
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await MonthlyProgressAPI.getMonthlyReports(projectId);
        console.log("Report", data)
        setReports(data);
      } catch (err) {
        setError('Failed to fetch monthly reports.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [projectId]);

  const handleClickOpen = (report: MonthlyReport) => {
    setSelectedReport(report);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedReport(null);
  };

  const getMonthName = (month: string): string => {
    const monthNumber = parseInt(month, 10);
    if (!isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('default', { month: 'long' });
    }
    return month; // Return original string if it's not a number 1-12
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5"
              gutterBottom
              sx={{
                color: "#1976d2",
                fontWeight: 500,
                mb: 3,
              }}>Monthly Reports</Typography>
      {reports.map((report) => (
        <Card key={report.id} sx={{ mt: 2 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>{getMonthName(report.month)} {report.year} Report</Typography>
            <Box>
              <Button
                variant="contained"
                sx={{
                  mr: 1,
                  backgroundColor: '#d70401',
                  '&:hover': {
                    backgroundColor: '#be0401',
                  },
                }}
                onClick={() => handleClickOpen(report)}
              >
                PDF
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: 'green',
                  '&:hover': {
                    backgroundColor: 'darkgreen',
                  },
                }}
                onClick={() => handleClickOpen(report)}
              >
                Excel
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
      <MonthlyReportDialog
        open={open}
        onClose={handleClose}
        report={selectedReport}
      />
    </Box>
  );
};

export default MonthlyReports;
