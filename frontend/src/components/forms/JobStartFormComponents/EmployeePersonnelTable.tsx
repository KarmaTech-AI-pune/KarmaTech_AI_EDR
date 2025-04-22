import React from 'react';
import {
  TableRow,
  TableCell,
  TextField
} from '@mui/material';
import { EmployeePersonnelTableProps } from '../../../types/jobStartForm';

const EmployeePersonnelTable: React.FC<EmployeePersonnelTableProps> = ({
  employeeAllocations,
  isConsultant,
  onRemarksChange,
  calculateTotalCost,
  textFieldStyle
}) => {
  const filteredEmployees = employeeAllocations.filter(emp => emp.is_consultant === isConsultant);
  
  if (filteredEmployees.length === 0) {
    return null;
  }

  return (
    <>
      <TableRow>
        <TableCell sx={{ fontWeight: 'bold', pl: 3 }}>{isConsultant ? '' : '1a'}</TableCell>
        <TableCell sx={{ fontWeight: 'bold', pl: isConsultant ? 3 : 0 }}>
          {isConsultant ? 'Contract Employee' : 'Employee Personnel'}
        </TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell align="right">{calculateTotalCost(employeeAllocations, isConsultant)}</TableCell>
        <TableCell></TableCell>
      </TableRow>

      {filteredEmployees.map((emp) => (
        <React.Fragment key={emp.id}>
          <TableRow>
            <TableCell></TableCell>
            <TableCell sx={{ pl: 4 }}>{emp.name}</TableCell>
            <TableCell align="right">
              {emp.allocations.length === 1 ? emp.allocations[0].rate : ''}
            </TableCell>
            <TableCell align="right">
              {emp.allocations.length === 1 ? emp.allocations[0].hours : emp.totalHours}
            </TableCell>
            <TableCell align="right">{emp.totalCost}</TableCell>
            <TableCell>
              <TextField
                size="small"
                fullWidth
                value={emp.remarks}
                onChange={(e) => onRemarksChange(emp.id, e.target.value)}
                sx={textFieldStyle}
              />
            </TableCell>
          </TableRow>
        </React.Fragment>
      ))}
    </>
  );
};

export default EmployeePersonnelTable;
