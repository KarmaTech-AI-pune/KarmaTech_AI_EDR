import { Box, Typography } from '@mui/material';
import { ResourceManagement } from './ResourceManagement';
import { AlertsPanel } from './AlertsPanel'; // Import the new component
import { BusinessDevelopment, ProjectManagement } from '../pages';
import { ReportsList } from './ReportsList';
import { NotificationCenter } from './navigation/NotificationCenter';
import { useEffect, useState, useContext } from 'react';
import { PermissionType } from '../models';
import { projectManagementAppContext } from '../App';

const NAVBAR_HEIGHT = '64px';

export const Dashboard = () => {
  const [projectList, setProjectList] = useState<null | JSX.Element>(null);
  const context = useContext(projectManagementAppContext);

  useEffect(() => {
    if (context?.currentUser?.roleDetails?.permissions.includes(PermissionType.VIEW_PROJECT)) {
      setProjectList(<ProjectManagement />);
    } else {
      setProjectList(<BusinessDevelopment />);
    }
  }, [context?.currentUser]);

  return (
    <Box
      sx={{
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT})`,
        pt: `${NAVBAR_HEIGHT}`,
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          width: '100%',
          bgcolor: '#f5f5f5',
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
          Welcome, {context?.currentUser?.name || 'User'}!
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
          {/* Left Column - Alerts and Projects */}
          <Box
            sx={{
              display: 'flex',        // Use flexbox for column layout
              flexDirection: 'column', // Stack items vertically
              gap: 3,                 // Add gap between items
              width: '100%',
              overflow: 'hidden'
            }}
          >
            {/* Add the AlertsPanel here */}
            <AlertsPanel /> 
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
            {/* AlertsPanel was moved to the left column */}
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
    </Box>
  );
};
