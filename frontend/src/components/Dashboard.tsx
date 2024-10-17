// File: frontend/src/components/Dashboard.tsx
// Purpose: Main dashboard component displaying project overview and KPIs

import { Box, Typography } from '@mui/material';
import { ProjectList } from './ProjectList';
import { ResourceManagement } from './ResourceManagement';
import { ReportsList } from './ReportsList';
import { NotificationCenter } from './NotificationCenter';


export const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <ProjectList />
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <ResourceManagement />
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <ReportsList />
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <NotificationCenter />
        </Box>
      </Box>
    </Box>
  );
};