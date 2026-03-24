import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
import EngineeringIcon from '@mui/icons-material/Engineering';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import DnsIcon from '@mui/icons-material/Dns'; // New icon for migrations
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // Icon for budget history
import PaymentsIcon from '@mui/icons-material/Payments';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 65;
const NAVBAR_HEIGHT = '64px';

const formSections = [
  {
    id: 'wbs',
    title: 'PMD2. Work Breakdown Structure',
    icon: <TaskIcon />,
    path: 'forms/wbs',
    subItems: [
      {
        id: 'manpowerForm',
        title: 'Manpower Form',
        icon: <EngineeringIcon />,
        path: 'forms/wbs/manpower'
      },
      {
        id: 'odcForm',
        title: 'ODC Form',
        icon: <ReceiptLongIcon />,
        path: 'forms/wbs/odc'
      },
      {
        id: 'productBacklog',
        title: 'Product Backlog',
        icon: <ArticleIcon />,
        path: 'forms/wbs/product-backlog'
      },
      {
        id: 'todolist',
        title: 'Sprint Planning',
        icon: <ChecklistRtlIcon />,
        path: 'forms/wbs/todo-list'
      },
      {
        id: 'cashflow',
        title: 'Cashflow',
        icon: <PaymentsIcon />,
        path: 'forms/cashflow'
      }
    ]
  },
  {
    id: 'jobStart',
    title: 'PMD1. Job Start Form',
    icon: <AssignmentIcon />,
    path: 'forms/job-start'
  },
  {
    id: 'inputRegister',
    title: 'PMD3. Input Register',
    icon: <DescriptionIcon />,
    path: 'forms/input-register'
  },
  {
    id: 'correspondence',
    title: 'PMD4. Correspondence Inward-Outward',
    icon: <EmailIcon />,
    path: 'forms/correspondence'
  },
  {
    id: 'review',
    title: 'PMD5. Check and Review Form',
    icon: <CheckCircleIcon />,
    path: 'forms/check&review'
  },
  {
    id: 'changeControl',
    title: 'PMD6. Change Control Register',
    icon: <ChangeCircleIcon />,
    path: 'forms/change-control'
  },
  {
    id: 'progressReview',
    title: 'PMD7. Monthly Progress Review',
    icon: <AssessmentIcon />,
    path: 'forms/progress-review'
  },
  {
    id: 'closure',
    title: 'PMD8. Project Closure',
    icon: <TaskIcon />,
    path: 'forms/closure'
  },
  {
    id: 'monthlyReports',
    title: 'Monthly Reports',
    icon: <AssessmentIcon />,
    path: 'forms/monthly-reports'
  },
];

const menuSections = [
  {
    id: 'overview',
    title: 'Overview',
    icon: <HomeIcon />,
    path: 'overview'
  },
  {
    id: 'forms',
    title: 'Forms',
    icon: <ArticleIcon />,
    path: 'forms',
    subItems: formSections,
  },
  {
    id: 'documents',
    title: 'Documents',
    icon: <FolderIcon />,
    path: 'documents'
  },
  {
    id: 'timeline',
    title: 'Timeline',
    icon: <TimelineIcon />,
    path: 'timeline'
  },
  {
    id: 'budgetHistory',
    title: 'Budget History',
    icon: <AccountBalanceIcon />,
    path: 'budget-history'
  },
  {
    id: 'migrationManagement',
    title: 'Migration Management',
    icon: <DnsIcon />,
    path: 'admin/migrations' // Path to the new migration page
  },
];


export const SideMenu: React.FC = () => {
  const location = useLocation();
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);
  const [formsOpen, setFormsOpen] = useState(location.pathname.includes('/forms'));
  const [expandedForm, setExpandedForm] = useState<string | null>(null);

  useEffect(() => {
    setFormsOpen(location.pathname.includes('/forms'));
  }, [location.pathname]);

  const toggleDrawer = () => {
    setIsDrawerExpanded(!isDrawerExpanded);
    if (!isDrawerExpanded) {
      setFormsOpen(false);
    }
  };

  const handleFormClick = (formId: string) => {
    const form = formSections.find(f => f.id === formId);

    if (form?.subItems) {
      setExpandedForm(expandedForm === formId ? null : formId);
    }
  };

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === 'forms') {
      setFormsOpen(!formsOpen);
    }
  }

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
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', py: 1 }}>
        <IconButton onClick={toggleDrawer}>
          {isDrawerExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <List sx={{ width: '100' }}>
        {menuSections.map((section) => (
          <Box key={section.id}>
            <ListItem disablePadding>
              <ListItemButton
                component={NavLink}
                to={section.path}
                onClick={() => handleSectionClick(section.id)}
                sx={{
                  '&.active': {
                    bgcolor: 'action.selected',
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  minHeight: 48,
                  justifyContent: isDrawerExpanded ? 'initial' : 'center',
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
                        component={NavLink}
                        to={item.path || ''}
                        sx={{
                          pl: 4,
                          '&.active': {
                            bgcolor: 'action.selected',
                          },
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
                          }}
                        />
                        {item.subItems && (
                          expandedForm === item.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />
                        )}
                      </ListItemButton>

                      {item.subItems && (
                        <Collapse in={expandedForm === item.id} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {item.subItems.map((subItem) => (
                              <ListItemButton
                                key={subItem.id}
                                component={NavLink}
                                to={subItem.path}
                                sx={{
                                  pl: 8,
                                  '&.active': {
                                    bgcolor: 'action.selected',
                                  },
                                  '&:hover': {
                                    bgcolor: 'action.hover',
                                  },
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: '40px' }}>
                                  {subItem.icon}
                                </ListItemIcon>
                                <ListItemText
                                  primary={subItem.title}
                                  primaryTypographyProps={{
                                    variant: 'body2',
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
  );
};
