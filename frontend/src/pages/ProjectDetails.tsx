import React, { useEffect, useState, useContext, ReactNode } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Paper,
  Collapse,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Project, OpportunityTracking } from '../models';
import { projectManagementAppContext } from '../App';
import { getUserById } from '../dummyapi/database/dummyusers';

// Import all forms from index
import {
  WorkBreakdownStructureForm,
  JobStartForm,
  InputRegisterForm,
  CorrespondenceForm,
  CheckReviewForm,
  ChangeControlForm,
  MonthlyProgressForm,
  ProjectClosureForm,
  FormsOverview
} from '../components/forms';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 65;
const NAVBAR_HEIGHT = '64px';

interface InfoCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ mr: 1, color: 'primary.main' }}>{icon}</Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      {children}
    </CardContent>
  </Card>
);

const InfoItem: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body1">
      {value || 'Not specified'}
    </Typography>
  </Box>
);

export const ProjectDetails: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState('overview');
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [formsOpen, setFormsOpen] = useState(false);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);
  const context = useContext(projectManagementAppContext);

  useEffect(() => {
    setIsLoading(false);
    setError(null)
  }, []);

  const handleSectionClick = (section: string) => {
    setSelectedSection(section);
    if (section === 'forms') {
      setFormsOpen(!formsOpen);
      setSelectedForm(null);
    } else {
      setFormsOpen(false);
      setSelectedForm(null);
    }
  };

  const handleFormClick = (formId: string) => {
    setSelectedForm(formId);
    setSelectedSection('forms');
  };

  const toggleDrawer = () => {
    setIsDrawerExpanded(!isDrawerExpanded);
    if (!isDrawerExpanded) {
      setFormsOpen(false);
    }
  };

  const getProjectTitle = (project: Project | OpportunityTracking | null) => {
    if (!project) return 'Project Details';
    if ('name' in project) return project.name;
    if ('workName' in project) return project.workName;
    return 'Project Details';
  };

  const getManagerName = (managerId: number) => {
    const user = getUserById(managerId);
    return user ? user.name : 'Not assigned';
  };

  const formSections = [
    {
      id: 'wbs',
      title: 'PMD2. Work Breakdown Structure',
      icon: <TaskIcon />,
      component: <WorkBreakdownStructureForm />
    },
    {
      id: 'jobStart',
      title: 'PMD1. Job Start Form',
      icon: <AssignmentIcon />,
      component: <JobStartForm />
    },
    {
      id: 'inputRegister',
      title: 'PMD3. Input Register',
      icon: <DescriptionIcon />,
      component: <InputRegisterForm />
    },
    {
      id: 'correspondence',
      title: 'PMD4. Correspondence Inward-Outward',
      icon: <EmailIcon />,
      component: <CorrespondenceForm />
    },
    {
      id: 'review',
      title: 'PMD5. Check and Review Form',
      icon: <CheckCircleIcon />,
      component: <CheckReviewForm />
    },
    {
      id: 'changeControl',
      title: 'PMD6. Change Control Register',
      icon: <ChangeCircleIcon />,
      component: <ChangeControlForm />
    },
    {
      id: 'progressReview',
      title: 'PMD7. Monthly Progress Review',
      icon: <AssessmentIcon />,
      component: <MonthlyProgressForm />
    },
    {
      id: 'closure',
      title: 'PMD8. Project Closure',
      icon: <TaskIcon />,
      component: <ProjectClosureForm />
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderContent = () => {
    if (selectedSection === 'forms') {
      if (selectedForm) {
        const form = formSections.find(f => f.id === selectedForm);
        return form?.component;
      }
      return <FormsOverview onFormSelect={handleFormClick} />;
    }

    switch (selectedSection) {
      case 'overview':
        const project = context.selectedProject as Project;
        return (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Basic Project Info */}
              <Grid item xs={12} md={6}>
                <InfoCard title="Project Information" icon={<HomeIcon />}>
                  <InfoItem label="Project Number" value={project.projectNo} />
                  <InfoItem label="Type of Job" value={project.typeOfJob} />
                  <InfoItem label="Sector" value={project.sector} />
                  <InfoItem label="Priority" value={project.priority} />
                  {project.details && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Project Details
                      </Typography>
                      <Typography variant="body2">{project.details}</Typography>
                    </Box>
                  )}
                </InfoCard>
              </Grid>

              {/* Client Info */}
              <Grid item xs={12} md={6}>
                <InfoCard title="Client Information" icon={<BusinessIcon />}>
                  <InfoItem label="Client Name" value={project.clientName} />
                  <InfoItem label="Type of Client" value={project.typeOfClient} />
                  <InfoItem label="Region" value={project.region} />
                  <InfoItem label="Office" value={project.office} />
                </InfoCard>
              </Grid>

              {/* Management Info */}
              <Grid item xs={12} md={4}>
                <InfoCard title="Management" icon={<PersonIcon />}>
                  <InfoItem 
                    label="Project Manager" 
                    value={getManagerName(project.projectMangerId)} 
                  />
                  <InfoItem 
                    label="Senior Project Manager" 
                    value={getManagerName(project.seniorProjectMangerId)} 
                  />
                  <InfoItem 
                    label="Regional Manager" 
                    value={getManagerName(project.regionalManagerID)} 
                  />
                </InfoCard>
              </Grid>

              {/* Financial Info */}
              <Grid item xs={12} md={4}>
                <InfoCard title="Financial Details" icon={<AttachMoneyIcon />}>
                  <InfoItem 
                    label="Estimated Cost" 
                    value={formatCurrency(project.estimatedCost, project.currency)} 
                  />
                  {project.budget && (
                    <InfoItem 
                      label="Budget" 
                      value={formatCurrency(project.budget, project.currency)} 
                    />
                  )}
                  <InfoItem label="Fee Type" value={project.feeType} />
                  <Chip 
                    label={project.currency}
                    size="small"
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </InfoCard>
              </Grid>

              {/* Timeline Info */}
              <Grid item xs={12} md={4}>
                <InfoCard title="Timeline" icon={<CalendarTodayIcon />}>
                  <InfoItem label="Start Date" value={formatDate(project.startDate)} />
                  <InfoItem label="End Date" value={formatDate(project.endDate)} />
                </InfoCard>
              </Grid>
            </Grid>
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
        bgcolor: 'background.default',
        overflow: 'hidden'
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
          {menuSections.map((section) => (
            <Box key={section.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick(section.id)}
                  sx={{
                    bgcolor: selectedSection === section.id ? 'action.selected' : 'transparent',
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
                      {section.subItems && (
                        formsOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
                      )}
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
                          bgcolor: selectedForm === item.id ? 'action.selected' : 'transparent',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                        onClick={() => handleFormClick(item.id)}
                      >
                        <ListItemIcon>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.title}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { fontWeight: selectedForm === item.id ? 600 : 400 }
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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: `calc(100vh - ${NAVBAR_HEIGHT})`,
          overflow: 'hidden',
          width: { sm: `calc(100% - ${isDrawerExpanded ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)` },
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        }}
      >
        <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
          <Typography variant="h4" gutterBottom>
            {getProjectTitle(context.selectedProject)}
          </Typography>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectDetails;
