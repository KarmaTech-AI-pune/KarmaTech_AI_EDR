import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import FolderIcon from '@mui/icons-material/Folder';
import TimelineIcon from '@mui/icons-material/Timeline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBusinessDevelopment } from '../../context/BusinessDevelopmentContext';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 65;
const NAVBAR_HEIGHT = '64px';

export const BDSideMenu: React.FC = () => {
  const location = useLocation();
  const [formsOpen, setFormsOpen] = useState(location.pathname.includes('/forms'));
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);
  const navigate = useNavigate();
  useBusinessDevelopment();


  const handleNavigation = (path: string) => {
    navigate(path);
  };

   useEffect(() => {
        setFormsOpen(location.pathname.includes('/forms'));
    }, [location.pathname]);

  const toggleDrawer = () => {
    setIsDrawerExpanded(!isDrawerExpanded);
  };

  const formSections = [
    {
      id: 'opportunityTracking',
      title: 'Opportunity Tracking',
      icon: <DescriptionIcon />,
      path: '/business-development/details/forms/opportunity-tracking',
    },
    {
      id: 'goNoGo',
      title: 'Go/No-Go Decision',
      icon: <AssessmentIcon />,
      path: '/business-development/details/forms/gonogo',
    },
    {
      id: 'bidPrep',
      title: 'Bid Preparation',
      icon: <AssignmentIcon />,
      path: '/business-development/details/forms/bid-preparation',
    },
  ];

  const menuSections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <HomeIcon />,
      path: '/business-development/details/overview',
    },
    {
      id: 'forms',
      title: 'Forms',
      icon: <ArticleIcon />,
      path: '/business-development/details/forms',
      subItems: formSections,
    },
    {
      id: 'documents',
      title: 'Documents',
      icon: <FolderIcon />,
      path: '/business-development/details/documents',
    },
    {
      id: 'timeline',
      title: 'Timeline',
      icon: <TimelineIcon />,
      path: '/business-development/details/timeline',
    },
  ];

  return (
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
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={toggleDrawer}>
          {isDrawerExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <List sx={{ width: '100%', p: 2 }}>
        {menuSections.map((section) => (
          <Box key={section.id}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (section.path) handleNavigation(section.path);
                  if (section.subItems) setFormsOpen(!formsOpen);
                }}
                sx={{
                  bgcolor: location.pathname.startsWith(section.path || 'never') ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  minHeight: 48,
                  justifyContent: isDrawerExpanded ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <Tooltip title={!isDrawerExpanded ? section.title : ''} placement="right">
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isDrawerExpanded ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {section.icon}
                  </ListItemIcon>
                </Tooltip>
                {isDrawerExpanded && (
                  <>
                    <ListItemText primary={section.title} />
                    {section.subItems && (formsOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />)}
                  </>
                )}
              </ListItemButton>
            </ListItem>
            {isDrawerExpanded && section.subItems && (
              <Collapse in={formsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {section.subItems.map((item) => (
                      <ListItemButton
                        key={item.id}
                        sx={{
                          pl: 4,
                          bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                        onClick={() => handleNavigation(item.path)}
                        disabled={(item as any).disabled}
                      >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { fontWeight: location.pathname === item.path ? 600 : 400 },
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>
    </Drawer>
  );
};
