import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Typography,
  styled,
  Container,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CorrespondenceDialog from './Correspondancecomponents/CorrespondenceDialog';
import {
  createInwardRow,
  createOutwardRow,
  getInwardRows,
  getOutwardRows,
  deleteInwardRow,
  deleteOutwardRow,
  InwardRow,
  OutwardRow
} from '../../services/correspondenceApi';
import { projectManagementAppContext } from '../../App';
import { FormWrapper } from './FormWrapper';

const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(0),
  '& .MuiButton-root': {
    marginLeft: 'auto'
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: '40px',
  '& .MuiTab-root': {
    minHeight: '40px',
    padding: '0 16px',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none',
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiTabs-indicator': {
    height: '2px',
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`correspondence-tabpanel-${index}`}
      aria-labelledby={`correspondence-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const CorrespondenceForm: React.FC = () => {
  const context = useContext(projectManagementAppContext);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inwardRows, setInwardRows] = useState<InwardRow[]>([]);
  const [outwardRows, setOutwardRows] = useState<OutwardRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState<InwardRow | OutwardRow | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{id: number, type: 'inward' | 'outward'} | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(true);

  // Check if token is valid
  const checkToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsTokenValid(false);
      setError('You must be logged in to access this feature. Please log in again.');
      return false;
    }

    try {
      // Log token for debugging
      console.log('Token found:', token.substring(0, 20) + '...');
      return true;
    } catch (err) {
      console.error('Error checking token:', err);
      setIsTokenValid(false);
      setError('Invalid authentication token. Please log in again.');
      return false;
    }
  }, []);

  useEffect(() => {
    if (!checkToken()) return;

    if (context?.selectedProject?.id) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const projectId = context.selectedProject.id;
          const [inwardData, outwardData] = await Promise.all([
            getInwardRows(projectId),
            getOutwardRows(projectId)
          ]);
          setInwardRows(inwardData);
          setOutwardRows(outwardData);
        } catch (err: any) {
          console.error('Error fetching correspondence data:', err);
          if (err.response && err.response.status === 401) {
            setIsTokenValid(false);
            setError('Your session has expired. Please log in again.');
          } else {
            setError('Failed to load correspondence data. Please try again.');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [context?.selectedProject?.id, checkToken]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddClick = () => {
    setIsEdit(false);
    setEditData(null);
    setDialogOpen(true);
  };

  const handleEditClick = (data: InwardRow | OutwardRow) => {
    setIsEdit(true);
    setEditData(data);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: number, type: 'inward' | 'outward') => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setIsEdit(false);
    setEditData(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    if (!checkToken()) return;

    setLoading(true);
    setError(null);
    try {
      if (itemToDelete.type === 'inward') {
        await deleteInwardRow(itemToDelete.id);
        setInwardRows(inwardRows.filter(row => row.id !== itemToDelete.id));
      } else {
        await deleteOutwardRow(itemToDelete.id);
        setOutwardRows(outwardRows.filter(row => row.id !== itemToDelete.id));
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error deleting correspondence:', err);
      if (err.response && err.response.status === 401) {
        setIsTokenValid(false);
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to delete correspondence. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    if (!context?.selectedProject?.id) return;
    if (!checkToken()) return;

    setLoading(true);
    setError(null);
    try {
      // Log authentication status
      console.log('Authentication status:', {
        token: localStorage.getItem('token') ? 'Present' : 'Missing',
        isTokenValid
      });
      const projectId = context.selectedProject.id;
      const newData = { ...data, projectId };

      // Handle date formatting and add required fields
      const formatDates = (data: any, isUpdate = false) => {
        const formattedData = { ...data };

        // Only add CreatedBy field for new records - this is required by the backend
        if (!isUpdate) {
          const user = context?.user;
          formattedData.createdBy = user?.userName || 'System';
          console.log('Adding createdBy for new record');
        } else {
          console.log('Not adding createdBy for update - using existing value');
          // Make sure we don't have createdBy in update requests
          delete formattedData.createdBy;
        }

        // Make sure all required dates are properly formatted
        if (formattedData.letterDate) {
          try {
            formattedData.letterDate = new Date(formattedData.letterDate).toISOString();
          } catch (e) {
            console.error('Invalid letterDate format:', formattedData.letterDate, e);
          }
        }

        if (formattedData.receiptDate) {
          try {
            formattedData.receiptDate = new Date(formattedData.receiptDate).toISOString();
          } catch (e) {
            console.error('Invalid receiptDate format:', formattedData.receiptDate, e);
          }
        }

        if (formattedData.repliedDate && formattedData.repliedDate !== '') {
          try {
            formattedData.repliedDate = new Date(formattedData.repliedDate).toISOString();
          } catch (e) {
            console.error('Invalid repliedDate format:', formattedData.repliedDate, e);
            // If there's an error, set to null instead of invalid date
            formattedData.repliedDate = null;
          }
        } else {
          // Make sure empty string is converted to null
          formattedData.repliedDate = null;
        }

        console.log('Formatted data with CreatedBy:', formattedData);
        return formattedData;
      };

      console.log('Saving data:', newData);

      // Check for our special flag to determine if this is an edit operation
      const isUpdateOperation = data._isEditOperation === true;
      console.log('OPERATION TYPE FROM FLAG:', isUpdateOperation ? 'UPDATE' : 'CREATE');
      console.log('DATA ID:', data.id);

      if (isUpdateOperation && data.id) {
        // Update existing record - using the ID from the data
        if (tabValue === 0) {
          // Remove our special flag before sending to API
          const { _isEditOperation, ...cleanData } = newData;
          const updatedData = formatDates(cleanData, true); // Pass true for isUpdate

          // Add UpdatedBy field for updates
          const user = context?.user;
          updatedData.updatedBy = user?.userName || 'System';

          console.log('Formatted data for update:', updatedData);
          console.log('EXPLICITLY CALLING PUT API with ID:', data.id);

          // DIRECT AXIOS PUT REQUEST - completely bypassing the API functions
          console.log('USING DIRECT AXIOS PUT REQUEST');
          const token = localStorage.getItem('token');
          const response = await axios.put(
            `http://localhost:5245/api/correspondence/inward/${data.id}`,
            updatedData,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
              },
              withCredentials: false
            }
          );
          const updatedRow = response.data;
          console.log('Update successful, response:', updatedRow);

          // Update the state with the updated row
          setInwardRows(inwardRows.map(row => row.id === data.id ? updatedRow : row));
        } else {
          // Remove our special flag before sending to API
          const { _isEditOperation, ...cleanData } = newData;
          const updatedData = formatDates(cleanData, true); // Pass true for isUpdate

          // Add UpdatedBy field for updates
          const user = context?.user;
          updatedData.updatedBy = user?.userName || 'System';

          console.log('Formatted data for update:', updatedData);
          console.log('EXPLICITLY CALLING PUT API with ID:', data.id);

          // DIRECT AXIOS PUT REQUEST - completely bypassing the API functions
          console.log('USING DIRECT AXIOS PUT REQUEST');
          const token = localStorage.getItem('token');
          const response = await axios.put(
            `http://localhost:5245/api/correspondence/outward/${data.id}`,
            updatedData,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
              },
              withCredentials: false
            }
          );
          const updatedRow = response.data;
          console.log('Update successful, response:', updatedRow);

          // Update the state with the updated row
          setOutwardRows(outwardRows.map(row => row.id === data.id ? updatedRow : row));
        }
      } else {
        // Create new record
        // Remove our special flag before sending to API
        const { _isEditOperation, ...cleanData } = newData;

        if (tabValue === 0) {
          const formattedData = formatDates(cleanData);
          console.log('Formatted data for create:', formattedData);
          console.log('CALLING POST API for new inward record');
          const newRow = await createInwardRow(formattedData);
          setInwardRows([...inwardRows, newRow]);
        } else {
          const formattedData = formatDates(cleanData);
          console.log('Formatted data for create:', formattedData);
          console.log('CALLING POST API for new outward record');
          const newRow = await createOutwardRow(formattedData);
          setOutwardRows([...outwardRows, newRow]);
        }
      }
    } catch (err: any) {
      console.error('Error saving correspondence data:', err);
      let errorMessage = 'Failed to save correspondence data. Please try again.';

      // Check for authentication error
      if (err.response && err.response.status === 401) {
        setIsTokenValid(false);
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (err.response && err.response.data) {
        // Try to extract more detailed error message if available
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderInwardAccordions = () => {
    return inwardRows.map((row, index) => (
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
                #{index + 1}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography fontWeight="medium">{row.incomingLetterNo}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography color="text.secondary">{row.letterDate}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography>{row.from}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography noWrap>{row.subject}</Typography>
            </Grid>
            <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(row);
                }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row.id, 'inward');
                }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                  Letter Information
                </Typography>
                <Typography variant="body2" paragraph>
                  NJS Inward No: {row.njsInwardNo}
                </Typography>
                <Typography variant="body2" paragraph>
                  Receipt Date: {row.receiptDate}
                </Typography>
                <Typography variant="body2" paragraph>
                  Attachment Details: {row.attachmentDetails}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                  Action Information
                </Typography>
                <Typography variant="body2" paragraph>
                  Action Taken: {row.actionTaken}
                </Typography>
                <Typography variant="body2" paragraph>
                  Storage Path: {row.storagePath}
                </Typography>
                <Typography variant="body2" paragraph>
                  Replied Date: {row.repliedDate}
                </Typography>
              </Box>
            </Grid>
            {row.remarks && (
              <Grid item xs={12}>
                <Box>
                  <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                    Remarks
                  </Typography>
                  <Typography variant="body2">
                    {row.remarks}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    ));
  };

  const renderOutwardAccordions = () => {
    return outwardRows.map((row, index) => (
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
                #{index + 1}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography fontWeight="medium">{row.letterNo}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography color="text.secondary">{row.letterDate}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography>{row.to}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography noWrap>{row.subject}</Typography>
            </Grid>
            <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(row);
                }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row.id, 'outward');
                }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                  Letter Information
                </Typography>
                <Typography variant="body2" paragraph>
                  Attachment Details: {row.attachmentDetails}
                </Typography>
                <Typography variant="body2" paragraph>
                  Storage Path: {row.storagePath}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                  Action Information
                </Typography>
                <Typography variant="body2" paragraph>
                  Action Taken: {row.actionTaken}
                </Typography>
                <Typography variant="body2" paragraph>
                  Acknowledgement: {row.acknowledgement}
                </Typography>
              </Box>
            </Grid>
            {row.remarks && (
              <Grid item xs={12}>
                <Box>
                  <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                    Remarks
                  </Typography>
                  <Typography variant="body2">
                    {row.remarks}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    ));
  };

  if (!context?.selectedProject?.id) {
    return (
      <FormWrapper>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Alert severity="warning">Please select a project to view the correspondence register.</Alert>
        </Container>
      </FormWrapper>
    );
  }

  const formContent = (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            !isTokenValid && (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  if (context?.handleLogout) {
                    context.handleLogout();
                  }
                }}
              >
                Login Again
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}

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
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: '#1976d2',
                  fontWeight: 500,
                  mb: 2
                }}
              >
                PMD4. Correspondence Inward-Outward
              </Typography>
              <StyledTabs
                value={tabValue}
                onChange={handleTabChange}
              >
                <Tab label="Inward" />
                <Tab label="Outward" />
              </StyledTabs>
            </Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              disabled={loading}
            >
              Add Entry
            </Button>
          </StyledHeaderBox>

          <Box sx={{ mt: 2 }}>
            <TabPanel value={tabValue} index={0}>
              {loading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>Loading inward correspondence...</Typography>
                </Box>
              ) : inwardRows.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No inward correspondence found. Click "Add Entry" to create one.</Typography>
                </Box>
              ) : (
                renderInwardAccordions()
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {loading ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>Loading outward correspondence...</Typography>
                </Box>
              ) : outwardRows.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No outward correspondence found. Click "Add Entry" to create one.</Typography>
                </Box>
              ) : (
                renderOutwardAccordions()
              )}
            </TabPanel>
          </Box>

          <CorrespondenceDialog
            open={dialogOpen}
            onClose={handleDialogClose}
            onSave={handleSave}
            type={tabValue === 0 ? 'inward' : 'outward'}
            editData={editData}
            isEdit={isEdit}
          />

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteDialogClose}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <DialogTitle id="delete-dialog-title">
              Confirm Deletion
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-dialog-description">
                Are you sure you want to delete this correspondence? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteDialogClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </Container>
  );

  return (
    <FormWrapper>
      {formContent}
    </FormWrapper>
  );
};

export default CorrespondenceForm;
