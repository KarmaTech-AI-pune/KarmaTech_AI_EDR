/**
 * MonthlyBudgetTable Component
 * - Pagination: 6 months per page
 * - 1 month: stretches to fill full width
 * - 2–6 months: share available space equally
 * - 7+ months: paginated, each column min 120px, scroll if needed
 */

import React, { useState } from 'react';
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
  IconButton,
  Chip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { MonthlyBudgetData } from '../types/cashflow';

interface MonthlyBudgetTableProps {
  data?: MonthlyBudgetData;
}

const MONTHS_PER_PAGE = 6;
const LABEL_COL_WIDTH = 210;
const MONTH_COL_MIN_WIDTH = 120;

const highlightDescriptions = ['Total', 'Sub total', 'Total Project Cost', 'Quoted Price'];

export const MonthlyBudgetTable: React.FC<MonthlyBudgetTableProps> = ({ data }) => {
  const [page, setPage] = useState(0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-IN').format(value);

  const budgetRows = [
    { key: 'totalHours',             label: 'Total Hours',              format: formatNumber   },
    { key: 'purePersonnel',          label: 'Pure Personnel',           format: formatCurrency },
    { key: 'totalODCs',              label: 'Total ODCs',               format: formatCurrency },
    { key: 'totalProjectCost',       label: 'Total Project Cost',       format: formatCurrency },
    { key: 'cumulativeMonthlyCosts', label: 'Cumulative Monthly Costs', format: formatCurrency },
    { key: 'revenue',                label: 'Revenue',                  format: formatCurrency },
    { key: 'cumulativeRevenue',      label: 'Cumulative Revenue',       format: formatCurrency },
    { key: 'cashFlow',               label: 'Cash Flow',                format: formatCurrency },
  ];

  const summary = data?.summary;
  const summaryData = summary ? [
    { description: 'Pure manpower cost',     percentage: null,                                     total: summary.pureManpowerCost              },
    { description: 'Other ODC',              percentage: null,                                     total: summary.otherODC                      },
    { description: 'Total',                  percentage: null,                                     total: summary.total                         },
    { description: 'Manpower Contingencies', percentage: summary.manpowerContingencies.percentage, total: summary.manpowerContingencies.amount  },
    { description: 'ODC Contingencies',      percentage: summary.odcContingencies.percentage,      total: summary.odcContingencies.amount       },
    { description: 'Sub total',              percentage: null,                                     total: summary.subTotal                      },
    { description: 'Profit',                 percentage: summary.profit.percentage,                total: summary.profit.amount                 },
    { description: 'Total Project Cost',     percentage: null,                                     total: summary.totalProjectCost              },
    { description: 'GST',                    percentage: summary.gst.percentage,                   total: summary.gst.amount                    },
    { description: 'Quoted Price',           percentage: null,                                     total: summary.quotedPrice                   },
  ] : [];

  const months = data?.months || [];
  const allMonthLabels = months.map(m => m.month);
  const totalMonths = allMonthLabels.length;
  const totalPages = Math.ceil(totalMonths / MONTHS_PER_PAGE);
  const startIdx = page * MONTHS_PER_PAGE;
  const visibleMonthLabels = allMonthLabels.slice(startIdx, startIdx + MONTHS_PER_PAGE);

  // Empty state
  if (totalMonths === 0) {
    return (
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', backgroundColor: '#fafafa' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Monthly Budget Breakdown
          </Typography>
        </Box>
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No monthly budget data available. Please ensure WBS data is configured for this project.
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Table sizing logic:
  // - width: '100%'  → always stretch to container
  // - minWidth       → only enforced when months overflow (prevents squeeze)
  // When months <= 6: no minWidth pressure, columns share space equally → looks good with 1 month too
  // When months > 6 (paginated): minWidth ensures each column is at least 120px
  const needsMinWidth = visibleMonthLabels.length > 3;
  const tableMinWidth = needsMinWidth
    ? LABEL_COL_WIDTH + visibleMonthLabels.length * MONTH_COL_MIN_WIDTH
    : undefined;

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 3 }}>

      {/* Header: title + pagination */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Monthly Budget Breakdown
        </Typography>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>

            <Chip
              label={`${startIdx + 1}–${Math.min(startIdx + MONTHS_PER_PAGE, totalMonths)} of ${totalMonths} months`}
              size="small"
              sx={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#e0f2fe', color: '#374151' }}
            />

            <IconButton
              size="small"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Main Budget Table */}
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table
          stickyHeader
          sx={{
            tableLayout: 'fixed',
            width: '100%',
            ...(tableMinWidth ? { minWidth: tableMinWidth } : {}),
          }}
        >
          <colgroup>
            {/* Label column — always fixed */}
            <col style={{ width: LABEL_COL_WIDTH }} />
            {/* Month columns — no fixed width, share remaining space equally */}
            {visibleMonthLabels.map(m => <col key={m} />)}
          </colgroup>

          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: '#374151',
                  py: 1.5,
                  px: 2,
                  position: 'sticky',
                  left: 0,
                  backgroundColor: '#e0f2fe',
                  zIndex: 3,
                  borderRight: '2px solid #bfdbfe',
                  whiteSpace: 'nowrap',
                }}
              >
                Months
              </TableCell>
              {visibleMonthLabels.map(month => (
                <TableCell
                  key={month}
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: '#374151',
                    py: 1.5,
                    px: 1,
                    backgroundColor: '#e0f2fe',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {month}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {budgetRows.map((row, rowIndex) => {
              const isHighlightRow = rowIndex === 4;
              const isCashFlow = row.key === 'cashFlow';
              const rowBg = isHighlightRow ? '#bfdbfe' : '#ffffff';

              return (
                <TableRow
                  key={row.key}
                  sx={{ '&:hover': { backgroundColor: '#f9fafb' }, backgroundColor: rowBg }}
                >
                  <TableCell
                    sx={{
                      fontWeight: isCashFlow ? 700 : 600,
                      fontSize: '0.8rem',
                      color: '#374151',
                      py: 1.25,
                      px: 2,
                      position: 'sticky',
                      left: 0,
                      backgroundColor: rowBg,
                      zIndex: 2,
                      borderRight: '2px solid #bfdbfe',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.label}
                  </TableCell>

                  {visibleMonthLabels.map(month => {
                    const monthData = months.find(m => m.month === month);
                    const value = monthData ? (monthData[row.key as keyof typeof monthData] as number) : 0;
                    const isNegative = value < 0;
                    const isPositive = value > 0;

                    let textColor = '#374151';
                    if (value === 0)       textColor = '#9ca3af';
                    else if (isCashFlow)   textColor = isPositive ? '#16a34a' : '#dc2626';
                    else if (isNegative)   textColor = '#dc2626';

                    return (
                      <TableCell
                        key={`${row.key}-${month}`}
                        align="center"
                        sx={{
                          fontSize: '0.78rem',
                          color: textColor,
                          py: 1.25,
                          px: 1.5,
                          fontFamily: 'monospace',
                          fontWeight: isCashFlow ? 700 : 400,
                          backgroundColor: isHighlightRow ? '#bfdbfe' : 'inherit',
                          borderRight: '1px solid',
                          borderColor: 'divider',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {value === 0 ? '—' : row.format(value)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Section */}
      {summaryData.length > 0 && (
        <Box sx={{ borderTop: '2px solid', borderColor: 'divider' }}>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '60%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <TableHead>
              <TableRow>
                {['Description', 'Percentage', 'Totals in INR'].map((h, i) => (
                  <TableCell
                    key={h}
                    align={i === 0 ? 'left' : i === 1 ? 'center' : 'right'}
                    sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#374151', py: 1.25, px: 2, backgroundColor: '#e0f2fe' }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {summaryData.map((item, index) => {
                const isHighlight = highlightDescriptions.includes(item.description);
                return (
                  <TableRow key={index} sx={{ backgroundColor: isHighlight ? '#bfdbfe' : '#ffffff' }}>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#374151', py: 1.25, px: 2, fontWeight: isHighlight ? 700 : 400 }}>
                      {item.description}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8rem', color: '#374151', py: 1.25, px: 2, fontFamily: 'monospace' }}>
                      {item.percentage ? `${item.percentage}%` : '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem', color: '#374151', py: 1.25, px: 2, fontFamily: 'monospace', fontWeight: isHighlight ? 700 : 400 }}>
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
};
