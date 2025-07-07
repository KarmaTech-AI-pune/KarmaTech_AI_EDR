import React, { useEffect, useState, ReactNode } from 'react';
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
import EngineeringIcon from '@mui/icons-material/Engineering';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useParams } from 'react-router-dom';
import { Project, OpportunityTracking } from '../models';
import { getUserById } from '../services/userApi';
import { projectApi } from '../services/projectApi';
import {
  WorkBreakdownStructureForm,
  JobStartForm,
  InputRegisterForm,
  CorrespondenceForm,
  CheckReviewForm,
  ChangeControlForm,
  MonthlyProgressForm,
  ProjectClosureForm,
  FormsOverview,
  MonthlyReports,
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
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState('overview');
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [formsOpen, setFormsOpen] = useState(false);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);
  const [expandedForm, setExpandedForm] = useState<string | null>(null);
  const [managerNames, setManagerNames] = useState<{[key: string]: string}>({});
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        if (id) {
          const projectData = await projectApi.getById(id);
          if (projectData) {
            setProject(projectData as Project);
          } else {
            setError('Project not found');
          }
        } else {
          setError('No project ID provided');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  // Fetch manager data when the project data is loaded
  useEffect(() => {
    const fetchManagerData = async () => {
      if (!project) return;

      const managerIds = [
        project.projectManagerId,
        project.seniorProjectManagerId,
        project.regionalManagerId
      ].filter(Boolean);

      if (managerIds.length === 0) return;

      try {
        const fetchedNames: {[key: string]: string} = {};

        for (const id of managerIds) {
          try {
            const userData = await getUserById(id);
            if (userData) {
              fetchedNames[id] = userData.name;
            }
          } catch (err) {
            console.error(`Error fetching user with ID ${id}:`, err);
            fetchedNames[id] = 'Not assigned';
          }
        }

        setManagerNames(fetchedNames);
      } catch (err) {
        console.error('Error fetching manager data:', err);
      }
    };

    fetchManagerData();
  }, [project]);

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

  if (!project) {
    return (
      <Container>
        <Alert severity="warning">No project selected</Alert>
      </Container>
    );
  }

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
    const form = formSections.find(f => f.id === formId);

    if (form?.subItems) {
      // If the form has sub-items, toggle its expanded state
      setExpandedForm(expandedForm === formId ? null : formId);
    } else {
      // If it's a regular form without sub-items, select it directly
      setSelectedForm(formId);
    }
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

  const getManagerName = (managerId: string) => {
    if (!managerId) return 'Not assigned';
    return managerNames[managerId] || 'Loading...';
  };

  const formSections = [
    {
      id: 'wbs',
      title: 'PMD2. Work Breakdown Structure',
      icon: <TaskIcon />,
      subItems: [
        {
          id: 'manpowerForm',
          title: 'Manpower Form',
          icon: <EngineeringIcon />,
          component: <WorkBreakdownStructureForm formType="manpower" />
        },
        {
          id: 'odcForm',
          title: 'ODC Form',
          icon: <ReceiptLongIcon />,
          component: <WorkBreakdownStructureForm formType="odc" />
        }
      ]
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
    {
      id: 'monthlyReports',
      title: 'Monthly Reports',
      icon: <AssessmentIcon />,
      component: <MonthlyReports />
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
        // First check if it's a direct form
        const form = formSections.find(f => f.id === selectedForm);
        if (form) {
          return form.component;
        }

        // If not found, check if it's a sub-item
        for (const formSection of formSections) {
          if (formSection.subItems) {
            const subItem = formSection.subItems.find(s => s.id === selectedForm);
            if (subItem) {
              return subItem.component;
            }
          }
        }

        // If still not found, show the forms overview
        return <FormsOverview onFormSelect={handleFormClick} />;
      }
      return <FormsOverview onFormSelect={handleFormClick} />;
    }

    switch (selectedSection) {
      case 'overview':
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
                    value={getManagerName(project.projectManagerId)}
                  />
                  <InfoItem
                    label="Senior Project Manager"
                    value={getManagerName(project.seniorProjectManagerId)}
                  />
                  <InfoItem
                    label="Regional Manager"
                    value={getManagerName(project.regionalManagerId)}
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
                  <InfoItem label="Fee Type" value={project.fundingStream} />
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
        bgcolor: 'background.default'
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
                      <React.Fragment key={item.id}>
                        <ListItemButton
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
                          {item.subItems && (
                            expandedForm === item.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
                          )}
                        </ListItemButton>

                        {/* Render sub-items if this form has them */}
                        {item.subItems && (
                          <Collapse in={expandedForm === item.id} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              {item.subItems.map((subItem) => (
                                <ListItemButton
                                  key={subItem.id}
                                  sx={{
                                    pl: 8,
                                    bgcolor: selectedForm === subItem.id ? 'action.selected' : 'transparent',
                                    '&:hover': {
                                      bgcolor: 'action.hover',
                                    },
                                  }}
                                  onClick={() => setSelectedForm(subItem.id)}
                                >
                                  <ListItemIcon sx={{ minWidth: '40px' }}>
                                    {subItem.icon}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={subItem.title}
                                    primaryTypographyProps={{
                                      variant: 'body2',
                                      sx: { fontWeight: selectedForm === subItem.id ? 600 : 400 }
                                    }}
                                  />
                                </ListItemButton>
                              ))}
                            </List>
                          </Collapse>
                        )}
                      </React.Fragment>
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
          width: { sm: `calc(100% - ${isDrawerExpanded ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)` },
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {getProjectTitle(project)}
          </Typography>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectDetails;
