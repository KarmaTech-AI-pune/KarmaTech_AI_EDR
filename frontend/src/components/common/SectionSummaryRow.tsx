import React from 'react';
import { TableRow, TableCell } from '@mui/material';
import { SectionSummaryRowProps } from '../../types/jobStartForm';

const SectionSummaryRow: React.FC<SectionSummaryRowProps> = ({
  label,
  value,
  colSpan = 4,
  isHighlighted = false,
  isNegativeHighlight = false,
  tableCellStyle,
  summaryRowStyle
}) => {
  return (
    <TableRow sx={{
      ...(summaryRowStyle || {}),
      ...(isHighlighted && {
        bgcolor: '#e3f2fd',
        '& .MuiTableCell-root': {
          py: 2,
          fontSize: '1.1em',
          fontWeight: 'bold'
        }
      })
    }}>
      <TableCell colSpan={colSpan} sx={tableCellStyle}>{label}</TableCell>
      <TableCell 
        align="right" 
        sx={{
          ...tableCellStyle,
          ...(isHighlighted && isNegativeHighlight && { color: '#d32f2f' }),
          ...(isHighlighted && !isNegativeHighlight && { color: '#2e7d32' }),
          ...(isHighlighted && { fontSize: '1.2em' })
        }}
      >
        {value}
      </TableCell>
      <TableCell sx={tableCellStyle}></TableCell>
    </TableRow>
  );
};

export default SectionSummaryRow;
