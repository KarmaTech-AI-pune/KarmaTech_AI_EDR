// File: frontend/src/components/Dashboard.tsx
// Purpose: Main dashboard component displaying project overview and KPIs

import { Box, Typography } from '@mui/material';
import { ProjectList } from './projects/ProjectList';
import { ResourceManagement } from './ResourceManagement';
import { BusinessDevelopment, ProjectManagement } from '../pages';
import { ReportsList } from './ReportsList';
import { NotificationCenter } from './navigation/NotificationCenter';
import { authApi } from '../dummyapi/authApi';
import { useEffect, useState } from 'react';
import { PermissionType } from '../dummyapi/database/dummyRoles';

export const Dashboard = () => {
  const [projectList,setProjectList] = useState<null | JSX.Element>(null)
  useEffect(() => {
    
    const checkUserPermissions = async () => {

      const currentUser = await authApi.getCurrentUser();
      
      // Check for Business Development permissions
      if (currentUser?.roleDetails.permissions.includes(PermissionType.VIEW_PROJECTS)) {
       setProjectList(<ProjectManagement />)
      }
      else{
        setProjectList(<BusinessDevelopment />)
      }
    };

    checkUserPermissions();
  }, []);
  const Loading = () => <div> Loading... </div>
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        
        <Box sx={{ flexBasis: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          {projectList}
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