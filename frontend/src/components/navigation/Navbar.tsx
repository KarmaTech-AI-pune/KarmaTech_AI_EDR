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
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
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

  useEffect(() => {
    const checkUserPermissions = async () => {
      const currentUser = await authApi.getCurrentUser();
      
      // If no user is logged in, clear pages
      if (!currentUser || !currentUser.roleDetails) {
        setPages([]);
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
      //availablePages.push('Forms')

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

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
          >
            NJSEI PM
          </Typography>

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
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
          >
            NJSEI PM
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => handleNavClick(page)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={user?.name || 'User'} src={user?.avatar}>
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
