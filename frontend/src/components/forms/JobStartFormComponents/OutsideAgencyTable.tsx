import React from 'react';
import {
  TableRow,
  TableCell,
  TextField
} from '@mui/material';
import { OutsideAgencyTableProps, OutsideAgencyType } from '../../../types/jobStartForm';

const OutsideAgencyTable: React.FC<OutsideAgencyTableProps> = ({
  outsideAgency,
  onOutsideAgencyChange,
  calculateOutsideAgencyCost,
  textFieldStyle,
  tableCellStyle
}) => {
  return (
    <>
      <TableRow>
        <TableCell sx={{ pl: 3 }}>6a</TableCell>
        <TableCell colSpan={5}>Outside Agency</TableCell>
      </TableRow>

      {(Object.entries(outsideAgency) as [keyof OutsideAgencyType, any][]).map(([id, entry]) => (
        <TableRow key={id}>
          <TableCell></TableCell>
          <TableCell>
            <TextField
              size="small"
              fullWidth
              value={entry.description}
              onChange={(e) => onOutsideAgencyChange(id, 'description', e.target.value)}
              placeholder="Enter description"
              sx={textFieldStyle}
            />
          </TableCell>
          <TableCell>
            <TextField
              size="small"
              type="number"
              value={entry.rate}
              onChange={(e) => onOutsideAgencyChange(id, 'rate', e.target.value)}
              placeholder="Rate"
              sx={textFieldStyle}
            />
          </TableCell>
          <TableCell>
            <TextField
              size="small"
              type="number"
              value={entry.units}
              onChange={(e) => onOutsideAgencyChange(id, 'units', e.target.value)}
              placeholder="Units"
              sx={textFieldStyle}
            />
          </TableCell>
          <TableCell align="right">
            {calculateOutsideAgencyCost(entry)}
          </TableCell>
          <TableCell>
            <TextField
              size="small"
              fullWidth
              value={entry.remarks}
              onChange={(e) => onOutsideAgencyChange(id, 'remarks', e.target.value)}
              placeholder="Remarks"
              sx={textFieldStyle}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default OutsideAgencyTable;
