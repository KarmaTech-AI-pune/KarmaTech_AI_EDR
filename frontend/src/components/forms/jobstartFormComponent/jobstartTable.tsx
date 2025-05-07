import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Box,
  Typography,
  Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// Define the interface for a job start table row
interface JobStartRow {
  id: string;
  activity: string;
  responsibility: string;
  targetDate: string;
  status: string;
  remarks: string;
}

interface JobStartTableProps {
  rows: JobStartRow[];
  onRowsChange: (rows: JobStartRow[]) => void;
  readOnly?: boolean;
}

const JobStartTable: React.FC<JobStartTableProps> = ({ 
  rows, 
  onRowsChange,
  readOnly = false
}) => {
  // Function to add a new row
  const handleAddRow = () => {
    const newRow: JobStartRow = {
      id: `row-${Date.now()}`,
      activity: '',
      responsibility: '',
      targetDate: '',
      status: '',
      remarks: ''
    };
    onRowsChange([...rows, newRow]);
  };

  // Function to delete a row
  const handleDeleteRow = (id: string) => {
    onRowsChange(rows.filter(row => row.id !== id));
  };

  // Function to update a row
  const handleRowChange = (id: string, field: keyof JobStartRow, value: string) => {
    const updatedRows = rows.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });
    onRowsChange(updatedRows);
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h6" component="h2" sx={{ color: '#1976d2' }}>
          Job Start Activities
        </Typography>
        {!readOnly && (
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />} 
            onClick={handleAddRow}
            size="small"
          >
            Add Activity
          </Button>
        )}
      </Box>
      
      <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>No.</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Activity</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Responsibility</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Target Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Remarks</TableCell>
              {!readOnly && (
                <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {readOnly ? (
                    row.activity
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={row.activity}
                      onChange={(e) => handleRowChange(row.id, 'activity', e.target.value)}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    row.responsibility
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={row.responsibility}
                      onChange={(e) => handleRowChange(row.id, 'responsibility', e.target.value)}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    row.targetDate
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="date"
                      value={row.targetDate}
                      onChange={(e) => handleRowChange(row.id, 'targetDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    row.status
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={row.status}
                      onChange={(e) => handleRowChange(row.id, 'status', e.target.value)}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    row.remarks
                  ) : (
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={row.remarks}
                      onChange={(e) => handleRowChange(row.id, 'remarks', e.target.value)}
                    />
                  )}
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteRow(row.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={readOnly ? 6 : 7} align="center" sx={{ py: 2 }}>
                  No activities added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default JobStartTable;
