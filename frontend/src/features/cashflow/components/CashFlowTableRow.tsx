/**
 * CashFlowTableRow Component (Dumb Component)
 * Pure presentational component for table rows
 */

import React from 'react';
import { TableRow, TableCell } from '@mui/material';
import { TableRowProps } from '../types';
import { CashFlowTableCell } from './CashFlowTableCell';
import { StatusBadge } from './StatusBadge';
import { COLOR_SCHEME } from '../utils';

export const CashFlowTableRow: React.FC<TableRowProps> = ({ row, index, onRowClick }) => {
  return (
    <TableRow
      hover
      onClick={() => onRowClick?.(row)}
      sx={{
        cursor: onRowClick ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: '#f9fafb',
        },
        transition: 'background-color 0.2s',
      }}
    >
      {/* Period */}
      <TableCell
        align="left"
        sx={{
          py: 2.5,
          px: 3,
          fontWeight: 700,
          fontSize: '0.875rem',
          color: '#1f2937',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        {row.period}
      </TableCell>

      {/* Hours */}
      <CashFlowTableCell value={row.hours} type="number" align="center" />

      {/* Personnel */}
      <TableCell
        align="center"
        sx={{
          py: 2.5,
          px: 3,
          fontSize: '1rem',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <span style={{ color: '#6b7280', fontWeight: 500 }}>
          ₹{row.personnel.toLocaleString('en-IN')}
        </span>
      </TableCell>

      {/* ODC */}
      <TableCell
        align="center"
        sx={{
          py: 2.5,
          px: 3,
          fontSize: '1rem',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <span style={{ color: '#6b7280', fontWeight: 500 }}>
          ₹{row.odc.toLocaleString('en-IN')}
        </span>
      </TableCell>

      {/* Total Costs */}
      <TableCell
        align="center"
        sx={{
          py: 2.5,
          px: 3,
          fontSize: '1rem',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <span style={{ color: '#ef4444', fontWeight: 700 }}>
          ₹{row.totalCosts.toLocaleString('en-IN')}
        </span>
      </TableCell>

      {/* Revenue */}
      <TableCell
        align="center"
        sx={{
          py: 2.5,
          px: 3,
          fontSize: '1rem',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <span style={{ color: '#16a34a', fontWeight: 700 }}>
          {row.revenue > 0 ? `₹${row.revenue.toLocaleString('en-IN')}` : '₹0'}
        </span>
      </TableCell>

      {/* Net Cash Flow */}
      <CashFlowTableCell
        value={row.netCashFlow}
        type="currency"
        align="center"
        colorClass={row.netCashFlow < 0 ? COLOR_SCHEME.NEGATIVE : COLOR_SCHEME.POSITIVE}
      />

      {/* Status */}
      <TableCell
        align="center"
        sx={{
          py: 2.5,
          px: 3,
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <StatusBadge status={row.status} />
      </TableCell>
    </TableRow>
  );
};
