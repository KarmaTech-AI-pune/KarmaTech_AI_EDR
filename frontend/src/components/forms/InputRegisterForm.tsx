import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  IconButton,
  Checkbox,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface InputRegisterRow {
  id: number;
  dataReceived: string;
  receiptDate: string;
  receivedFrom: string;
  filesFormat: string;
  noOfFiles: string;
  fitForPurpose: boolean;
  check: boolean;
  checkedBy: string;
  checkedDate: string;
  custodian: string;
  storagePath: string;
  remarks: string;
}

const emptyRow = (): InputRegisterRow => ({
  id: Date.now(),
  dataReceived: '',
  receiptDate: '',
  receivedFrom: '',
  filesFormat: '',
  noOfFiles: '',
  fitForPurpose: false,
  check: false,
  checkedBy: '',
  checkedDate: '',
  custodian: '',
  storagePath: '',
  remarks: '',
});

const InputRegisterForm: React.FC = () => {
  const theme = useTheme();
  const [rows, setRows] = useState<InputRegisterRow[]>([emptyRow()]);

  const addRow = () => {
    setRows([...rows, emptyRow()]);
  };

  const removeRow = (id: number) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: number, field: keyof InputRegisterRow, value: any) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const commonTextFieldStyles = {
    '& .MuiInputBase-input': { 
      py: 1.5,
      px: 2,
      backgroundColor: 'background.paper',
    },
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
  };

  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 4,
        backgroundColor: '#f8f9fa',
        borderRadius: 2
      }}
    >
      {/* Header with title and Add Row button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            color: theme.palette.primary.main,
            fontWeight: 600
          }}
        >
          PMD3. Input Register
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addRow}
          sx={{ 
            py: 1.5, 
            px: 4,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          Add Row
        </Button>
      </Box>
      
      {/* Table Container */}
      <TableContainer 
        sx={{ 
          backgroundColor: 'white',
          borderRadius: 1,
          boxShadow: 1,
          overflowX: 'auto'
        }}
      >
        <Table size="medium" sx={{ minWidth: 2000 }}>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  minWidth: 80,
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 600
                }}
              >
                Sr. No.
              </TableCell>
              {[
                { label: 'Data Received', width: 200 },
                { label: 'Receipt date', width: 150 },
                { label: 'Received From', width: 200 },
                { label: 'Files format', width: 150 },
                { label: 'No. of files', width: 120 },
                { label: 'Fit for purpose', width: 150 },
                { label: 'Check', width: 120 },
                { label: 'Checked By', width: 150 },
                { label: 'Checked Date', width: 150 },
                { label: 'Custodian', width: 150 },
                { label: 'Storage path', width: 200 },
                { label: 'Remarks', width: 200 },
                { label: 'Actions', width: 80 }
              ].map((header) => (
                <TableCell 
                  key={header.label}
                  sx={{ 
                    minWidth: header.width,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow 
                key={row.id}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{index + 1}</TableCell>
                <TableCell>
                  <TextField
                    value={row.dataReceived}
                    onChange={(e) => updateRow(row.id, 'dataReceived', e.target.value)}
                    fullWidth
                    sx={commonTextFieldStyles}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    value={row.receiptDate}
                    onChange={(e) => updateRow(row.id, 'receiptDate', e.target.value)}
                    fullWidth
                    sx={commonTextFieldStyles}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.receivedFrom}
                    onChange={(e) => updateRow(row.id, 'receivedFrom', e.target.value)}
                    fullWidth
                    sx={commonTextFieldStyles}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.filesFormat}
                    onChange={(e) => updateRow(row.id, 'filesFormat', e.target.value)}
                    fullWidth
                    sx={commonTextFieldStyles}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={row.noOfFiles}
                    onChange={(e) => updateRow(row.id, 'noOfFiles', e.target.value)}
                    fullWidth
                    sx={commonTextFieldStyles}
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={row.fitForPurpose}
                    onChange={(e) => updateRow(row.id, 'fitForPurpose', e.target.checked)}
                    sx={{ 
                      '& .MuiSvgIcon-root': { fontSize: 28 },
                      color: theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={row.check}
                    onChange={(e) => updateRow(row.id, 'check', e.target.checked)}
                    sx={{ 
                      '& .MuiSvgIcon-root': { fontSize: 28 },
                      color: theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.checkedBy}
                    onChange={(e) => updateRow(row.id, 'checkedBy', e.target.value)}
                    fullWidth
                    sx={commonTextFieldStyles}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    value={row.checkedDate}
                    onChange={(e) => updateRow(row.id, 'checkedDate', e.target.value)}
                    fullWidth
                    sx={commonTextFieldStyles}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.custodian}
                    onChange={(e) => updateRow(row.id, 'custodian', e.target.value)}
                    fullWidth
                    sx={commonTextFieldStyles}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.storagePath}
                    onChange={(e) => updateRow(row.id, 'storagePath', e.target.value)}
                    fullWidth
                    sx={commonTextFieldStyles}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.remarks}
                    onChange={(e) => updateRow(row.id, 'remarks', e.target.value)}
                    fullWidth
                    sx={commonTextFieldStyles}
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => removeRow(row.id)}
                    color="error"
                    sx={{ 
                      p: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.04)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default InputRegisterForm;
