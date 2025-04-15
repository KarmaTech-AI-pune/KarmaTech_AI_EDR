import React from 'react';
import {
  TableRow,
  TableCell,
  TextField
} from '@mui/material';
import { SurveyWorksRowProps } from '../../../types/jobStartForm';

const SurveyWorksRow: React.FC<SurveyWorksRowProps> = ({
  surveyWorks,
  onSurveyWorksChange,
  textFieldStyle,
  tableCellStyle
}) => {
  return (
    <TableRow>
      <TableCell sx={{ pl: 3 }}>6b</TableCell>
      <TableCell>Survey works</TableCell>
      <TableCell align="right">
        <TextField
          size="small"
          type="number"
          value={surveyWorks.number}
          onChange={(e) => onSurveyWorksChange('number', e.target.value)}
          sx={textFieldStyle}
        />
      </TableCell>
      <TableCell></TableCell>
      <TableCell align="right">{surveyWorks.number}</TableCell>
      <TableCell>
        <TextField
          size="small"
          fullWidth
          value={surveyWorks.remarks}
          onChange={(e) => onSurveyWorksChange('remarks', e.target.value)}
          sx={textFieldStyle}
        />
      </TableCell>
    </TableRow>
  );
};

export default SurveyWorksRow;
