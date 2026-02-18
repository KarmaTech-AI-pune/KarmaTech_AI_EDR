import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Button,
  Box,
  Typography,
  IconButton,
  Container,
  Alert,
  styled,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { CheckReviewDialog } from './CheckReviewcomponents/CheckReviewDialog';
import { CheckReviewRow } from "../../models";
import {
  createCheckReview,
  getCheckReviewsByProject,
  deleteCheckReview,
  updateCheckReview
} from '../../api/checkReviewApi';
import { useProject } from '../../context/ProjectContext';

const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  '& .MuiButton-root': {
    marginLeft: 'auto'
  }
}));

const CheckReviewForm: React.FC = () => {
  const { projectId } = useProject();
  const [rows, setRows] = useState<CheckReviewRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [editingReview, setEditingReview] = useState<CheckReviewRow | undefined>(undefined);
  const lastLoadedId = useRef<string | null>(null);

  useEffect(() => {
    if (projectId && projectId !== lastLoadedId.current) {
      loadReviews();
      lastLoadedId.current = projectId;
    }
  }, [projectId]);

  const loadReviews = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const reviews = await getCheckReviewsByProject(projectId);
      if (reviews) {
        const processed = reviews.map(r => ({ ...r, originalId: (r as any).id?.toString() || null }));
        setRows(processed);
      }
      setError('');
    } catch (err: any) {
      console.error('API CALL ERROR:', err);
      const errorMessage = err.response?.data || err.message || 'Unknown error';
      setError(`Failed to load check review data: ${errorMessage}`);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const getNextActivityNo = (): string => {
    if (rows.length === 0) return "1";
    const maxNo = Math.max(...rows.map(row => parseInt(row.activityNo)));
    return (maxNo + 1).toString();
  };

  const handleAddReview = async (reviewData: Omit<CheckReviewRow, 'projectId' | 'activityNo'>) => {
    if (!projectId) {
      setError('No project selected. Please select a project first.');
      return;
    }

    setLoading(true);
    try {
      if (editingReview) {
        // Update existing review
        console.log('Updating existing review:', editingReview.id);
        await updateCheckReview(editingReview.id!, {
          ...reviewData,
          id: editingReview.id,
          projectId: editingReview.projectId,
          activityNo: editingReview.activityNo,
          // Add createdBy field to ensure it's not lost during update
          createdBy: editingReview.createdBy || 'System'
        });
        setEditingReview(undefined);
      } else {
        // Create new review
        console.log('Creating new review for project:', projectId);
        const newReview: Omit<CheckReviewRow, 'id'> = {
          ...reviewData,
          projectId: projectId,
          activityNo: getNextActivityNo(),
          createdBy: 'System' // Add createdBy field
        };
        await createCheckReview(newReview);
      }
      await loadReviews();
      setDialogOpen(false);
      setError('');
    } catch (err: any) {
      console.error('Error saving review:', err);
      // Extract more detailed error message if available
      const errorMessage = err.response?.data || err.message || 'Failed to save review';
      setError(`Failed to save review: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    setLoading(true);
    try {
      if (id === undefined || id === '') {
        console.error('Cannot delete review: ID is undefined or empty');
        setError('Cannot delete review: ID is missing');
        setLoading(false);
        return;
      }

      console.log('Deleting review with ID:', id);

      // Add confirmation dialog
      if (!window.confirm('Are you sure you want to delete this review?')) {
        console.log('Delete cancelled by user');
        setLoading(false);
        return;
      }

      // Add more detailed logging
      console.log('Proceeding with deletion, ID:', id);

      // Try to find the review in the rows array to get more information
      const reviewToDelete = rows.find(r => r.id?.toString() === id.toString());
      if (reviewToDelete) {
        console.log('Found review to delete:', reviewToDelete);
      } else {
        console.warn('Could not find review with ID:', id);
      }

      const result = await deleteCheckReview(id);
      console.log('Review deleted successfully, result:', result);

      // Reload the reviews list
      await loadReviews();
      setError('');
    } catch (err: any) {
      console.error('Error deleting review:', err);

      // Extract more detailed error message if available
      let errorMessage = 'Unknown error';

      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(`Failed to delete review: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      // Use UTC to be deterministic across different timezones (important for tests)
      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
    } catch {
      return dateString;
    }
  };

  const StatusChip = ({ label, status }: { label: string; status: boolean }) => (
    <Chip
      icon={status ? <CheckCircleIcon data-testid="CheckCircleIcon" /> : <CancelIcon data-testid="CancelIcon" />}
      label={label}
      size="small"
      color={status ? "success" : "default"}
      sx={{
        fontSize: '0.75rem',
        '& .MuiChip-icon': {
          fontSize: '1rem',
        },
      }}
    />
  );

  const formContent = (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <StyledHeaderBox>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Project Check & Review List
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Add Review
          </Button>
        </StyledHeaderBox>

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert data-testid="error-alert" severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        <Box sx={{
          width: '100%',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              PMD5. Check and Review Form
            </Typography>
          </Box>

          <Box>
            {!loading && rows.length === 0 && (
              <Box sx={{ mx: 3, my: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No reviews found for this project. Click "Add Review" to create one.
                </Typography>
              </Box>
            )}
            {rows.map((row) => (
              <Accordion
                key={row.activityNo}
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
                        #{row.activityNo}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography fontWeight="medium">{row.activityName}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography color="text.secondary">{row.fileName}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <StatusChip label="Completion" status={row.completion === 'Y'} />
                      </Box>
                    </Grid>
                    <Grid item xs={2}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Box sx={{ display: 'flex' }}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingReview(row);
                              setDialogOpen(true);
                            }}
                            size="small"
                            color="primary"
                            sx={{ mr: 1 }}
                            aria-label="edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              if ((row as any).id) {
                                handleDeleteReview((row as any).id.toString());
                              } else if ((row as any).originalId) {
                                handleDeleteReview((row as any).originalId.toString());
                              }
                            }}
                            size="small"
                            color="error"
                            title="Delete review"
                            aria-label="delete review"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                          Activity Details
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Objective: {row.objective}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          References: {row.references}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Quality Issues: {row.qualityIssues}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                          Review Information
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Checked By: {formatDate(row.checkedBy)}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Approved By: {formatDate(row.approvedBy)}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Action Taken: {row.actionTaken}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      </Paper>

      <CheckReviewDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingReview(undefined);
        }}
        onSave={handleAddReview}
        editData={editingReview}
        nextActivityNo={getNextActivityNo()}
      />
    </Container>
  );

  if (!projectId) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="warning">Please select a project to view the check and review form.</Alert>
      </Container>
    );
  }

  return (
    <>
      {formContent}
    </>
  );
};

export default CheckReviewForm;
