import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import { projectManagementAppContext } from '../../App';
import { projectManagementAppContextType } from '../../types';
import { authApi } from '../../services/authApi';
import { PermissionType } from '../../models';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import PasswordChangeDropdown from './PasswordChangeDropdown';
import { useTenantBranding } from '../../context/TenantBrandingContext';

const navLinks = [
  {
    label: 'Business Development',
    path: '/business-development',
    permission: PermissionType.VIEW_BUSINESS_DEVELOPMENT,
  },
  {
    label: 'Program Management',
    path: '/program-management',
    permission: PermissionType.VIEW_PROJECT,
  },
];



const LogoComponent = () => {
  const { logoUrl, tenantName } = useTenantBranding();
  return (
    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      <Box
        sx={{
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
        }}
      >
        <img
          src={logoUrl}
          alt={tenantName || 'KarmaTech AI'}
          style={{
            height: '100%',
            width: 'auto',
            objectFit: 'contain',
          }}
        />
        <Typography
          variant="subtitle1"
          noWrap
          sx={{
            color: 'white',
            fontWeight: 600,
            display: { xs: 'none', md: 'block' },
          }}
        >
          {tenantName}
        </Typography>
      </Box>
    </Link>
  );
};

export const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [showPasswordDropdown, setShowPasswordDropdown] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const { setIsAuthenticated, user } = useContext(
    projectManagementAppContext,
  ) as projectManagementAppContextType;
  const navigation = useAppNavigation();

  const [authorizedPages, setAuthorizedPages] = useState<typeof navLinks>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTenantAdmin, setIsTenantAdmin] = useState(false);  

  useEffect(() => {
    const checkUserPermissions = async () => {
      const currentUser = await authApi.getCurrentUser();
      if (!currentUser || !currentUser.roleDetails) {
        setAuthorizedPages([]);
        setIsAdmin(false);
        setIsTenantAdmin(false)
        return;
      }

      const { permissions } = currentUser.roleDetails;
      const availablePages = navLinks.filter((link) =>
        permissions.includes(link.permission),
      );

      setAuthorizedPages(availablePages);
      setIsAdmin(permissions.includes(PermissionType.SYSTEM_ADMIN));
      setIsTenantAdmin(permissions.includes(PermissionType.Tenant_ADMIN));
      
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


  const handleClosePasswordDropdown = useCallback(() => {
    setShowPasswordDropdown(false);
  }, []);

  // Handle click outside to close password dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPasswordDropdown && avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setShowPasswordDropdown(false);
      }
    };

    if (showPasswordDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPasswordDropdown]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setIsAuthenticated(false);
      navigation.navigateToLogin();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleCloseUserMenu();
  };



  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
        boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
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
              {authorizedPages.map((page) => (
                <MenuItem
                  key={page.label}
                  component={NavLink}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                  data-testid={`mobile-nav-${page.label.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <Typography textAlign="center">{page.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
            }}
          >
            <LogoComponent />
          </Box>

          {/* Desktop Navigation */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
            }}
          >
            {authorizedPages.map((page) => (
              <Button
                key={page.label}
                component={NavLink}
                to={page.path}
                data-testid={`desktop-nav-${page.label.replace(/\s+/g, '-').toLowerCase()}`}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'block',
                  mx: 1,
                  px: 2,
                  '&.active': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    fontWeight: 'bold',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          {/* Admin Icon */}
          {(isAdmin || isTenantAdmin) && (
            <Box sx={{ mr: 2 }}>
              <Tooltip title="Admin Panel">
                <IconButton
                  component={Link}
                  to="/admin"
                  sx={{ color: 'white' }}
                >
                  <AdminPanelSettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}        

          {/* User Menu */}
          <Box sx={{ flexGrow: 0, position: 'relative' }}>
            <Box ref={avatarRef}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt={user?.name || 'User'}
                  src={user?.avatar}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.light',
                    border: '2px solid white',
                  }}
                >
                  {user?.name?.[0] || 'U'}
                </Avatar>
              </IconButton>
            </Box>
            
            {/* Password Change Dropdown */}
            {showPasswordDropdown && (
              <PasswordChangeDropdown onClose={handleClosePasswordDropdown} />
            )}
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
              data-testid="menu"
            >
              <MenuItem 
                component={Link} 
                to="/profile" 
                onClick={handleCloseUserMenu}
              >
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem 
                component={Link} 
                to="/profile?section=2fa" 
                onClick={handleCloseUserMenu}
              >
                <SecurityIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography textAlign="center">2FA Settings</Typography>
              </MenuItem>                        
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Settings</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Notifications</Typography>
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

export default Navbar;
