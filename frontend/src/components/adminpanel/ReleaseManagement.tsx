import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GitHubIcon from '@mui/icons-material/GitHub';
import BugReportIcon from '@mui/icons-material/BugReport';
import DescriptionIcon from '@mui/icons-material/Description';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

interface StepDetail {
  label: string;
  description: string;
  icon: React.ReactNode;
}

const releaseSteps: StepDetail[] = [
  {
    label: 'Release Initialization',
    description: 'Define release type (Major, Minor, Patch) and select the base development branch.',
    icon: <RocketLaunchIcon color="primary" />,
  },
  {
    label: 'Branch Consolidation',
    description: 'Merge development changes into the new release branch and resolve conflicts.',
    icon: <GitHubIcon color="primary" />,
  },
  {
    label: 'Environment Health Check',
    description: 'Verify connectivity and health of the target AWS staging environments.',
    icon: <VerifiedUserIcon color="primary" />,
  },
  {
    label: 'Unit & Regression Tests',
    description: 'Execute the core regression test suite (run-regression-tests.ps1) to ensure stability.',
    icon: <BugReportIcon color="primary" />,
  },
  {
    label: 'Integration Tests',
    description: 'Validate end-to-end flows spanning across multiple microservices and Document AI.',
    icon: <BugReportIcon color="primary" />,
  },
  {
    label: 'Versioning & Tagging',
    description: 'Increment semantic version number and create Git tags for traceability.',
    icon: <GitHubIcon color="primary" />,
  },
  {
    label: 'Release Notes Generation',
    description: 'Automatically extract changes from commit messages and JIRA tickets.',
    icon: <DescriptionIcon color="primary" />,
  },
  {
    label: 'Security & Quality Audit',
    description: 'Review code quality scans and perform vulnerability assessments.',
    icon: <VerifiedUserIcon color="primary" />,
  },
  {
    label: 'Management Approval',
    description: 'Final Go/No-Go decision from the Release Manager and Stakeholders.',
    icon: <Chip label="Action Required" color="warning" size="small" />,
  },
  {
    label: 'Deployment to Staging',
    description: 'Trigger GitHub Actions to push artifacts to AWS RDS/Aurora and Dev Servers.',
    icon: <CloudUploadIcon color="primary" />,
  },
  {
    label: 'Release Communication',
    description: 'Notify teams via Slack and Email about the successful release and available updates.',
    icon: <NotificationsActiveIcon color="primary" />,
  },
];

interface ReleaseTag {
  version: string;
  date: string;
  status: 'Production' | 'Rollback' | 'Staging' | 'Failed';
  commit: string;
  approvedBy: string;
  environment: string;
  changes: string[];
}

const recentReleases: ReleaseTag[] = [
  { 
    version: 'v1.5.0-rc.1', 
    date: '2026-03-17', 
    status: 'Staging', 
    commit: 'f8a91b2',
    approvedBy: 'Dev Team',
    environment: 'AWS Staging (us-east-1)',
    changes: ['Fix Data Extraction Logic', 'Enhance Admin Dashboard', 'Optimize Engine Performance']
  },
  { 
    version: 'v1.4.2', 
    date: '2026-03-10', 
    status: 'Production', 
    commit: '7c8d9e0',
    approvedBy: 'Release Manager',
    environment: 'AWS Production (ap-south-1)',
    changes: ['Security Patch 03-2026', 'Optimize Database Queries']
  },
  { 
    version: 'v1.4.1', 
    date: '2026-03-05', 
    status: 'Rollback', 
    commit: '2a3b4c5',
    approvedBy: 'Admin',
    environment: 'AWS Production (ap-south-1)',
    changes: ['Experimental Feature: Auto-save']
  },
];

const ReleaseManagement: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = () => {
    setIsProcessing(true);
    // Simulate process delay
    setTimeout(() => {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setIsProcessing(false);
    }, 1500);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <RocketLaunchIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          Release Management Control
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        This dashboard orchestrates the <strong>KIRO AIDLC</strong> release process. 
        Each step must be verified before proceeding to the next phase.
      </Alert>

      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {releaseSteps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {index < activeStep ? (
                      <CheckCircleIcon color="success" />
                    ) : index === activeStep ? (
                      <RadioButtonUncheckedIcon color="primary" />
                    ) : (
                      <RadioButtonUncheckedIcon color="disabled" />
                    )}
                  </Box>
                )}
              >
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {step.label}
                  {index < activeStep && <Chip label="Completed" size="small" color="success" variant="outlined" sx={{ height: 20 }} />}
                  {index === activeStep && <Chip label="In Progress" size="small" color="primary" sx={{ height: 20 }} />}
                </Typography>
              </StepLabel>
              <StepContent>
                <Card variant="outlined" sx={{ mb: 2, mt: 1, borderStyle: 'dashed' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <Box sx={{ mt: 0.5 }}>{step.icon}</Box>
                    <Box>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        {step.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1, px: 4 }}
                      disabled={isProcessing}
                      startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                      {index === releaseSteps.length - 1 ? 'Finish Release' : 'Complete Step'}
                    </Button>
                    <Button
                      disabled={index === 0 || isProcessing}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === releaseSteps.length && (
          <Paper square elevation={0} sx={{ p: 3, textAlign: 'center', mt: 2, bgcolor: 'success.light', borderRadius: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.dark', mb: 2 }} />
            <Typography variant="h5" color="success.dark" gutterBottom fontWeight="bold">
              Release Process Completed Successfully!
            </Typography>
            <Typography variant="body1" color="success.dark" sx={{ mb: 3 }}>
              The application has been tagged, release notes generated, and notified to all stakeholders.
            </Typography>
            <Button onClick={handleReset} variant="outlined" color="success" startIcon={<RocketLaunchIcon />}>
              Start New Release
            </Button>
          </Paper>
        )}
      </Paper>

      <Divider sx={{ my: 4 }} />
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <GitHubIcon sx={{ color: 'text.secondary' }} />
        <Typography variant="h5" fontWeight="bold">
          Recent Releases & Git Tags
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <List disablePadding>
          {recentReleases.map((release, index) => (
            <React.Fragment key={release.version}>
              {index > 0 && <Divider />}
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  py: 2, 
                  flexDirection: 'column',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                     <RocketLaunchIcon color={release.status === 'Production' ? 'primary' : release.status === 'Staging' ? 'info' : release.status === 'Rollback' ? 'error' : 'action'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {release.version}
                        </Typography>
                        <Chip 
                          label={release.status} 
                          size="small" 
                          color={release.status === 'Production' ? 'success' : release.status === 'Rollback' ? 'error' : release.status === 'Staging' ? 'info' : 'default'} 
                          variant="outlined" 
                          sx={{ height: 20 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Released on {release.date} • Commit: <code>{release.commit}</code>
                      </Typography>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" startIcon={<GitHubIcon />} disabled sx={{ textTransform: 'none' }}>
                      GitHub Tag
                    </Button>
                    {release.status === 'Production' && (
                      <Button size="small" variant="outlined" color="error" disabled sx={{ textTransform: 'none' }}>
                        Rollback
                      </Button>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ pl: 5, width: '100%' }}>
                  <Box sx={{ display: 'flex', gap: 3, mb: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase' }}>
                        Environment
                      </Typography>
                      <Typography variant="body2">{release.environment}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase' }}>
                        Approver
                      </Typography>
                      <Typography variant="body2">{release.approvedBy}</Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', mb: 0.5 }}>
                    Changes in this release
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2, typography: 'body2', color: 'text.secondary' }}>
                    {release.changes.map((change, i) => (
                      <li key={i}>{change}</li>
                    ))}
                  </Box>
                </Box>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default ReleaseManagement;
