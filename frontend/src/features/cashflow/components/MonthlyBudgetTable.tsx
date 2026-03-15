/**
 * MonthlyBudgetTable Component
 * Displays monthly budget data with months as columns (horizontal layout)
 * Matches the exact structure from the provided image
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
} from '@mui/material';
import { MonthlyBudgetData } from '../types/cashflow';

interface MonthlyBudgetTableProps {
  data?: MonthlyBudgetData;
}

export const MonthlyBudgetTable: React.FC<MonthlyBudgetTableProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  // Row definitions matching the image
  const budgetRows = [
    { key: 'totalHours', label: 'Total Hours', format: formatNumber },
    { key: 'purePersonnel', label: 'Pure Personnel', format: formatCurrency },
    { key: 'totalODCs', label: 'Total ODCs', format: formatCurrency },
    { key: 'totalProjectCost', label: 'Total Project Cost', format: formatCurrency },
    { key: 'cumulativeMonthlyCosts', label: 'Cumulative Monthly Costs', format: formatCurrency },
    { key: 'revenue', label: 'Revenue', format: formatCurrency },
    { key: 'cumulativeRevenue', label: 'Cumulative Revenue', format: formatCurrency },
    { key: 'cashFlow', label: 'Cash Flow', format: formatCurrency },
  ];

  // Get summary data from API (dynamic)
  const summary = data?.summary;

  // Summary rows (Description, Percentage, Totals in INR) - Dynamic from API
  const summaryData = summary ? [
    { description: 'Pure manpower cost', percentage: null, total: summary.pureManpowerCost },
    { description: 'Other ODC', percentage: null, total: summary.otherODC },
    { description: 'Total', percentage: null, total: summary.total },
    { description: 'Manpower Contingencies', percentage: summary.manpowerContingencies.percentage, total: summary.manpowerContingencies.amount },
    { description: 'ODC Contingencies', percentage: summary.odcContingencies.percentage, total: summary.odcContingencies.amount },
    { description: 'Sub total', percentage: null, total: summary.subTotal },
    { description: 'Profit', percentage: summary.profit.percentage, total: summary.profit.amount },
    { description: 'Total Project Cost', percentage: null, total: summary.totalProjectCost },
    { description: 'GST', percentage: summary.gst.percentage, total: summary.gst.amount },
    { description: 'Quoted Price', percentage: null, total: summary.quotedPrice },
  ] : [];

  // Get dynamic months from data
  const months = data?.months || [];
  
  // Extract unique month labels from the data (dynamic)
  const monthLabels = months.length > 0 
    ? months.map(m => m.month) 
    : [];

  // Show empty state if no data
  if (monthLabels.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3,
        }}
      >
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
            Monthly Budget Breakdown
          </Typography>
        </Box>
        <Box
          sx={{
            p: 6,
            textAlign: 'center',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No monthly budget data available. Please ensure WBS data is configured for this project.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3,
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
          Monthly Budget Breakdown
        </Typography>
      </Box>

      {/* Main Budget Table */}
      <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
        <Table stickyHeader sx={{ minWidth: 1400 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e0f2fe' }}>
              {/* First column header */}
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#374151',
                  py: 1.5,
                  px: 2,
                  minWidth: 180,
                  position: 'sticky',
                  left: 0,
                  backgroundColor: '#e0f2fe',
                  zIndex: 3,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                }}
              >
                Months
              </TableCell>

              {/* Month columns - Dynamic based on data */}
              {monthLabels.map((month) => (
                <TableCell
                  key={month}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#374151',
                    py: 1.5,
                    px: 1.5,
                    minWidth: 100,
                    backgroundColor: '#e0f2fe',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {month}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {budgetRows.map((row, rowIndex) => (
              <TableRow
                key={row.key}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                  },
                  backgroundColor: rowIndex === 4 ? '#bfdbfe' : '#ffffff',
                }}
              >
                {/* Row label */}
                <TableCell
                  sx={{
                    fontWeight: row.key === 'cashFlow' ? 700 : 600,
                    fontSize: '0.875rem',
                    color: '#374151',
                    py: 1.5,
                    px: 2,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: rowIndex === 4 ? '#bfdbfe' : '#ffffff',
                    zIndex: 2,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {row.label}
                </TableCell>

                {/* Month values - Dynamic based on data */}
                {monthLabels.map((month) => {
                  const monthData = months.find(m => m.month === month);
                  const value = monthData ? (monthData[row.key as keyof typeof monthData] as number) : 0;
                  const isNegative = value < 0;
                  const isPositive = value > 0;
                  
                  // Special color logic for Cash Flow row
                  let textColor = '#374151'; // default
                  if (value === 0) {
                    textColor = '#9ca3af'; // gray for zero
                  } else if (row.key === 'cashFlow') {
                    // Cash Flow row: green for positive, red for negative
                    textColor = isPositive ? '#16a34a' : '#dc2626';
                  } else {
                    // Other rows: red for negative, default for positive
                    textColor = isNegative ? '#dc2626' : '#374151';
                  }
                  
                  return (
                    <TableCell
                      key={`${row.key}-${month}`}
                      align="center"
                      sx={{
                        fontSize: '0.8rem',
                        color: textColor,
                        py: 1.5,
                        px: 1.5,
                        fontFamily: 'monospace',
                        fontWeight: row.key === 'cashFlow' ? 700 : 400,
                        backgroundColor: rowIndex === 4 ? '#bfdbfe' : 'inherit',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {value === 0 ? '-' : row.format(value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Section (Description, Percentage, Totals in INR) - Dynamic from API */}
      {summaryData.length > 0 && (
        <Box sx={{ borderTop: '2px solid', borderColor: 'divider', mt: 2 }}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e0f2fe' }}>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#374151',
                    py: 1.5,
                    px: 2,
                    width: '60%',
                  }}
                >
                  Description
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#374151',
                    py: 1.5,
                    px: 2,
                    width: '20%',
                  }}
                >
                  Percentage
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#374151',
                    py: 1.5,
                    px: 2,
                    width: '20%',
                  }}
                >
                  Totals in INR
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaryData.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: 
                      item.description === 'Total' || 
                      item.description === 'Sub total' || 
                      item.description === 'Total Project Cost' ||
                      item.description === 'Quoted Price'
                        ? '#bfdbfe'
                        : '#ffffff',
                  }}
                >
                  <TableCell
                    sx={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      py: 1.5,
                      px: 2,
                      fontWeight: 
                        item.description === 'Total' || 
                        item.description === 'Sub total' || 
                        item.description === 'Total Project Cost' ||
                        item.description === 'Quoted Price'
                          ? 700
                          : 400,
                    }}
                  >
                    {item.description}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      py: 1.5,
                      px: 2,
                      fontFamily: 'monospace',
                    }}
                  >
                    {item.percentage ? `${item.percentage}%` : '-'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      py: 1.5,
                      px: 2,
                      fontFamily: 'monospace',
                      fontWeight: 
                        item.description === 'Total' || 
                        item.description === 'Sub total' || 
                        item.description === 'Total Project Cost' ||
                        item.description === 'Quoted Price'
                          ? 700
                          : 400,
                    }}
                  >
                    {formatCurrency(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
};
