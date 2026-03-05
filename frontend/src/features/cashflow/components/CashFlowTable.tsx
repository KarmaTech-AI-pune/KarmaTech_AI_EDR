/**
 * CashFlowTable Component (Smart Component with Material UI)
 * Container component that connects to context
 */

import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useCashFlowDataContext } from '../context/CashFlowContext';
import { CashFlowTableRow } from './CashFlowTableRow';
import { COLUMN_CONFIG } from '../utils';

export const CashFlowTable: React.FC = () => {
  const { filteredRows, loading, error, viewMode } = useCashFlowDataContext();

  // Loading State
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  // No Data State
  if (!filteredRows || filteredRows.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No cash flow data available
        </Typography>
      </Paper>
    );
  }

  const getTitle = () => {
    switch (viewMode) {
      case 'Monthly':
        return 'Monthly Cash Flow Breakdown';
      case 'Cumulative':
        return 'Cumulative Cash Flow Breakdown';
      case 'Milestones':
        return 'Milestones Cash Flow Breakdown';
      default:
        return 'Cash Flow Breakdown';
    }
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
      {/* Table Title */}
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
          {getTitle()}
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: '#f9fafb',
              }}
            >
              <TableCell
                align={COLUMN_CONFIG.PERIOD.align}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2,
                  px: 3,
                }}
              >
                {COLUMN_CONFIG.PERIOD.label}
              </TableCell>
              <TableCell
                align={COLUMN_CONFIG.HOURS.align}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2,
                  px: 3,
                }}
              >
                {COLUMN_CONFIG.HOURS.label}
              </TableCell>
              <TableCell
                align={COLUMN_CONFIG.PERSONNEL.align}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2,
                  px: 3,
                }}
              >
                {COLUMN_CONFIG.PERSONNEL.label}
              </TableCell>
              <TableCell
                align={COLUMN_CONFIG.ODC.align}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2,
                  px: 3,
                }}
              >
                {COLUMN_CONFIG.ODC.label}
              </TableCell>
              <TableCell
                align={COLUMN_CONFIG.TOTAL_COSTS.align}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2,
                  px: 3,
                }}
              >
                {COLUMN_CONFIG.TOTAL_COSTS.label}
              </TableCell>
              <TableCell
                align={COLUMN_CONFIG.REVENUE.align}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2,
                  px: 3,
                }}
              >
                {COLUMN_CONFIG.REVENUE.label}
              </TableCell>
              <TableCell
                align={COLUMN_CONFIG.NET_CASH_FLOW.align}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2,
                  px: 3,
                }}
              >
                {COLUMN_CONFIG.NET_CASH_FLOW.label}
              </TableCell>
              <TableCell
                align={COLUMN_CONFIG.STATUS.align}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  py: 2,
                  px: 3,
                }}
              >
                {COLUMN_CONFIG.STATUS.label}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row, index) => (
              <CashFlowTableRow key={`${row.period}-${index}`} row={row} index={index} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
