import React, { useState, useEffect } from 'react';
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
import { useTenantContext } from '../hooks/useTenantContext';
import { authApi } from '../services/authApi';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune'; // New import
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DnsIcon from '@mui/icons-material/Dns'; // New icon for migrations

import UsersManagement from '../components/adminpanel/UsersManagement';
import RolesManagement from '../components/adminpanel/RolesManagement';
import TenantManagement from '../components/adminpanel/TenantManagement';
import TenantUsersManagement from '../components/adminpanel/TenantUsersManagement';
import SubscriptionManagement from '../components/adminpanel/SubscriptionManagement';
import BillingManagement from '../components/adminpanel/BillingManagement';
import SystemSettings from '../components/adminpanel/SystemSettings';
import GeneralSettings from '../features/generalSettings/pages/GeneralSettings';
import MigrationManagement from '../pages/MigrationManagement'; // Import the new component

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 65;
const NAVBAR_HEIGHT = '70px';

const AdminPanel: React.FC = () => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);
  const { isSuperAdmin } = useTenantContext();
  const [hasSystemAdminPermission, setHasSystemAdminPermission] = useState(false);
  const [hasTenantAdminPermission, setHasTenantAdminPermission] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'users' | 'roles' | 'tenants' | 'tenantUsers' | 'subscriptions' | 'billing' | 'generalSettings' | 'migrations' | 'settings'>('settings');


  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const user = await authApi.getCurrentUser();
        console.log('Current User:', user);
        console.log('Role Details:', user?.roleDetails);
        console.log('Permissions:', user?.roleDetails?.permissions);

        if (user?.roleDetails?.permissions) {
          const isSystemAdmin = user.roleDetails.permissions.includes('SYSTEM_ADMIN');
          const isTenantAdmin = user.roleDetails.permissions.includes('Tenant_ADMIN');

          console.log('Is System Admin?', isSystemAdmin);
          console.log('Is Tenant Admin?', isTenantAdmin);
          console.log('User Permissions:', user.roleDetails.permissions);

          setHasSystemAdminPermission(isSystemAdmin);
          setHasTenantAdminPermission(isTenantAdmin);

          // Set initial section based on permissions
          if (isSystemAdmin || isSuperAdmin) {
            setSelectedSection('tenants');
          } else if (isTenantAdmin) {
            setSelectedSection('users');
          }
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
      }
    };
    checkPermissions();
  }, [isSuperAdmin]);

  interface MenuItem {
    id: 'users' | 'roles' | 'tenants' | 'tenantUsers' | 'subscriptions' | 'billing' | 'generalSettings' | 'migrations' | 'settings';
    text: string;
    icon: JSX.Element;
    requiresSystemAdmin?: boolean;
    requiresTenantAdmin?: boolean;
  }

  const allMenuItems: MenuItem[] = [
    // System Admin only menu items
    { id: 'tenants', text: 'Tenant Management', icon: <BusinessIcon />, requiresSystemAdmin: true, requiresTenantAdmin: false },
    { id: 'tenantUsers', text: 'Tenant Users', icon: <PeopleIcon />, requiresSystemAdmin: true, requiresTenantAdmin: false },
    { id: 'subscriptions', text: 'Subscription Plans', icon: <AttachMoneyIcon />, requiresSystemAdmin: true, requiresTenantAdmin: false },
    { id: 'billing', text: 'Billing Management', icon: <ReceiptIcon />, requiresSystemAdmin: true, requiresTenantAdmin: false },
    { id: 'migrations', text: 'Migration Management', icon: <DnsIcon />, requiresSystemAdmin: true, requiresTenantAdmin: false }, // New migration item
    // Tenant Admin menu items
    { id: 'users', text: 'Users Management', icon: <PeopleIcon />, requiresTenantAdmin: true },
    { id: 'roles', text: 'Roles Management', icon: <SecurityIcon />, requiresTenantAdmin: true },
    { id: 'generalSettings', text: 'General Setting', icon: <TuneIcon />, requiresSystemAdmin: false, requiresTenantAdmin: true },
    { id: 'settings', text: 'System Settings', icon: <SettingsIcon />, requiresSystemAdmin: true, requiresTenantAdmin: false }
  ];



  // Ensure permissions are properly checked
  const hasRequiredPermissions = (item: MenuItem): boolean => {
    console.log('Checking permissions for:', item.text);
    console.log('Current permissions state:', {
      hasSystemAdminPermission,
      isSuperAdmin,
      hasTenantAdminPermission
    });

    // System Admin can see everything
    if (hasSystemAdminPermission || isSuperAdmin) {
      console.log(`${item.text} visible to System Admin`);
      return true;
    }

    // For Tenant Admin users
    if (hasTenantAdminPermission) {
      // Hide items that are System Admin only
      if (item.requiresSystemAdmin && item.requiresTenantAdmin === false) {
        console.log(`${item.text} hidden from Tenant Admin (System Admin only)`);
        return false;
      }
      // Show items that require Tenant Admin or have no special permissions
      console.log(`${item.text} visible to Tenant Admin`);
      return true;
    }

    // For regular users, only show items with no special permissions
    const hasNoSpecialPermissions = !item.requiresSystemAdmin && !item.requiresTenantAdmin;
    console.log(`${item.text} regular user access: ${hasNoSpecialPermissions}`);
    return hasNoSpecialPermissions;
  };

  const visibleMenuItems = allMenuItems.filter(item => hasRequiredPermissions(item));

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
      case 'generalSettings':
        return <GeneralSettings />;
      case 'settings':
        return <SystemSettings />;
      case 'migrations':
        return <MigrationManagement />;
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
          {visibleMenuItems.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => setSelectedSection(item.id as 'users' | 'roles' | 'tenants' | 'subscriptions' | 'billing' | 'generalSettings' | 'settings')}
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
