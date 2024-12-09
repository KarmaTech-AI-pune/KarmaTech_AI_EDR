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
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface ChangeControlRow {
  id: number;
  srNo: number;
  dateLogged: string;
  originator: string;
  description: string;
  projectImpact: {
    cost: string;
    time: string;
    resources: string;
    quality: string;
  };
  changeOrderStatus: string;
  clientApprovalStatus: string;
  claimSituation: string;
}

const ChangeControlForm: React.FC = () => {
  const [rows, setRows] = useState<ChangeControlRow[]>([
    {
      id: 1,
      srNo: 1,
      dateLogged: '',
      originator: '',
      description: '',
      projectImpact: {
        cost: '',
        time: '',
        resources: '',
        quality: ''
      },
      changeOrderStatus: '',
      clientApprovalStatus: '',
      claimSituation: ''
    }
  ]);

  const handleAddRow = () => {
    const newRow: ChangeControlRow = {
      id: rows.length + 1,
      srNo: rows.length + 1,
      dateLogged: '',
      originator: '',
      description: '',
      projectImpact: {
        cost: '',
        time: '',
        resources: '',
        quality: ''
      },
      changeOrderStatus: '',
      clientApprovalStatus: '',
      claimSituation: ''
    };
    setRows([...rows, newRow]);
  };

  const handleInputChange = (
    rowId: number,
    field: string,
    value: string,
    impactField?: string
  ) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        if (impactField) {
          return {
            ...row,
            projectImpact: {
              ...row.projectImpact,
              [impactField]: value
            }
          };
        }
        return {
          ...row,
          [field]: value
        };
      }
      return row;
    }));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          PMD6. Change Control Register
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
        >
          Add Row
        </Button>
      </Box>
      
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Date Logged</TableCell>
              <TableCell>Originator</TableCell>
              <TableCell>Description</TableCell>
              <TableCell colSpan={4} align="center">Project Impact</TableCell>
              <TableCell>Change Order Status</TableCell>
              <TableCell>Client Approval Status</TableCell>
              <TableCell>Claim Situation?</TableCell>
            </TableRow>
            <TableRow>
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell>Cost</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Resources</TableCell>
              <TableCell>Quality</TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.srNo}</TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    size="small"
                    value={row.dateLogged}
                    onChange={(e) => handleInputChange(row.id, 'dateLogged', e.target.value)}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={row.originator}
                    onChange={(e) => handleInputChange(row.id, 'originator', e.target.value)}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={row.description}
                    onChange={(e) => handleInputChange(row.id, 'description', e.target.value)}
                    fullWidth
                    multiline
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={row.projectImpact.cost}
                    onChange={(e) => handleInputChange(row.id, 'projectImpact', e.target.value, 'cost')}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={row.projectImpact.time}
                    onChange={(e) => handleInputChange(row.id, 'projectImpact', e.target.value, 'time')}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={row.projectImpact.resources}
                    onChange={(e) => handleInputChange(row.id, 'projectImpact', e.target.value, 'resources')}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={row.projectImpact.quality}
                    onChange={(e) => handleInputChange(row.id, 'projectImpact', e.target.value, 'quality')}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={row.changeOrderStatus}
                    onChange={(e) => handleInputChange(row.id, 'changeOrderStatus', e.target.value)}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={row.clientApprovalStatus}
                    onChange={(e) => handleInputChange(row.id, 'clientApprovalStatus', e.target.value)}
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={row.claimSituation}
                    onChange={(e) => handleInputChange(row.id, 'claimSituation', e.target.value)}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ChangeControlForm;
