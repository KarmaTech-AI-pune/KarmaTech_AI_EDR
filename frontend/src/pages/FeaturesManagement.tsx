import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Feature, FeatureFormData } from '../types/Feature';
import { featureService } from '../services/featureService';
import FeaturesList from '../components/features/FeaturesList';
import FeatureForm from '../components/features/FeatureForm';
import FeatureDeleteDialog from '../components/features/FeatureDeleteDialog';

const FeaturesManagement: React.FC = () => {
  // State management
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<Feature | null>(null);

  // Fetch features on mount
  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await featureService.getAllFeatures();
      setFeatures(data);
    } catch (err: any) {
      console.error('Error fetching features:', err);
      setError(err.response?.data?.message || 'Failed to load features. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter features based on search and status
  const filteredFeatures = useMemo(() => {
    return features.filter(feature => {
      const matchesSearch = 
        feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'active' && feature.isActive) ||
        (statusFilter === 'inactive' && !feature.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [features, searchTerm, statusFilter]);

  // Handle add feature
  const handleAddFeature = () => {
    setSelectedFeature(null);
    setIsFormOpen(true);
  };

  // Handle edit feature
  const handleEditFeature = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsFormOpen(true);
  };

  // Handle delete feature
  const handleDeleteFeature = (id: number) => {
    const feature = features.find(f => f.id === id);
    if (feature) {
      setFeatureToDelete(feature);
      setIsDeleteDialogOpen(true);
    }
  };

  // Handle form submit (create or update)
  const handleFormSubmit = async (data: FeatureFormData) => {
    try {
      if (selectedFeature) {
        // Update existing feature
        await featureService.updateFeature({
          id: selectedFeature.id,
          ...data,
        });
      } else {
        // Create new feature
        await featureService.createFeature(data);
      }
      await fetchFeatures();
      setIsFormOpen(false);
      setSelectedFeature(null);
    } catch (err: any) {
      console.error('Error saving feature:', err);
      throw new Error(err.response?.data?.message || 'Failed to save feature');
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!featureToDelete) return;

    try {
      await featureService.deleteFeature(featureToDelete.id);
      await fetchFeatures();
      setIsDeleteDialogOpen(false);
      setFeatureToDelete(null);
    } catch (err: any) {
      console.error('Error deleting feature:', err);
      setError(err.response?.data?.message || 'Failed to delete feature');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Features Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddFeature}
          >
            Add Feature
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search and Filter */}
        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="Search features..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or description"
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Features List */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <FeaturesList
            features={filteredFeatures}
            onEdit={handleEditFeature}
            onDelete={handleDeleteFeature}
          />
        )}
      </Paper>

      {/* Feature Form Modal */}
      <FeatureForm
        open={isFormOpen}
        feature={selectedFeature}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedFeature(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <FeatureDeleteDialog
        open={isDeleteDialogOpen}
        feature={featureToDelete}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setFeatureToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </Container>
  );
};

export default FeaturesManagement;
