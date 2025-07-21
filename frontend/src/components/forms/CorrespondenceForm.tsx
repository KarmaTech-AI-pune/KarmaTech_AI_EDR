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
  getInwardRows,
  getOutwardRows,
  deleteInwardRow,
  deleteOutwardRow,
  InwardRow,
  OutwardRow
} from '../../services/correspondenceApi';
import { projectManagementAppContext } from '../../App';

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
          const projectId = context.selectedProject?.id;
          const [inwardData, outwardData] = await Promise.all([
            getInwardRows(projectId!),
            getOutwardRows(projectId!)
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
      console.log('Authentication status:', {
        token: localStorage.getItem('token') ? 'Present' : 'Missing',
        isTokenValid
      });

      const projectId = context.selectedProject.id;
      const newData = { ...data, projectId };

      // Format dates and prepare data for API
      const formatData = (data: any, isUpdate = false) => {
        const formattedData = { ...data };

        // Remove special flag used for tracking edit operations
        if (formattedData._isEditOperation !== undefined) {
          delete formattedData._isEditOperation;
        }

        // Handle create vs update operations differently
        if (!isUpdate) {
          // For new records, remove ID and audit fields
          delete formattedData.id;
          delete formattedData.createdAt;
          delete formattedData.updatedAt;
          delete formattedData.updatedBy;

          // Add createdBy for new records
          const user = context?.user;
          formattedData.createdBy = user?.userName || 'System';
        } else {
          // For updates, keep ID but remove other backend-managed fields
          delete formattedData.createdAt;

          // Add updatedBy for update operations
          const user = context?.user;
          formattedData.updatedBy = user?.userName || 'System';
        }

        // Format all date fields properly
        const formatDate = (dateValue: any) => {
          if (!dateValue || dateValue === '') return null;

          try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
              console.error('Invalid date value:', dateValue);
              return null;
            }
            return date.toISOString();
          } catch (e) {
            console.error('Error formatting date:', e);
            return null;
          }
        };

        // Format common date fields
        if (formattedData.letterDate) {
          formattedData.letterDate = formatDate(formattedData.letterDate);
        }

        // Format inward-specific date fields
        if (formattedData.receiptDate) {
          formattedData.receiptDate = formatDate(formattedData.receiptDate);
        }

        if (formattedData.repliedDate) {
          formattedData.repliedDate = formatDate(formattedData.repliedDate);
        } else {
          formattedData.repliedDate = null;
        }

        // Ensure projectId is a number
        if (formattedData.projectId && typeof formattedData.projectId !== 'number') {
          formattedData.projectId = Number(formattedData.projectId);
        }

        return formattedData;
      };

      // Determine if this is an update operation
      // Check both the _isEditOperation flag and the presence of an ID
      const hasEditFlag = data._isEditOperation === true;
      const hasId = data.id !== undefined && data.id !== null;
      const isUpdateOperation = hasEditFlag || hasId;

      console.log('Operation detection:', {
        hasEditFlag,
        hasId,
        finalDecision: isUpdateOperation ? 'UPDATE' : 'CREATE'
      });
      console.log('Data received from dialog:', JSON.stringify(data, null, 2));

      // Get API endpoint based on tab value
      const endpoint = tabValue === 0 ? 'inward' : 'outward';
      const baseUrl = `${import.meta.env.VITE_API_BASE_URL}api/correspondence/${endpoint}`;

      // Prepare headers for API request
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      };

      if (isUpdateOperation) {
        // UPDATE OPERATION
        if (data.id === undefined || data.id === null) {
          console.error('Update operation detected but no ID found!');
          throw new Error('Cannot update record: Missing ID');
        }

        console.log('Updating existing record with ID:', data.id);
        console.log('This should use PUT method to endpoint:', `${baseUrl}/${data.id}`);

        // Format data for update
        const formattedData = formatData(newData, true);

        // Ensure ID is valid - note that ID can be 0 in some cases, so we need to check if it's undefined or null
        if (formattedData.id === undefined || formattedData.id === null || typeof formattedData.id !== 'number') {
          throw new Error('Invalid ID for update operation');
        }

        // Preserve createdBy from original record if not present
        if (!formattedData.createdBy) {
          const rows = tabValue === 0 ? inwardRows : outwardRows;
          const originalRecord = rows.find(row => row.id === data.id);

          if (originalRecord && originalRecord.createdBy) {
            formattedData.createdBy = originalRecord.createdBy;
          } else {
            formattedData.createdBy = 'System'; // Fallback
          }
        }

        console.log('Sending update data to API:', JSON.stringify(formattedData, null, 2));

        // Make API request - explicitly use PUT method for updates
        console.log(`Making PUT request to ${baseUrl}/${data.id}`);
        console.log('PUT request headers:', headers);
        console.log('PUT request data:', JSON.stringify(formattedData, null, 2));

        const response = await axios({
          method: 'put',
          url: `${baseUrl}/${data.id}`,
          data: formattedData,
          headers: headers
        });

        const updatedRow = response.data;
        console.log('Update successful, response:', updatedRow);

        // Update state with updated row
        if (tabValue === 0) {
          setInwardRows(inwardRows.map(row => row.id === data.id ? updatedRow : row));
        } else {
          setOutwardRows(outwardRows.map(row => row.id === data.id ? updatedRow : row));
        }
      } else {
        // CREATE OPERATION
        console.log('Creating new record');

        // Format data for create
        const formattedData = formatData(newData, false);

        // Validate required fields
        const requiredFields = tabValue === 0
          ? ['projectId', 'incomingLetterNo', 'letterDate', 'njsInwardNo', 'receiptDate', 'from', 'subject', 'createdBy']
          : ['projectId', 'letterNo', 'letterDate', 'to', 'subject', 'createdBy'];

        const missingFields = requiredFields.filter(field => {
          if (field === 'letterDate' || field === 'receiptDate') {
            return !formattedData[field]; // Check if date field is missing or null
          }
          return !formattedData[field] || formattedData[field] === '';
        });

        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        console.log('Sending create data to API:', JSON.stringify(formattedData, null, 2));

        // Make API request - explicitly use POST method for creates
        console.log(`Making POST request to ${baseUrl}`);
        console.log('POST request headers:', headers);
        console.log('POST request data:', JSON.stringify(formattedData, null, 2));

        const response = await axios({
          method: 'post',
          url: baseUrl,
          data: formattedData,
          headers: headers
        });

        const newRow = response.data;
        console.log('Create successful, response:', newRow);

        // Update state with new row
        if (tabValue === 0) {
          setInwardRows([...inwardRows, newRow]);
        } else {
          setOutwardRows([...outwardRows, newRow]);
        }
      }
    } catch (err: any) {
      console.error('Error saving correspondence data:', err);

      // Detailed error handling
      let errorMessage = 'Failed to save correspondence data. Please try again.';

      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);

        // Handle different error status codes
        switch (err.response.status) {
          case 401:
            setIsTokenValid(false);
            errorMessage = 'Your session has expired. Please log in again.';
            break;

          case 400:
            errorMessage = 'Invalid data format. Please check all required fields.';
            if (err.response.data) {
              if (typeof err.response.data === 'string') {
                errorMessage = err.response.data;
              } else if (err.response.data.message) {
                // Check if this is the "already exists for project ID" error
                if (err.response.data.message.includes("already exists for project ID")) {
                  errorMessage = err.response.data.message;
                  // Add a more user-friendly explanation
                  errorMessage += " Please edit the existing entry instead of creating a new one.";
                } else {
                  errorMessage = err.response.data.message;
                }
              } else if (err.response.data.error) {
                errorMessage = `Validation error: ${err.response.data.error}`;
              }
            }
            break;

          case 500:
            if (err.response.data) {
              if (typeof err.response.data === 'string') {
                errorMessage = err.response.data;
              } else if (err.response.data.message) {
                errorMessage = err.response.data.message;
              } else if (err.response.data.error) {
                errorMessage = `Server error: ${err.response.data.error}`;

                // Check for entity validation errors
                if (err.response.data.error.includes("entity changes")) {
                  errorMessage = "Database validation error. Please check that all required fields are filled correctly and dates are valid.";
                  console.error("Data that caused the error:", JSON.stringify(err.config?.data, null, 2));
                }
              }
            } else {
              errorMessage = 'Internal server error. Please check the backend logs for details.';
            }
            break;

          default:
            if (err.response.data && typeof err.response.data === 'string') {
              errorMessage = err.response.data;
            } else if (err.response.data && err.response.data.message) {
              errorMessage = err.response.data.message;
            }
        }
      } else if (err.message) {
        // Handle client-side errors
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Final error message displayed to user:', errorMessage);
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
              <Box component="span" sx={{ mr: 1 }}>
                <Tooltip title="Edit">
                  <span>
                    <IconButton size="small" onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(row);
                    }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
              <Box component="span">
                <Tooltip title="Delete">
                  <span>
                    <IconButton size="small" color="error" onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(row.id, 'inward');
                    }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
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
              <Box component="span" sx={{ mr: 1 }}>
                <Tooltip title="Edit">
                  <span>
                    <IconButton size="small" onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(row);
                    }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
              <Box component="span">
                <Tooltip title="Delete">
                  <span>
                    <IconButton size="small" color="error" onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(row.id, 'outward');
                    }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
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
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="warning">Please select a project to view the correspondence register.</Alert>
      </Container>
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
    <>
      {formContent}
    </>
  );
};

export default CorrespondenceForm;
