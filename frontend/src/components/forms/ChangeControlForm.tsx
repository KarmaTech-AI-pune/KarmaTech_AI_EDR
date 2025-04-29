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
  Grid,
  CircularProgress
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
} from '../../api/changeControlApi';
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
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editData, setEditData] = useState<ChangeControl | undefined>(undefined);
  const [error, setError] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (context?.selectedProject?.id) {
      loadChangeControls();
    }
  }, [context?.selectedProject?.id]);

  const loadChangeControls = async () => {
    if (!context?.selectedProject?.id) return;

    setLoading(true);
    try {
      const data = await getChangeControlsByProjectId(context.selectedProject.id.toString());
      setRows(data);
      setError('');
    } catch (err: any) {
      console.error('Error loading change controls:', err);
      setError('Failed to load change control data');
      if (err.message) {
        setErrorDetails(err.message);
      } else if (err.response?.data?.message) {
        setErrorDetails(err.response.data.message);
      } else {
        setErrorDetails('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setEditingId(null);
    setEditData(undefined);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setEditData(undefined);
  };

  const handleSave = async (data: Omit<ChangeControl, 'id' | 'projectId'>) => {
    if (!context?.selectedProject?.id) return;

    setLoading(true);
    setError('');
    setErrorDetails('');

    try {
      // Get project ID as a number
      const projectId = typeof context.selectedProject.id === 'string'
        ? parseInt(context.selectedProject.id)
        : context.selectedProject.id;

      // Format the data properly for backend
      const formattedData = {
        ...data,
        dateLogged: data.dateLogged ? new Date(data.dateLogged).toISOString() : new Date().toISOString(),
        // Ensure all string fields have values (even if empty)
        originator: data.originator || '',
        description: data.description || '',
        costImpact: data.costImpact || '',
        timeImpact: data.timeImpact || '',
        resourcesImpact: data.resourcesImpact || '',
        qualityImpact: data.qualityImpact || '',
        changeOrderStatus: data.changeOrderStatus || '',
        clientApprovalStatus: data.clientApprovalStatus || '',
        claimSituation: data.claimSituation || ''
      };

      // Log the data being sent
      console.log("Sending data to backend:", JSON.stringify(formattedData, null, 2));

      if (editingId !== null) {
        // Update existing record
        const updated = await updateChangeControl(
          projectId,
          editingId,
          {
            ...formattedData,
            projectId: projectId
          }
        );
        if (updated) {
          setRows(rows.map(row => row.id === editingId ? updated : row));
        }
      } else {
        // Create new record with next available srNo
        const created = await createChangeControl(
          projectId,
          {
            ...formattedData,
            projectId: projectId,
            srNo: getNextSrNo()
          }
        );
        setRows([...rows, created]);
      }
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving change control:', err);
      setError('Failed to save change control');

      // Extract detailed error message
      if (err.message) {
        setErrorDetails(err.message);
      } else if (err.response?.data?.message) {
        setErrorDetails(err.response.data.message);
      } else if (typeof err.response?.data === 'object' && err.response?.data) {
        setErrorDetails(JSON.stringify(err.response.data));
      } else {
        setErrorDetails('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string | number) => {
    const changeControlToEdit = rows.find(row => row.id === id);
    if (changeControlToEdit) {
      setEditingId(id);
      setEditData(changeControlToEdit);
      setDialogOpen(true);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!context?.selectedProject?.id) return;

    setLoading(true);
    try {
      // Get project ID as a number
      const projectId = typeof context.selectedProject.id === 'string'
        ? parseInt(context.selectedProject.id)
        : context.selectedProject.id;

      await deleteChangeControl(projectId, id);
      setRows(rows.filter(row => row.id !== id));
      setError('');
    } catch (err: any) {
      console.error('Error deleting change control:', err);
      setError('Failed to delete change control');
      if (err.message) {
        setErrorDetails(err.message);
      } else if (err.response?.data?.message) {
        setErrorDetails(err.response.data.message);
      } else {
        setErrorDetails('An unknown error occurred');
      }
    } finally {
      setLoading(false);
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
                {errorDetails && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Details: {errorDetails}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      flexGrow: 1,
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
                      <Grid item xs={7}>
                        <Typography noWrap>
                          {row.description}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionSummary>
                  <Box sx={{ display: 'flex', gap: 1, pr: 2 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(row.id);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
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
        editData={editData}
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
