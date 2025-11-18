/**
 * ProjectBudgetHistory Component
 * 
 * Main component to display budget change history for a project.
 * Features:
 * - Displays budget change history in a timeline format
 * - Filtering options for field type (cost vs fee)
 * - Pagination for large datasets
 * - Loading states and error handling
 * 
 * Requirements: 2.1, 2.2, 3.5
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  CircularProgress,
  Pagination,
  Stack,
} from '@mui/material';
import { projectBudgetApi } from '../../services/projectBudgetApi';
import { ProjectBudgetChangeHistory as BudgetChangeHistoryType } from '../../types/projectBudget';
import { BudgetChangeTimeline } from './BudgetChangeTimeline';

interface ProjectBudgetHistoryProps {
  projectId: number;
}

export const ProjectBudgetHistory: React.FC<ProjectBudgetHistoryProps> = ({ projectId }) => {
  const [history, setHistory] = useState<BudgetChangeHistoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<'All' | 'EstimatedProjectCost' | 'EstimatedProjectFee'>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    loadHistory();
  }, [projectId, fieldFilter, currentPage]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Loading budget history for project ${projectId}, page ${currentPage}, filter: ${fieldFilter}`);
      
      const params = {
        projectId,
        pageNumber: currentPage,
        pageSize,
        ...(fieldFilter !== 'All' && { fieldName: fieldFilter }),
      };

      const data = await projectBudgetApi.getBudgetHistory(params);
      
      console.log(`Received ${data.length} history records:`, data);
      setHistory(data);

      // Calculate total pages (this would ideally come from the API response)
      // For now, if we get less than pageSize items, we're on the last page
      if (data.length < pageSize) {
        setTotalPages(currentPage);
      } else {
        // Estimate there might be more pages
        setTotalPages(currentPage + 1);
      }
    } catch (err) {
      console.error('Error loading budget history:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load budget history';
      console.error('Error details:', errorMessage);
      setError(errorMessage);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldFilterChange = (event: SelectChangeEvent<string>) => {
    setFieldFilter(event.target.value as 'All' | 'EstimatedProjectCost' | 'EstimatedProjectFee');
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Budget Change History
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Track all changes to project budget fields with complete audit trail
        </Typography>
      </Box>

      {/* Filter Controls */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="field-filter-label">Filter by Field</InputLabel>
          <Select
            labelId="field-filter-label"
            id="field-filter"
            value={fieldFilter}
            label="Filter by Field"
            onChange={handleFieldFilterChange}
          >
            <MenuItem value="All">All Changes</MenuItem>
            <MenuItem value="EstimatedProjectCost">Cost Changes Only</MenuItem>
            <MenuItem value="EstimatedProjectFee">Fee Changes Only</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && history.length === 0 && (
        <Alert severity="info">
          No budget changes found for this project.
        </Alert>
      )}

      {/* Timeline Display */}
      {!loading && !error && history.length > 0 && (
        <>
          <BudgetChangeTimeline changes={history} />

          {/* Pagination */}
          {totalPages > 1 && (
            <Stack spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Stack>
          )}
        </>
      )}
    </Paper>
  );
};

export default ProjectBudgetHistory;
