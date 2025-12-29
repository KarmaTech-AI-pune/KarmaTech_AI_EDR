import React from 'react';
import { Box, Typography, List } from '@mui/material';
import { Program } from '../types/types';

interface ProgramListViewProps {
  programs: Program[];
  emptyMessage?: string;
  renderProgram: (program: Program) => React.ReactNode;
}

/**
 * DUMB COMPONENT - Pure presentation, no logic
 * Renders a list of programs using provided render function
 */
export const ProgramListView: React.FC<ProgramListViewProps> = ({
  programs,
  emptyMessage = 'No programs found',
  renderProgram
}) => {
  if (programs.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
        width="100%"
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', p: 0 }}>
      {programs.map(renderProgram)}
    </List>
  );
};
