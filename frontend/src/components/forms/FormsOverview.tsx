import React from 'react';
import { Box, Paper } from '@mui/material';
import { useProject } from '../../context/ProjectContext';
import { GanttChart } from '../project/GanttChart';

interface FormsOverviewProps {}

const FormsOverview: React.FC<FormsOverviewProps> = () => {
  const { projectId } = useProject();
  return (
    <Paper sx={{ p: 3 }}>
     
      {projectId && (
              <Box sx={{ mb: 3 }}>
                <GanttChart projectId={projectId} />
              </Box>
          )} 
    </Paper>
  );
};

export default FormsOverview;
