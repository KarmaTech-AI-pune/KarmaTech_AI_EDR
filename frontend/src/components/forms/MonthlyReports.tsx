import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import MonthlyReportDialog from '../dialogbox/MonthlyReportDialog';

const reports = [
  {
    id: 1,
    month: 'June',
  },
  {
    id: 2,
    month: 'July',
  },
];

export const MonthlyReports: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ id: number; month: string } | null>(null);

  const handleClickOpen = (report: { id: number; month: string }) => {
    setSelectedReport(report);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedReport(null);
  };

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
            <Typography>{report.month} Month Report</Typography>
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
