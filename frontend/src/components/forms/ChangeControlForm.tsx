import React, { useState, useEffect, useContext } from 'react';
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
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { ChangeControl } from '../../dummyapi/database/dummyChangeControl';
import { ChangeControlDialog } from './ChangeControlcomponents/ChangeControlDialog';
import { 
  getChangeControlsByProjectId, 
  createChangeControl, 
  updateChangeControl, 
  deleteChangeControl 
} from '../../dummyapi/changeControlApi';
import { projectManagementAppContext } from '../../App';

const ChangeControlForm: React.FC = () => {
  const context = useContext(projectManagementAppContext);
  const [rows, setRows] = useState<ChangeControl[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (context?.selectedProject?.id) {
      // Load initial data filtered by projectId from context
      const data = getChangeControlsByProjectId(context.selectedProject.id);
      setRows(data);
    }
  }, [context?.selectedProject?.id]);

  const handleOpenDialog = () => {
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleSave = (data: Omit<ChangeControl, 'id' | 'projectId'>) => {
    if (!context?.selectedProject?.id) return;

    if (editingId !== null) {
      // Update existing row
      const updated = updateChangeControl(editingId, { ...data, projectId: context.selectedProject.id });
      if (updated) {
        setRows(rows.map(row => row.id === editingId ? updated : row));
      }
    } else {
      // Create new row
      const created = createChangeControl({ ...data, projectId: context.selectedProject.id });
      setRows([...rows, created]);
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    const success = deleteChangeControl(id);
    if (success) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  const getNextSrNo = () => {
    return rows.length > 0 ? Math.max(...rows.map(row => row.srNo)) + 1 : 1;
  };

  if (!context?.selectedProject?.id) {
    return null;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          PMD6. Change Control Register
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Change Control
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
              <TableCell>Actions</TableCell>
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
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.srNo}</TableCell>
                <TableCell>{row.dateLogged}</TableCell>
                <TableCell>{row.originator}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.costImpact}</TableCell>
                <TableCell>{row.timeImpact}</TableCell>
                <TableCell>{row.resourcesImpact}</TableCell>
                <TableCell>{row.qualityImpact}</TableCell>
                <TableCell>{row.changeOrderStatus}</TableCell>
                <TableCell>{row.clientApprovalStatus}</TableCell>
                <TableCell>{row.claimSituation}</TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEdit(row.id)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete(row.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ChangeControlDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        nextSrNo={getNextSrNo()}
      />
    </Paper>
  );
};

export default ChangeControlForm;
