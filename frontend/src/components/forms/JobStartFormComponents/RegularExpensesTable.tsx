import React from 'react';
import {
  TableRow,
  TableCell,
  TextField
} from '@mui/material';
import { RegularExpensesTableProps, ExpensesType } from '../../../types/jobStartForm';

const RegularExpensesTable: React.FC<RegularExpensesTableProps> = ({
  expenses,
  onExpenseChange,
  textFieldStyle
}) => {
  // Map of expense IDs to their descriptions
  const expenseDescriptions: Record<keyof ExpensesType, string> = {
    '2a': 'Travel',
    '2b': 'Subsistence',
    '3': 'Local conveyance',
    '4': 'Communications',
    '5': 'Stationery and printing',
    '7': 'Expense Contingencies'
  };

  // Regular expenses (excluding expense contingencies which is handled separately)
  const regularExpenseIds: (keyof ExpensesType)[] = ['2a', '2b', '3', '4', '5'];

  return (
    <>
      {regularExpenseIds.map((id) => (
        <TableRow key={id}>
          <TableCell sx={{ pl: 3 }}>{id}</TableCell>
          <TableCell>{expenseDescriptions[id]}</TableCell>
          <TableCell align="right">
            <TextField
              size="small"
              type="number"
              value={expenses[id].number}
              onChange={(e) => onExpenseChange(id, 'number', e.target.value)}
              sx={textFieldStyle}
            />
          </TableCell>
          <TableCell></TableCell>
          <TableCell align="right">{expenses[id].number}</TableCell>
          <TableCell>
            <TextField
              size="small"
              fullWidth
              value={expenses[id].remarks}
              onChange={(e) => onExpenseChange(id, 'remarks', e.target.value)}
              sx={textFieldStyle}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default RegularExpensesTable;
