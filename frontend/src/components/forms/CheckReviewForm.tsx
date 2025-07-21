import React, { useState, useEffect, useContext } from 'react';
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

  useEffect(() => {
    if (projectId) {
      loadReviews();
    }
  }, [projectId]);

  const loadReviews = async () => {
    if (!projectId) {
      console.warn('No project selected, cannot load reviews');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading reviews for project:', projectId);

      try {
        const reviews = await getCheckReviewsByProject(projectId);
        console.log('Loaded reviews from backend:', reviews);

        if (!reviews || reviews.length === 0) {
          console.log('No reviews found for this project');
          setRows([]);
          setError('');
          return;
        }

        // Process reviews to ensure proper ID handling
        const processedReviews = reviews.map((review, index) => {
          // Store the original backend ID for API operations
          const backendId = review.id ? review.id.toString() : null;

          // Log each review with its ID for debugging
          console.log(`Review ${index}:`, {
            backendId: backendId,
            activityNo: review.activityNo,
            activityName: review.activityName
          });

          // Return the review with originalId set to the backend ID
          return {
            ...review,
            originalId: backendId
          };
        });

        console.log('Processed reviews with backend IDs:', processedReviews);
        setRows(processedReviews);
        setError('');
      } catch (apiError) {
        console.error('API error loading reviews:', apiError);
        setRows([]);
        setError('Failed to load reviews. Please try again.');
      }
    } catch (err: any) {
      console.error('Error in loadReviews function:', err);
      // Extract more detailed error message if available
      const errorMessage = err.response?.data || err.message || 'Unknown error';
      setError(`Failed to load check review data: ${errorMessage}`);
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
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const StatusChip = ({ label, status }: { label: string; status: boolean }) => (
    <Chip
      icon={status ? <CheckCircleIcon /> : <CancelIcon />}
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

  if (!projectId) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="warning">Please select a project to view the check and review form.</Alert>
      </Container>
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
              PMD5. Check and Review Form
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Add Review
            </Button>
          </StyledHeaderBox>

          {error && (
            <Box sx={{ mx: 3, mb: 3 }}>
              <Alert severity="error">
                {error}
              </Alert>
            </Box>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

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
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              // Use row.id if available, otherwise use activityNo as fallback
                              if (row.id !== undefined && row.id !== '') {
                                console.log('Delete button clicked for review ID:', row.id);
                                handleDeleteReview(row.id.toString());
                              } else if (row.activityNo) {
                                console.log('Delete button clicked for review with no ID, using activityNo as fallback:', row.activityNo);
                                // Try to find the review by activityNo and projectId
                                const reviewToDelete = rows.find(r =>
                                  r.activityNo === row.activityNo && r.projectId === row.projectId);

                                if (reviewToDelete && reviewToDelete.id) {
                                  handleDeleteReview(reviewToDelete.id.toString());
                                } else {
                                  console.error('Cannot find review ID for deletion');
                                  setError('Cannot delete review: Unable to determine review ID');
                                }
                              } else {
                                console.error('Cannot delete review: Both ID and activityNo are undefined');
                                setError('Cannot delete review: ID is missing');
                              }
                            }}
                            size="small"
                            color="error"
                            title="Delete review"
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
        </Paper>
      </Box>

      <CheckReviewDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingReview(undefined);
        }}
        onSave={handleAddReview}
        nextActivityNo={getNextActivityNo()}
        editData={editingReview}
      />
    </Container>
  );

  return (
    <>
      {formContent}
    </>
  );
};

export default CheckReviewForm;
