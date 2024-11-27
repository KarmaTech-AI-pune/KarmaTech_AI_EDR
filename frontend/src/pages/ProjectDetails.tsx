import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TaskIcon from '@mui/icons-material/Task';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import FolderIcon from '@mui/icons-material/Folder';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Project, OpportunityTracking } from '../types';
import { projectManagementAppContext } from '../App';
import { opportunityApi } from '../dummyapi/opportunityApi';

const DRAWER_WIDTH = 280;
const NAVBAR_HEIGHT = '64px';

export const ProjectDetails: React.FC = () => {
  const [opportunity, setOpportunity] = useState<OpportunityTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState('overview');
  const [expandedMenu, setExpandedMenu] = useState<string | false>('overview');
  const [expandedForm, setExpandedForm] = useState<string | false>(false);
  const context = useContext(projectManagementAppContext);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleMenuChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedMenu(isExpanded ? panel : false);
    setSelectedSection(panel);
  };

  const handleFormAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedForm(isExpanded ? panel : false);
  };

  const getProjectTitle = (project: Project | OpportunityTracking | null) => {
    if (!project) return 'Project Details';
    if ('name' in project) return project.name;
    if ('workName' in project) return project.workName;
    return 'Project Details';
  };

  const formSections = [
    {
      id: 'wbs',
      title: 'PMD2. Work Breakdown Structure',
      icon: <TaskIcon />,
    },
    {
      id: 'jobStart',
      title: 'PMD1. Job Start Form',
      icon: <AssignmentIcon />,
    },
    {
      id: 'inputRegister',
      title: 'PMD3. Input Register',
      icon: <DescriptionIcon />,
    },
    {
      id: 'correspondence',
      title: 'PMD4. Correspondence Inward-Outward',
      icon: <EmailIcon />,
    },
    {
      id: 'review',
      title: 'PMD5. Check and Review Form',
      icon: <CheckCircleIcon />,
    },
    {
      id: 'changeControl',
      title: 'PMD6. Change Control Register',
      icon: <ChangeCircleIcon />,
    },
    {
      id: 'progressReview',
      title: 'PMD7. Monthly Progress Review',
      icon: <AssessmentIcon />,
    },
    {
      id: 'closure',
      title: 'PMD8. Project Closure',
      icon: <TaskIcon />,
    },
  ];

  const menuSections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <HomeIcon />,
    },
    {
      id: 'forms',
      title: 'Forms',
      icon: <ArticleIcon />,
      subItems: formSections,
    },
    {
      id: 'documents',
      title: 'Documents',
      icon: <FolderIcon />,
    },
    {
      id: 'timeline',
      title: 'Timeline',
      icon: <TimelineIcon />,
    },
  ];

  if (!context?.selectedProject) {
    return (
      <Container>
        <Alert severity="warning">No project selected</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const renderContent = () => {
    switch (selectedSection) {
      case 'overview':
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Project Overview</Typography>
            {/* Add project overview content */}
          </Paper>
        );
      case 'forms':
        return (
          <Box sx={{ width: '100%' }}>
            {formSections.map((section) => (
              <Accordion
                key={section.id}
                expanded={expandedForm === section.id}
                onChange={handleFormAccordionChange(section.id)}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {section.icon}
                    <Typography>{section.title}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                      Form content for {section.title} will be implemented here
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        );
      case 'documents':
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Documents</Typography>
            <Typography variant="body1" color="text.secondary">
              Document management section will be implemented here
            </Typography>
          </Paper>
        );
      case 'timeline':
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Timeline</Typography>
            <Typography variant="body1" color="text.secondary">
              Project timeline section will be implemented here
            </Typography>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT})`,
        pt: `${NAVBAR_HEIGHT}`,
        bgcolor: 'background.default'
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: NAVBAR_HEIGHT,
            height: `calc(100% - ${NAVBAR_HEIGHT})`,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
      >
        <List sx={{ width: '100%', p: 2 }}>
          {menuSections.map((section) => (
            <Accordion
              key={section.id}
              expanded={expandedMenu === section.id}
              onChange={handleMenuChange(section.id)}
              sx={{
                '&:before': { display: 'none' },
                boxShadow: 'none',
                bgcolor: 'transparent',
              }}
            >
              <AccordionSummary
                expandIcon={section.subItems ? <ExpandMoreIcon /> : null}
                sx={{
                  minHeight: 48,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {section.icon}
                  <Typography>{section.title}</Typography>
                </Box>
              </AccordionSummary>
              {section.subItems && (
                <AccordionDetails sx={{ p: 0 }}>
                  <List disablePadding>
                    {section.subItems.map((subItem) => (
                      <ListItem key={subItem.id} disablePadding>
                        <ListItemButton
                          onClick={() => setExpandedForm(subItem.id)}
                          sx={{ pl: 4 }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={subItem.title}
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: { fontWeight: expandedForm === subItem.id ? 600 : 400 }
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              )}
            </Accordion>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h4" gutterBottom>
          {getProjectTitle(context.selectedProject)}
        </Typography>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default ProjectDetails;
