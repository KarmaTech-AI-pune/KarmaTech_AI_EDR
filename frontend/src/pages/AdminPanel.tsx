import React, { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Drawer,
  Tooltip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UsersManagement from '../components/adminpanel/UsersManagement';
import RolesManagement from '../components/adminpanel/RolesManagement';
import TenantManagement from '../components/adminpanel/TenantManagement';
import TenantUsersManagement from '../components/adminpanel/TenantUsersManagement';
import SubscriptionManagement from '../components/adminpanel/SubscriptionManagement';
import BillingManagement from '../components/adminpanel/BillingManagement';
import SystemSettings from '../components/adminpanel/SystemSettings';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 65;
const NAVBAR_HEIGHT = '70px';

const AdminPanel: React.FC = () => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);
  const [selectedSection, setSelectedSection] = useState<'users' | 'roles' | 'tenants' | 'tenantUsers' | 'subscriptions' | 'billing' | 'settings'>('tenants');

  const menuItems = [
    { id: 'tenants', text: 'Tenant Management', icon: <BusinessIcon /> },
    { id: 'tenantUsers', text: 'Tenant Users', icon: <PeopleIcon /> },
    { id: 'subscriptions', text: 'Subscription Plans', icon: <AttachMoneyIcon /> },
    { id: 'billing', text: 'Billing Management', icon: <ReceiptIcon /> },
    { id: 'users', text: 'Users Management', icon: <PeopleIcon /> },
    { id: 'roles', text: 'Roles Management', icon: <SecurityIcon /> },
    { id: 'settings', text: 'System Settings', icon: <SettingsIcon /> }
  ];

  const toggleDrawer = () => {
    setIsDrawerExpanded(!isDrawerExpanded);
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'tenants':
        return <TenantManagement />;
      case 'tenantUsers':
        return <TenantUsersManagement />;
      case 'subscriptions':
        return <SubscriptionManagement />;
      case 'billing':
        return <BillingManagement />;
      case 'users':
        return <UsersManagement />;
      case 'roles':
        return <RolesManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return null;
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        height: `calc(100vh - ${NAVBAR_HEIGHT})`,
        pt: `${NAVBAR_HEIGHT}`,
        bgcolor: 'background.default',
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: isDrawerExpanded ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isDrawerExpanded ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: NAVBAR_HEIGHT,
            height: `calc(100% - ${NAVBAR_HEIGHT})`,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            overflowX: 'hidden',
            transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={toggleDrawer}>
            {isDrawerExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
        <List sx={{ width: '100%', p: 2 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => setSelectedSection(item.id as 'users' | 'roles' | 'tenants' | 'subscriptions' | 'billing' | 'settings')}
              selected={selectedSection === item.id}
              sx={{
                minHeight: 48,
                justifyContent: isDrawerExpanded ? 'initial' : 'center',
                px: 2.5,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <Tooltip title={!isDrawerExpanded ? item.text : ''} placement="right">
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isDrawerExpanded ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              </Tooltip>
              {isDrawerExpanded && (
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    variant: 'body1'
                  }}
                />
              )}
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${isDrawerExpanded ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)` },
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
          overflow: 'auto',
          px: 4,
          pb: 8,
          pt: 3,
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default AdminPanel;
