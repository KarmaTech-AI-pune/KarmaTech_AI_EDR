import React, { useState, useEffect } from 'react';
import {
  Paper,
  Button,
  Box,
  Typography,
  IconButton,
  Checkbox,
  Container,
  Alert,
  styled,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { CheckReviewDialog } from '../CheckReviewDialog';
import { ICheckReviewRow } from '../../../dummyapi/database/dummyCheckReview';
import { 
  createCheckReview, 
  getCheckReviewsByProject, 
  deleteCheckReview,
  updateCheckReview 
} from '../../../dummyapi/checkReviewApi';

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
  const [rows, setRows] = useState<ICheckReviewRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ICheckReviewRow | undefined>(undefined);
  const [error, setError] = useState<string>('');
  
  // TODO: Replace with actual project ID from context/props
  const projectId = "project1";

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    try {
      const reviews = getCheckReviewsByProject(projectId);
      setRows(reviews);
      setError('');
    } catch (err) {
      setError('Failed to load check review data');
    }
  };

  const getNextActivityNo = (): string => {
    if (rows.length === 0) return "1";
    const maxNo = Math.max(...rows.map(row => parseInt(row.activityNo)));
    return (maxNo + 1).toString();
  };

  const handleAddReview = (reviewData: Omit<ICheckReviewRow, 'projectId' | 'activityNo'>) => {
    try {
      const newReview: ICheckReviewRow = {
        ...reviewData,
        projectId,
        activityNo: getNextActivityNo()
      };
      createCheckReview(newReview);
      loadReviews();
      setError('');
    } catch (err) {
      setError('Failed to add review');
    }
  };

  const handleDeleteReview = (activityNo: string) => {
    try {
      deleteCheckReview(projectId, activityNo);
      loadReviews();
      setError('');
    } catch (err) {
      setError('Failed to delete review');
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

  return (
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

          <Box>
            {rows.map((row, index) => (
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
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReview(row.activityNo);
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
        onClose={() => setDialogOpen(false)}
        onSave={handleAddReview}
        nextActivityNo={getNextActivityNo()}
      />
    </Container>
  );
};

export default CheckReviewForm;
