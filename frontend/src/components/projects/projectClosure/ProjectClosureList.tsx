import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  getAllProjectClosures,
  deleteProjectClosure,
  ProjectClosureWithMetadata
} from '../../../services/projectClosureApi';

// Helper function to format date strings
const formatDateString = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Format as: "Jan 1, 2023, 12:00 PM"
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error formatting date';
  }
};

const ProjectClosureList: React.FC = () => {
  const [projectClosures, setProjectClosures] = useState<ProjectClosureWithMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch project closures
  const fetchProjectClosures = async () => {
    try {
      console.log('Starting to fetch project closures...');
      setLoading(true);
      setError(null);

      // Use the imported service function to get project closures
      const closures = await getAllProjectClosures();

      if (closures.length === 0) {
        console.log('No project closures found.');
      } else {
        console.log(`Found ${closures.length} project closures.`);
        console.log('First project closure:', closures[0]);
      }

      setProjectClosures(closures);
    } catch (err: any) {
      console.error('Error fetching project closures:', err);
      setError('Failed to load project closures. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchProjectClosures();
  }, []);

  // Function to handle refreshing the data
  const handleRefresh = () => {
    console.log('Refreshing project closures...');
    fetchProjectClosures();
  };

  // Function to handle creating a new project closure
  const handleCreateNew = () => {
    console.log('Create new project closure clicked');

    // In a real implementation, we would navigate to the ProjectClosureForm component
    // For now, we'll just show an alert and then refresh the data
    alert('In a real implementation, this would navigate to the ProjectClosureForm component');

    // Refresh the data to show any new project closures
    fetchProjectClosures();
  };

  // Function to handle viewing a project closure
  const handleViewClosure = (id: number) => {
    console.log(`View project closure ${id} clicked`);

    // In a state-based routing system, we would typically:
    // 1. Set a state variable to indicate we're in "view" mode
    // 2. Set the selected project closure ID
    // 3. Show a detail component for the selected project closure

    // For demonstration purposes, we'll just show an alert
    alert(`View project closure with ID: ${id}`);

    // In a real implementation, you might do something like:
    // setAppState({ screen: 'ProjectClosureDetail', id: id });
  };

  // Function to handle deleting a project closure
  const handleDeleteClosure = async (id: number) => {
    console.log(`Delete project closure ${id} clicked`);

    // Confirm before deleting
    if (window.confirm('Are you sure you want to delete this project closure?')) {
      try {
        // Set loading state
        setLoading(true);

        // Call the delete API
        await deleteProjectClosure(id);

        // Remove the deleted item from the state
        setProjectClosures(prevClosures =>
          prevClosures.filter(closure => closure.id !== id)
        );

        // Show success message
        alert('Project closure deleted successfully');
      } catch (err: any) {
        console.error('Error deleting project closure:', err);

        // Show a more detailed error message
        if (err.message) {
          alert(`Failed to delete project closure: ${err.message}`);
        } else {
          alert('Failed to delete project closure. Please try again.');
        }
      } finally {
        // Clear loading state
        setLoading(false);

        // Refresh the data to ensure we have the latest state
        fetchProjectClosures();
      }
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create New Project Closure
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : projectClosures.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Project Closure Forms Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create a new project closure form to get started.
          </Typography>
        </Paper>
      ) : (
        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
          {projectClosures.map((closure) => (
            <Box
              key={closure.id}
              sx={{
                width: { xs: '100%', md: '45%', lg: '30%' },
                mb: 3
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Project ID: {closure.projectId}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Created: {formatDateString(closure.createdAt)} by {closure.createdBy || 'System'}
                  </Typography>

                  {closure.updatedAt && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Last Updated: {formatDateString(closure.updatedAt)} by {closure.updatedBy || 'Unknown'}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {closure.clientFeedback ?
                      closure.clientFeedback.substring(0, 100) + (closure.clientFeedback.length > 100 ? '...' : '') :
                      'No client feedback provided'}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label="View Details"
                      color="primary"
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewClosure(closure.id)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    color="primary"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewClosure(closure.id)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClosure(closure.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ProjectClosureList;
