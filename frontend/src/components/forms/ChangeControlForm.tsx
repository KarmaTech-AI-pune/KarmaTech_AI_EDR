import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Container,
  Alert,
  styled,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ChangeControl } from  "../../models";
import { ChangeControlDialog } from './ChangeControlcomponents/ChangeControlDialog';
import { 
  getChangeControlsByProjectId, 
  createChangeControl, 
  updateChangeControl, 
  deleteChangeControl 
} from '../../dummyapi/changeControlApi';
import { projectManagementAppContext } from '../../App';
import { FormWrapper } from './FormWrapper';

const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  '& .MuiButton-root': {
    marginLeft: 'auto'
  }
}));

const ChangeControlForm: React.FC = () => {
  const context = useContext(projectManagementAppContext);
  const [rows, setRows] = useState<ChangeControl[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (context?.selectedProject?.id) {
      loadChangeControls();
    }
  }, [context?.selectedProject?.id]);

  const loadChangeControls = () => {
    if (!context?.selectedProject?.id) return;
    
    try {
      const data = getChangeControlsByProjectId(context.selectedProject.id);
      setRows(data);
      setError('');
    } catch (err) {
      setError('Failed to load change control data');
    }
  };

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

    try {
      if (editingId !== null) {
        const updated = updateChangeControl(editingId, { ...data, projectId: context.selectedProject.id });
        if (updated) {
          setRows(rows.map(row => row.id === editingId ? updated : row));
        }
      } else {
        const created = createChangeControl({ ...data, projectId: context.selectedProject.id });
        setRows([...rows, created]);
      }
      setError('');
    } catch (err) {
      setError('Failed to save change control');
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    try {
      const success = deleteChangeControl(id);
      if (success) {
        setRows(rows.filter(row => row.id !== id));
      }
      setError('');
    } catch (err) {
      setError('Failed to delete change control');
    }
  };

  const getNextSrNo = () => {
    return rows.length > 0 ? Math.max(...rows.map(row => row.srNo)) + 1 : 1;
  };

  if (!context?.selectedProject?.id) {
    return (
      <FormWrapper>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Alert severity="warning">Please select a project to view the change control register.</Alert>
        </Container>
      </FormWrapper>
    );
  }

  const formContent = (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ 
        width: '100%', 
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        pr: 1,
        pb: 4
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            backgroundColor: '#fff'
          }}
        >
          <StyledHeaderBox>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#1976d2',
                fontWeight: 500,
                mb: 0
              }}
            >
              PMD6. Change Control Register
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Add Change Control
            </Button>
          </StyledHeaderBox>

          {error && (
            <Box sx={{ mx: 3, mb: 3 }}>
              <Alert severity="error">
                {error}
              </Alert>
            </Box>
          )}

          <Box>
            {rows.map((row) => (
              <Accordion 
                key={row.id}
                sx={{
                  '&:before': { display: 'none' },
                  borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  '&:last-child': {
                    borderBottom: 'none'
                  },
                  '&.Mui-expanded': {
                    margin: 0,
                  },
                  backgroundColor: '#fff',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '& .MuiAccordionSummary-content': {
                      margin: '12px 0',
                    },
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={1}>
                      <Typography color="primary" fontWeight="bold">
                        #{row.srNo}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography color="text.secondary">
                        {row.dateLogged}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography fontWeight="medium">
                        {row.originator}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography noWrap>
                        {row.description}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row.id);
                          }}
                          size="small"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.id);
                          }}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                          Project Impact
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Cost Impact: {row.costImpact}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Time Impact: {row.timeImpact}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Resources Impact: {row.resourcesImpact}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Quality Impact: {row.qualityImpact}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                          Status Information
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Change Order Status: {row.changeOrderStatus}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Client Approval Status: {row.clientApprovalStatus}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Claim Situation: {row.claimSituation}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Paper>
      </Box>

      <ChangeControlDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        nextSrNo={getNextSrNo()}
      />
    </Container>
  );

  return (
    <FormWrapper>
      {formContent}
    </FormWrapper>
  );
};

export default ChangeControlForm;
