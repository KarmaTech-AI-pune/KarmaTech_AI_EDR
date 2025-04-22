import React from 'react';
import {
  TableRow,
  TableCell,
  TextField
} from '@mui/material';
import { ExpenseContingenciesRowProps } from '../../../types/jobStartForm';

const ExpenseContingenciesRow: React.FC<ExpenseContingenciesRowProps> = ({
  expenses,
  onExpenseChange,
  textFieldStyle
}) => {
  return (
    <TableRow>
      <TableCell sx={{ pl: 3 }}>7</TableCell>
      <TableCell>Expense Contingencies</TableCell>
      <TableCell align="right">
        <TextField
          size="small"
          type="number"
          value={expenses['7'].number}
          onChange={(e) => onExpenseChange('7', 'number', e.target.value)}
          sx={textFieldStyle}
        />
      </TableCell>
      <TableCell></TableCell>
      <TableCell align="right">{expenses['7'].number}</TableCell>
      <TableCell>
        <TextField
          size="small"
          fullWidth
          value={expenses['7'].remarks}
          onChange={(e) => onExpenseChange('7', 'remarks', e.target.value)}
          sx={textFieldStyle}
        />
      </TableCell>
    </TableRow>
  );
};

export default ExpenseContingenciesRow;
