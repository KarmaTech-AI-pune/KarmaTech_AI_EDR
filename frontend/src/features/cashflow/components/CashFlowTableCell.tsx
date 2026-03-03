/**
 * CashFlowTableCell Component (Dumb Component)
 * Reusable table cell with formatting logic
 */

import React from 'react';
import { TableCell } from '@mui/material';
import { TableCellProps } from '../types';
import { formatNumber, formatCurrencyWithSign, getValueColorClass, COLOR_SCHEME } from '../utils';

export const CashFlowTableCell: React.FC<TableCellProps> = ({
  value,
  type = 'text',
  align = 'center',
  colorClass,
  className = '',
}) => {
  const renderValue = () => {
    switch (type) {
      case 'currency': {
        const numValue = typeof value === 'number' ? value : 0;
        const { sign, formatted } = formatCurrencyWithSign(numValue);
        const color = colorClass || getValueColorClass(numValue, COLOR_SCHEME);
        
        return (
          <span style={{ color: color === COLOR_SCHEME.NEGATIVE ? '#dc2626' : color === COLOR_SCHEME.POSITIVE ? '#16a34a' : '#374151', fontWeight: 600 }}>
            {sign}{formatted}
          </span>
        );
      }
      case 'number':
        return (
          <span style={{ color: '#6b7280', fontWeight: 500 }}>
            {typeof value === 'number' ? formatNumber(value) : value}
          </span>
        );
      case 'text':
      default:
        return <span style={{ fontWeight: 500, color: '#1f2937' }}>{value}</span>;
    }
  };

  return (
    <TableCell
      align={align}
      sx={{
        py: 2.5,
        px: 3,
        fontSize: align === 'left' ? '0.875rem' : '1rem',
        borderBottom: '1px solid #f3f4f6',
      }}
      className={className}
    >
      {renderValue()}
    </TableCell>
  );
};
