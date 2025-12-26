import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

interface ProgramEmptyStateProps {
  message?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

/**
 * DUMB COMPONENT - Pure presentation, no logic
 * Displays empty state when no programs exist
 */
export const ProgramEmptyState: React.FC<ProgramEmptyStateProps> = ({
  message = 'No programs found',
  showCreateButton = false,
  onCreateClick
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="300px"
      width="100%"
      gap={2}
    >
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
      {showCreateButton && onCreateClick && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={onCreateClick}
          sx={{ textTransform: 'none' }}
        >
          Create Your First Program
        </Button>
      )}
    </Box>
  );
};
