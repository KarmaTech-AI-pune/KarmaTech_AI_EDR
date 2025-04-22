import React from 'react';
import {
  TableRow,
  TableCell,
  TextField
} from '@mui/material';
import { TimeContingencyRowProps } from '../../../types/jobStartForm';

const TimeContingencyRow: React.FC<TimeContingencyRowProps> = ({
  timeContingency,
  onTimeContingencyChange,
  calculateTimeContingencyCost,
  textFieldStyle
}) => {
  return (
    <TableRow>
      <TableCell sx={{ pl: 3 }}>1b</TableCell>
      <TableCell>Time Contingencies</TableCell>
      <TableCell>
        <TextField
          size="small"
          type="number"
          value={timeContingency.rate}
          onChange={(e) => onTimeContingencyChange('rate', e.target.value)}
          placeholder="Rate"
          sx={textFieldStyle}
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          type="number"
          value={timeContingency.units}
          onChange={(e) => onTimeContingencyChange('units', e.target.value)}
          placeholder="Units"
          sx={textFieldStyle}
        />
      </TableCell>
      <TableCell align="right">{calculateTimeContingencyCost()}</TableCell>
      <TableCell>
        <TextField
          size="small"
          fullWidth
          value={timeContingency.remarks}
          onChange={(e) => onTimeContingencyChange('remarks', e.target.value)}
          placeholder="Remarks"
          sx={textFieldStyle}
        />
      </TableCell>
    </TableRow>
  );
};

export default TimeContingencyRow;
