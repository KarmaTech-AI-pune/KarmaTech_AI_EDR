import React, { useContext, useState, useEffect, ReactNode } from 'react';
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
  Chip,
  Button,
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
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { projectManagementAppContext } from '../App';
import { OpportunityTracking } from '../models';
import { OpportunityForm } from '../components/forms/OpportunityForm';
import BidPreparationForm from '../components/forms/BidPreparationForm';
import GoNoGoForm from "../components/forms/GoNoGoForm";
import { BDChips } from '../components/common/BDChips';
import { opportunityApi } from '../services/opportunityApi';
import { HistoryWidget } from '../components/widgets/HistoryWidget';
import { getOpportunityHistoriesByOpportunityId } from '../dummyapi/dummyOpportunityHistoryApi';
import { OpportunityHistory } from '../models';
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

export const BusinessDevelopmentDetails: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState('overview');
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [formsOpen, setFormsOpen] = useState(false);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);
  const [histories, setHistories] = useState<OpportunityHistory[]>([]);
  const [refreshed, setRefreshed] = useState(false);
  const [goNoGoDecisionStatus, setGoNoGoDecisionStatus] = useState<string | null>(null);
  const [goNoGoVersionNumber, setGoNoGoVersionNumber] = useState<number | null>(null);
  const context = useContext(projectManagementAppContext);
  const opportunity = context?.selectedProject as OpportunityTracking;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (opportunity) {
          const historyData = await getOpportunityHistoriesByOpportunityId(opportunity.id?.toString() || '0');
          setHistories(historyData);
          // Reset the refresh trigger after data is fetched
          setRefreshed(false);
        }
      } catch (err) {
        console.error('Error fetching histories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch histories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [opportunity, refreshed]); // Add refreshed to dependencies

  const handleOpportunityUpdate = async () => {
    if (opportunity && context?.setSelectedProject) {
      try {
        const updatedOpportunity = await opportunityApi.getById(opportunity.id || 0);
        if (updatedOpportunity) {
          // Use type assertion to match expected type
          context.setSelectedProject(updatedOpportunity as any);
          // Trigger refresh after opportunity is updated
          setRefreshed(true);
        }
      } catch (error) {
        console.error('Error refreshing opportunity:', error);
      }
    }
  };

  const handleGoNoGoClick = () => {
    if (context?.setScreenState) {
      context.setScreenState("GoNoGo Form");
    }
  };

  const handleBidPrepClick = () => {
    if (context?.setScreenState) {
      context.setScreenState("Bid Preparation Form");
    }
  };

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

  if (!opportunity) {
    return (
      <Container>
        <Alert severity="warning">No opportunity selected</Alert>
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

  const formatCurrency = (amount: number | undefined, currency: string) => {
    if (amount === undefined) return 'Not specified';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return 'Not specified';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleFormSubmit = async (data: OpportunityTracking) => {
    try {
      // Use type assertion to match expected type
      await opportunityApi.create(data as any);
      // Trigger refresh after form submission
      setRefreshed(true);
      handleOpportunityUpdate();
    } catch (error) {
      console.error('Error updating opportunity:', error);
    }
  };

  const isOpportunityApproved = opportunity?.currentHistory?.statusId === 6;

  const formSections = [
    {
      id: 'opportunityTracking',
      title: 'Opportunity Tracking',
      icon: <DescriptionIcon />,
      onClick: () => handleFormClick('opportunityTracking'),
      disabled: !opportunity
    },
    {
      id: 'goNoGo',
      title: 'Go/No-Go Decision',
      icon: <AssessmentIcon />,
      onClick: handleGoNoGoClick,
      disabled: !isOpportunityApproved // Enable only when opportunity is approved
    },
    {
      id: 'bidPrep',
      title: 'Bid Preparation',
      icon: <AssignmentIcon />,
      onClick: handleBidPrepClick,
      disabled: !(goNoGoDecisionStatus === "GO" && goNoGoVersionNumber === 3) // Enable only when version 3 has GO status
    }
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

  const renderContent = () => {
    if (selectedSection === 'forms') {
      if (selectedForm) {
        switch (selectedForm) {
          case 'opportunityTracking':
            return (
              <Box sx={{ p: 3 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Opportunity Tracking Form
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    View and edit opportunity tracking details for {opportunity.workName}
                  </Typography>
                  <OpportunityForm
                    onSubmit={handleFormSubmit}
                    project={opportunity}
                  />
                </Paper>
              </Box>
            );
          case 'goNoGo':
            return (
              <GoNoGoForm 
                onDecisionStatusChange={(status, versionNumber) => {
                  setGoNoGoDecisionStatus(status);
                  setGoNoGoVersionNumber(versionNumber);
                }}
              />
            );
          case 'bidPrep':
            return (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Bid Preparation Form</Typography>
                <BidPreparationForm />
              </Box>
            );
          default:
            return null;
        }
      }
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Forms Overview</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Opportunity Tracking</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Track and manage opportunity details, client information, and project specifics.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleFormClick('opportunityTracking')}
                    disabled={!opportunity} // Only enabled when there's an opportunity
                  >
                    View Form
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Go/No-Go Decision</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Evaluate project viability and make informed decisions on opportunity pursuit.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleGoNoGoClick}
                    disabled={!isOpportunityApproved} // Enable only when opportunity is approved
                  >
                    View Form
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Bid Preparation</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Prepare and manage bid documentation and submission details.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleBidPrepClick}
                    disabled={!(goNoGoDecisionStatus === "GO" && goNoGoVersionNumber === 3)} // Enable only when version 3 has GO status
                  >
                    View Form
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      );
    }

    switch (selectedSection) {
      case 'overview':
        return (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Basic Opportunity Info */}
              <Grid item xs={12} md={6}>
                <InfoCard title="Opportunity Information" icon={<HomeIcon />}>
                  <InfoItem label="Work Name" value={opportunity.workName} />
                  <InfoItem label="Client" value={opportunity.client} />
                  <InfoItem label="Client Sector" value={opportunity.clientSector} />
                  <InfoItem label="Operation" value={opportunity.operation} />
                  <InfoItem label="Status" value={opportunity.status} />
                </InfoCard>
              </Grid>

              {/* Project Details */}
              <Grid item xs={12} md={6}>
                <InfoCard title="Project Details" icon={<BusinessIcon />}>
                  <InfoItem label="Stage" value={opportunity.stage} />
                  <InfoItem label="Strategic Ranking" value={opportunity.strategicRanking} />
                  <InfoItem label="Contract Type" value={opportunity.contractType} />
                  <InfoItem label="Funding Stream" value={opportunity.fundingStream} />
                </InfoCard>
              </Grid>

              {/* Financial Info */}
              <Grid item xs={12} md={6}>
                <InfoCard title="Financial Details" icon={<AttachMoneyIcon />}>
                  <InfoItem 
                    label="Capital Value" 
                    value={formatCurrency(opportunity.capitalValue, opportunity.currency || 'USD')} 
                  />
                  <Chip 
                    label={opportunity.currency || 'USD'}
                    size="small"
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </InfoCard>
              </Grid>

              {/* Timeline Info */}
              <Grid item xs={12} md={6}>
                <InfoCard title="Timeline" icon={<CalendarTodayIcon />}>
                  <InfoItem label="Likely Start Date" value={formatDate(opportunity.likelyStartDate)} />
                  <InfoItem label="Duration (months)" value={opportunity.durationOfProject} />
                </InfoCard>
              </Grid>

              {/* History Widget */}
              <Grid item xs={12}>
                <HistoryWidget 
                  histories={histories} 
                  title={`History - ${opportunity.workName}`} 
                />
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
              Opportunity timeline section will be implemented here
            </Typography>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <>
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
                        disabled={item.disabled}
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
          width: { sm: `calc(100% - ${isDrawerExpanded ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH}px)` },
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms, margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {opportunity.workName}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
            <BDChips opportunityId={opportunity.id || 0} />
          </Box>
          {renderContent()}
        </Box>
      </Box>
    </Box>
    </>
  );
};
