import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  Avatar,
  Stack,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useContext } from 'react';
import { projectManagementAppContext } from '../../App';
import { projectManagementAppContextType } from '../../types';
import { authApi } from '../../dummyapi/authApi';
import { PermissionType } from '../../models';

export const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const { setScreenState, setIsAuthenticated, user } = useContext(projectManagementAppContext) as projectManagementAppContextType

  // Pages based on permissions
  const [pages, setPages] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserPermissions = async () => {
      const currentUser = await authApi.getCurrentUser();
      
      // If no user is logged in, clear pages
      if (!currentUser || !currentUser.roleDetails) {
        setPages([]);
        setIsAdmin(false);
        return;
      }

      // Determine pages based on user's permissions
      const availablePages = [];
      // Check for Business Development permissions
      if (currentUser.roleDetails.permissions.includes(PermissionType.VIEW_BUSINESS_DEVELOPMENT)) {
        availablePages.push('Business Development');
      }

      // Check for Project Management permissions
      if (currentUser.roleDetails.permissions.includes(PermissionType.VIEW_PROJECT)) {
        availablePages.push('Project Management');
      }

      // Check for System Admin permissions
      setIsAdmin(currentUser.roleDetails.permissions.includes(PermissionType.SYSTEM_ADMIN));

      setPages(availablePages);
    };

    checkUserPermissions();
  }, []);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavClick = (page: string) => {
    setScreenState(page);
    handleCloseNavMenu();
  };

  const handleLogoClick = () => {
    setScreenState('Dashboard');
  };

  const handleAdminClick = () => {
    setScreenState('Admin Panel');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setIsAuthenticated(false);
      setScreenState('Login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleCloseUserMenu();
  };

  const LogoComponent = () => (
    <Box 
      onClick={handleLogoClick}
      style={{ cursor: 'pointer' }}
      sx={{ height: '50px', display: 'flex', alignItems: 'center' }}
    >
      <img 
        src="/logo-final.png" 
        alt="NJSEI ISO 9000" 
        style={{
          height: '100%',
          width: 'auto',
          objectFit: 'contain'
        }}
      />
    </Box>
  );

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
        boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '70px' }}>
          {/* Desktop Logo */}
          <Box sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}>
            <LogoComponent />
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handleNavClick(page)}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'center' }}>
            <LogoComponent />
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => handleNavClick(page)}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'block',
                  mx: 1,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                {page}
              </Button>
            ))}
          </Box>

          {/* Admin Icon */}
          {isAdmin && (
            <Box sx={{ mr: 2 }}>
              <Tooltip title="Admin Panel">
                <IconButton onClick={handleAdminClick} sx={{ color: 'white' }}>
                  <AdminPanelSettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* User Menu */}
          <Box sx={{ flexGrow: 0 }}>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar 
                alt={user?.name || 'User'} 
                src={user?.avatar}
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: 'primary.light',
                  border: '2px solid white'
                }}
              >
                {user?.name?.[0] || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Settings</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography textAlign="center">
                  Notifications
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
