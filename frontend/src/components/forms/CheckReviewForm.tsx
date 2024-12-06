import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface CheckReviewRow {
  activityNo: string;
  activityName: string;
  objective: string;
  references: string;
  fileName: string;
  qualityIssues: string;
  completion: string;
  checkedBy: string;
  approvedBy: string;
  actionTaken: string;
}

const emptyRow: CheckReviewRow = {
  activityNo: '',
  activityName: '',
  objective: '',
  references: '',
  fileName: '',
  qualityIssues: '',
  completion: '',
  checkedBy: '',
  approvedBy: '',
  actionTaken: ''
};

const CheckReviewForm: React.FC = () => {
  const [rows, setRows] = useState<CheckReviewRow[]>([emptyRow]);

  const handleAddRow = () => {
    setRows([...rows, { ...emptyRow }]);
  };

  const handleInputChange = (index: number, field: keyof CheckReviewRow, value: string) => {
    const newRows = rows.map((row, i) => {
      if (i === index) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setRows(newRows);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        PMD5. Check and Review Form
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table sx={{ minWidth: 650 }} aria-label="check review table">
          <TableHead>
            <TableRow>
              <TableCell>Activity No</TableCell>
              <TableCell>Activity Name</TableCell>
              <TableCell>Objective</TableCell>
              <TableCell>References and Standards</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Specific Quality Issues</TableCell>
              <TableCell>Completion Y/N</TableCell>
              <TableCell>Checked by / Date</TableCell>
              <TableCell>Approved by / Date</TableCell>
              <TableCell>Action Taken</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.activityNo}
                    onChange={(e) => handleInputChange(index, 'activityNo', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.activityName}
                    onChange={(e) => handleInputChange(index, 'activityName', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.objective}
                    onChange={(e) => handleInputChange(index, 'objective', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.references}
                    onChange={(e) => handleInputChange(index, 'references', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.fileName}
                    onChange={(e) => handleInputChange(index, 'fileName', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.qualityIssues}
                    onChange={(e) => handleInputChange(index, 'qualityIssues', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.completion}
                    onChange={(e) => handleInputChange(index, 'completion', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.checkedBy}
                    onChange={(e) => handleInputChange(index, 'checkedBy', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.approvedBy}
                    onChange={(e) => handleInputChange(index, 'approvedBy', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={row.actionTaken}
                    onChange={(e) => handleInputChange(index, 'actionTaken', e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
        >
          Add Row
        </Button>
      </Box>
    </Paper>
  );
};

export default CheckReviewForm;
