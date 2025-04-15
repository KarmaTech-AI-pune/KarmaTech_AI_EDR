import React from 'react';
import {
  TableRow,
  TableCell,
  TextField
} from '@mui/material';
import { ProjectSpecificTableProps, ProjectSpecificType } from '../../../types/jobStartForm';

const ProjectSpecificTable: React.FC<ProjectSpecificTableProps> = ({
  projectSpecific,
  onProjectSpecificChange,
  textFieldStyle,
  tableCellStyle
}) => {
  return (
    <>
      {(Object.entries(projectSpecific) as [keyof ProjectSpecificType, any][]).map(([id, entry]) => (
        <TableRow key={id}>
          <TableCell sx={{ pl: 3 }}>{id}</TableCell>
          <TableCell>
            <TextField
              size="small"
              fullWidth
              value={entry.name}
              onChange={(e) => onProjectSpecificChange(id, 'name', e.target.value)}
              placeholder="Project specific item name"
              sx={textFieldStyle}
            />
          </TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell align="right">
            <TextField
              size="small"
              type="number"
              value={entry.number}
              onChange={(e) => onProjectSpecificChange(id, 'number', e.target.value)}
              sx={textFieldStyle}
            />
          </TableCell>
          <TableCell>
            <TextField
              size="small"
              fullWidth
              value={entry.remarks}
              onChange={(e) => onProjectSpecificChange(id, 'remarks', e.target.value)}
              sx={textFieldStyle}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default ProjectSpecificTable;
