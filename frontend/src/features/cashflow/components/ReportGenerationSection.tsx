/**
 * ReportGenerationSection Component
 * Displays report generation options with checkboxes and percentages
 */

import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { ReportGenerationData, ReportItem } from '../types/cashflow';

interface ReportGenerationSectionProps {
  data?: ReportGenerationData;
  onGenerateReport?: (selectedReports: ReportItem[]) => void;
}

export const ReportGenerationSection: React.FC<ReportGenerationSectionProps> = ({
  data,
  onGenerateReport,
}) => {
  const defaultReports: ReportItem[] = [
    { name: 'Inception Report', percentage: 10, selected: false },
    { name: 'Feasibility Report', percentage: 10, selected: false },
    { name: 'Preliminary Design Report', percentage: 15, selected: false },
    { name: 'Detailed Design Report', percentage: 25, selected: false },
    { name: 'Tender Document', percentage: 20, selected: false },
    { name: 'Construction Supervision', percentage: 20, selected: false },
  ];

  const reports = data?.reports || defaultReports;
  
  const [selectedReports, setSelectedReports] = useState<ReportItem[]>(
    reports.filter((r) => r.selected)
  );

  const handleCheckboxChange = (report: ReportItem) => {
    setSelectedReports((prev) => {
      const exists = prev.find((r) => r.name === report.name);
      if (exists) {
        return prev.filter((r) => r.name !== report.name);
      } else {
        return [...prev, report];
      }
    });
  };

  const handleGenerateReport = () => {
    if (onGenerateReport) {
      onGenerateReport(selectedReports);
    }
  };

  const isReportSelected = (reportName: string) => {
    return selectedReports.some((r) => r.name === reportName);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Section Title */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fafafa',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Report Generation
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        <FormGroup>
          <Grid container spacing={2}>
            {reports.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report.name}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isReportSelected(report.name)}
                      onChange={() => handleCheckboxChange(report)}
                      sx={{
                        color: '#9ca3af',
                        '&.Mui-checked': {
                          color: '#3b82f6',
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: 500,
                        }}
                      >
                        {report.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: '#9ca3af',
                          fontWeight: 600,
                        }}
                      >
                        ({report.percentage}%)
                      </Typography>
                    </Box>
                  }
                  sx={{
                    m: 0,
                    p: 1.5,
                    border: '1px solid',
                    borderColor: isReportSelected(report.name) ? '#3b82f6' : '#e5e7eb',
                    borderRadius: 1,
                    backgroundColor: isReportSelected(report.name) ? '#eff6ff' : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                      borderColor: '#9ca3af',
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>

        {/* Generate Button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleGenerateReport}
            disabled={selectedReports.length === 0}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
              '&:disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
              },
            }}
          >
            Generate Report ({selectedReports.length} selected)
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
