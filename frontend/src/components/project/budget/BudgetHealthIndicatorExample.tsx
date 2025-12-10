/**
 * BudgetHealthIndicator Usage Example
 * 
 * This file demonstrates how to use the BudgetHealthIndicator component
 * with real API data in a project context.
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import { BudgetHealthIndicator, CompactBudgetHealthIndicator } from './BudgetHealthIndicator';
import { getBudgetHealth } from '../../../api/budgetHealthApi';
import { BudgetHealth } from '../../../types/budgetHealth';

interface BudgetHealthDisplayProps {
  projectId: string | number;
  compact?: boolean;
}

/**
 * Example component showing how to fetch and display budget health
 */
export const BudgetHealthDisplay: React.FC<BudgetHealthDisplayProps> = ({
  projectId,
  compact = false,
}) => {
  const [budgetHealth, setBudgetHealth] = useState<BudgetHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudgetHealth = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBudgetHealth(projectId);
        setBudgetHealth(data);
      } catch (err) {
        console.error('Failed to fetch budget health:', err);
        setError('Failed to load budget health information');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetHealth();
  }, [projectId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 1 }}>
        {error}
      </Alert>
    );
  }

  if (!budgetHealth) {
    return null;
  }

  // Use compact version if specified
  if (compact) {
    return (
      <CompactBudgetHealthIndicator
        status={budgetHealth.status}
        utilizationPercentage={budgetHealth.utilizationPercentage}
      />
    );
  }

  // Full version with additional details
  return (
    <Card variant="outlined" sx={{ m: 1 }}>
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              Budget Health
            </Typography>
            <BudgetHealthIndicator
              status={budgetHealth.status}
              utilizationPercentage={budgetHealth.utilizationPercentage}
            />
          </Box>

          <Divider />

          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Estimated Budget:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                ${budgetHealth.estimatedBudget.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Actual Cost:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                ${budgetHealth.actualCost.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Utilization:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {budgetHealth.utilizationPercentage.toFixed(1)}%
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

/**
 * Example showing multiple budget health indicators in a list
 */
export const BudgetHealthList: React.FC<{ projectIds: number[] }> = ({ projectIds }) => {
  return (
    <Stack spacing={2}>
      {projectIds.map((projectId) => (
        <BudgetHealthDisplay key={projectId} projectId={projectId} />
      ))}
    </Stack>
  );
};

/**
 * Example showing compact indicators in a table-like layout
 */
export const BudgetHealthTable: React.FC<{ projects: Array<{ id: number; name: string }> }> = ({
  projects,
}) => {
  return (
    <Stack spacing={1}>
      {projects.map((project) => (
        <Box
          key={project.id}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2">{project.name}</Typography>
          <BudgetHealthDisplay projectId={project.id} compact />
        </Box>
      ))}
    </Stack>
  );
};

export default BudgetHealthDisplay;
