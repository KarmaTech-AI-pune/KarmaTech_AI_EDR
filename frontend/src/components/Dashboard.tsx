import { Box, Typography } from '@mui/material';
import { ResourceManagement } from './ResourceManagement';
import { BusinessDevelopment, ProjectManagement } from '../pages';
import { ReportsList } from './ReportsList';
import { NotificationCenter } from './navigation/NotificationCenter';
import { authApi } from '../dummyapi/authApi';
import { useEffect, useState } from 'react';
import { PermissionType } from '../dummyapi/database/dummyRoles';

export const Dashboard = () => {
  const [projectList, setProjectList] = useState<null | JSX.Element>(null);

  useEffect(() => {
    const checkUserPermissions = async () => {
      const currentUser = await authApi.getCurrentUser();
      if (currentUser?.roleDetails.permissions.includes(PermissionType.VIEW_PROJECTS)) {
        setProjectList(<ProjectManagement />);
      } else {
        setProjectList(<BusinessDevelopment />);
      }
    };

    checkUserPermissions();
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        p: { xs: 2, sm: 3 },
        bgcolor: '#f5f5f5',
        minHeight: '100vh',
        overflowX: 'hidden'
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 3,
          fontSize: { xs: '1.5rem', sm: '2rem' },
          fontWeight: 500,
          color: '#1a237e'
        }}
      >
        Dashboard
      </Typography>
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          '& > *': {
            minWidth: 0,
            width: '100%'
          }
        }}
      >
        {/* Left Column - Projects Only */}
        <Box
          sx={{
            width: '100%',
            overflow: 'hidden'
          }}
        >
          {projectList && projectList}
        </Box>

        {/* Right Column - Other Components */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            width: '100%'
          }}
        >
          <Box
            sx={{
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <ResourceManagement />
          </Box>
          <Box
            sx={{
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <ReportsList />
          </Box>
          <Box
            sx={{
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <NotificationCenter />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
