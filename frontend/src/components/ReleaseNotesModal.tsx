/**
 * ReleaseNotesModal Component
 * 
 * Modal dialog for displaying release notes for a specific version.
 * Features:
 * - Material-UI Dialog layout with responsive design
 * - Header with version number and close button
 * - Content sections for Features, Bug Fixes, Improvements
 * - Loading and error states
 * - Proper accessibility and keyboard navigation
 * - Fallback to hardcoded release notes when API unavailable
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  Snackbar,
  DialogActions,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugIcon,
  Star as FeatureIcon,
  TrendingUp as ImprovementIcon,
  Warning as BreakingIcon,
  Code as CommitIcon,
  Person as AuthorIcon,
  CalendarToday as DateIcon,
} from '@mui/icons-material';
import { releaseNotesApi, ProcessedReleaseNotes, ChangeItem } from '../services/releaseNotesApi';

const FALLBACK_RELEASE_NOTES: Record<string, ProcessedReleaseNotes> = {
  '1.5.0': {
    version: '1.5.0',
    releaseDate: '2026-04-09',
    environment: 'production',
    features: [
      { id: 501, changeType: 'Feature', description: 'Multi-Tenant Architecture & Billing: Implemented robust multi-tenant architecture with subscription management, Razorpay billing integration, PDF invoice generation, and email notification service.', commitSha: '0ab63813' },
      { id: 502, changeType: 'Feature', description: 'Project & Task Management: Added TimeTrackingWidget and IssueDetailModal for advanced task time management. Implemented WorkBreakdownStructureForm and comprehensive WBS CQRS handlers.', commitSha: '4b1aff30' },
      { id: 503, changeType: 'Feature', description: 'Dashboard & UI Enhancements: Added task priority matrix and gross profit tracking to dashboard. Implemented loading states for admin components and password visibility toggle in UserDialog.', commitSha: 'bb4845b3' },
      { id: 504, changeType: 'Feature', description: 'Database & Architecture: Introduced comprehensive EF Core database context, initial schema migrations, and SeedExtensions for default tenant, roles, and permissions initialization.', commitSha: 'b3ffa66e' },
    ],
    bugFixes: [
      { id: 505, changeType: 'BugFix', description: 'Performance: Removed redundant API calls to improve application responsiveness.', commitSha: 'e508db25' },
      { id: 506, changeType: 'BugFix', description: 'Cost Calculation: Fixed CostToCompleteAndEAC handling of null expectedGrossProfitPercentage values.', commitSha: '31386c08' },
      { id: 507, changeType: 'BugFix', description: 'General: Addressed remaining hours calculation issues and resolved various frontend TypeScript integration errors.', commitSha: '7bcb5fa0' },
    ],
    improvements: [
      { id: 508, changeType: 'Improvement', description: 'Testing: Added resilient E2E testing with robust async selectors. Refactored CostToCompleteAndEAC core tests for comprehensive coverage, and integrated updated test suites in GitHub Actions.', commitSha: 'cb3bead1' },
    ],
    breakingChanges: [],
  },
  '1.4.0': {
    version: '1.4.0',
    releaseDate: '2026-03-26',
    environment: 'production',
    features: [
      { id: 401, changeType: 'Feature', description: 'Architecture & Infrastructure: Added TenantMigrationService for executing PostgreSQL database migrations across tenants.', commitSha: '5f8de151' },
      { id: 402, changeType: 'Feature', description: 'Task Management: Enhanced task management capabilities by implementing UI for user assignments and planned hours, including clearing duplicates.', commitSha: '9a98ee37' },
      { id: 403, changeType: 'Feature', description: 'Documentation: Added comprehensive EDR application README.md documentation encompassing technical architecture, setup processes, and business logic mapping.', commitSha: 'ae69e9bd' },
    ],
    bugFixes: [],
    improvements: [],
    breakingChanges: [],
  },
  '1.3.1': {
    version: '1.3.1',
    releaseDate: '2026-03-16',
    environment: 'production',
    features: [
      { id: 301, changeType: 'Feature', description: 'Created SQL script for Postgresql for restoring and back up of data from source database to current database', commitSha: 'manual' },
    ],
    bugFixes: [
      { id: 302, changeType: 'BugFix', description: 'Resolved a bug in monthly progress form that was preventing the Monthly progress report from being saved', commitSha: 'manual' },
    ],
    improvements: [],
    breakingChanges: [],
  },
  '1.3.0': {
    version: '1.3.0',
    releaseDate: '2026-03-04',
    environment: 'production',
    features: [
      { id: 200, changeType: 'Feature', description: 'Cash Flow Management: Introduced a full end-to-end Cash Flow module including backend API implementation, revenue calculation with progress deliverables, NPV and profitability analysis, and a dedicated frontend Cash Flow page with real-time dashboard data fetching.', commitSha: '29c45267' },
      { id: 201, changeType: 'Feature', description: 'Testing & Quality Assurance: Implemented a comprehensive regression testing suite covering frontend, backend (WBS, job, opportunity, etc.), and E2E scenarios. Added extensive unit and integration tests for Sprint, ProgramSprint, SprintDailyProgress, and SprintTask controllers.', commitSha: '1017856' },
      { id: 202, changeType: 'Feature', description: 'CI/CD & Automation: Set up automated release management hooks and new CI/CD workflows for frontend and backend testing on PRs to master.', commitSha: '0a07d82' },
      { id: 203, changeType: 'Feature', description: 'Database & Architecture: Added PostgreSQL integration (updated dev connection string), added baseline migration, and introduced initial database seed data for features.', commitSha: '96122ca' },
      { id: 204, changeType: 'Feature', description: 'API Enhancements: Added a new level 3 task API and implemented full feature retrieval upon admin login.', commitSha: '1f5b6d0' },
      { id: 205, changeType: 'Feature', description: 'Project Structure: Renamed application references from EDR to Kiro/dev and updated corresponding frontend dependencies.', commitSha: '733b01d' },
    ],
    bugFixes: [
      { id: 206, changeType: 'BugFix', description: 'Fixed a null reference error in the dashboard by adding optional chaining.', commitSha: 'df8f71c' },
      { id: 207, changeType: 'BugFix', description: 'Resolved a tenant creation issue and removed an unnecessary tenant ID filter.', commitSha: 'a50d385' },
      { id: 208, changeType: 'BugFix', description: 'Fixed various build errors and test case compatibility issues.', commitSha: 'd0652be' },
      { id: 209, changeType: 'BugFix', description: 'Cleaned up the codebase by removing unused folders (e.g., NJSEI) and duplicate files.', commitSha: '5429b29' },
    ],
    improvements: [],
    breakingChanges: [],
  },
  '1.2.0': {
    version: '1.2.0',
    releaseDate: '2026-02-16',
    environment: 'production',
    features: [
      { id: 101, changeType: 'Feature', description: 'Program Management: Comprehensive tools for managing programs, objectives, and key results.', commitSha: 'manual' },
      { id: 102, changeType: 'Feature', description: 'Sprint Management: New capabilities for sprint planning, tracking, and execution.', commitSha: 'manual' },
    ],
    bugFixes: [
      { id: 103, changeType: 'BugFix', description: 'Resolved issue with task assignment notifications impacting team workflow.', commitSha: 'manual' },
      { id: 104, changeType: 'BugFix', description: 'Fixed data synchronization lag in project dashboard metrics.', commitSha: 'manual' },
      { id: 105, changeType: 'BugFix', description: 'Corrected responsive layout glitches on mobile views for the reporting module.', commitSha: 'manual' },
      { id: 106, changeType: 'BugFix', description: 'Patched security vulnerability in user session handling.', commitSha: 'manual' },
    ],
    improvements: [],
    breakingChanges: [],
  },
  '1.1.0-dev.20260209': {
    version: '1.1.0-dev.20260209',
    releaseDate: '2026-02-09',
    environment: 'production',
    features: [
      { id: 11, changeType: 'Feature', description: 'adding a test feature to verify release notes', commitSha: '1b27f758' },
      { id: 12, changeType: 'Feature', description: 'add manual release workflow and updated generation script (release)', commitSha: 'caada31c' },
      { id: 13, changeType: 'Feature', description: 'test feature for release workflow', commitSha: 'c2155319' },
      { id: 14, changeType: 'Feature', description: 'Add query handlers for retrieving sprint plans, tasks, subtasks, and project schedules.', commitSha: '55ad7366' },
      { id: 15, changeType: 'Feature', description: 'Implement todolist and project schedule management, including issues, subtasks, and sprints.', commitSha: '74db09bc' },
      { id: 16, changeType: 'Feature', description: 'Add new database migration, appsettings.json, and CQRS handlers for sprint plan creation and updates.', commitSha: 'aa807996' },
    ],
    bugFixes: [
      { id: 21, changeType: 'BugFix', description: 'ensure release notes are committed back to repo (ci)', commitSha: 'f9f64a7c' },
      { id: 22, changeType: 'BugFix', description: 'remove unnecessary npm install step (ci)', commitSha: '7eb2e815' },
      { id: 23, changeType: 'BugFix', description: 'improve change control card layout to prevent icons from moving off screen with long descriptions', commitSha: '1ce76a67' },
      { id: 24, changeType: 'BugFix', description: 'resolve TypeScript errors in frontend', commitSha: '21e609ae' },
    ],
    improvements: [
      { id: 31, changeType: 'Improvement', description: 'auto-generated release notes for v1.1.0-dev.20260209 (release)', commitSha: '490591e0' },
      { id: 32, changeType: 'Improvement', description: 'enable release workflow on release-notes-testing branch', commitSha: 'fdd710f1' },
      { id: 33, changeType: 'Improvement', description: 'configure frontend steering files for manual loading only', commitSha: '1beb1bd0' },
      { id: 34, changeType: 'Improvement', description: 'Merge pull request #207 from makshintre/Kiro-automatic-deploy', commitSha: '74afea39' },
      { id: 35, changeType: 'Improvement', description: 'Automatic dev server and aws deployment hooks', commitSha: '27b6350f' },
      { id: 36, changeType: 'Improvement', description: 'Change branch trigger for release notes update', commitSha: '27ebcffc' },
      { id: 37, changeType: 'Improvement', description: 'resolved the frontend build errors in release notes.', commitSha: '32aba810' },
      { id: 38, changeType: 'Improvement', description: 'Fixed the edit button in the wbs Form', commitSha: '0a829bcd' },
      { id: 39, changeType: 'Improvement', description: 'Updated steering document with migration updation rule. Added release notes automatic trigger', commitSha: '6f725a15' },
      { id: 40, changeType: 'Improvement', description: 'Implemented release management yml automation scripts and Kiro hook for automated testing of branches before release', commitSha: '8cd53df7' },
    ],
    breakingChanges: [],
  },
  '1.0.38': {
    version: '1.0.38',
    releaseDate: '2025-12-25',
    environment: 'dev',
    features: [
      { id: 1, changeType: 'Feature', description: 'Interactive version display with clickable release notes popup' },
    ],
    bugFixes: [],
    improvements: [],
    breakingChanges: [],
  },
};

function getFallbackReleaseNotes(version: string): ProcessedReleaseNotes | null {
  const cleanVersion = version.startsWith('v') ? version.substring(1) : version;
  return FALLBACK_RELEASE_NOTES[cleanVersion] || null;
}

interface ReleaseNotesModalProps {
  version: string;
  isOpen: boolean;
  onClose: () => void;
}

const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = React.memo(({
  version,
  isOpen,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [releaseNotes, setReleaseNotes] = useState<ProcessedReleaseNotes | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState<boolean>(false);

  // State for release history sidebar
  const [history, setHistory] = useState<ProcessedReleaseNotes[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<string>(version || '');

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    let apiHistory: ProcessedReleaseNotes[] = [];
    try {
      apiHistory = await releaseNotesApi.getReleaseHistory(undefined, 0, 20) || [];
    } catch (err) {
      console.error('Failed to fetch release history:', err);
    } finally {
      // Merge fallback history with API fetched history to ensure local versions display
      const mergedHistory = [...apiHistory];

      Object.values(FALLBACK_RELEASE_NOTES).forEach(fallbackNote => {
        if (!mergedHistory.some(h => h.version === fallbackNote.version)) {
          mergedHistory.push(fallbackNote);
        }
      });

      mergedHistory.sort((a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );

      setHistory(mergedHistory);
      setLoadingHistory(false);
    }
  }, []);

  const fetchReleaseNotes = useCallback(async (ver: string) => {
    if (!ver) return;
    setLoading(true);
    setError(null);
    try {
      const notes = await releaseNotesApi.getReleaseNotes(ver);
      setReleaseNotes(notes);
    } catch (err) {
      const fallbackNotes = getFallbackReleaseNotes(ver);
      if (fallbackNotes) {
        setReleaseNotes(fallbackNotes);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load release notes');
        setShowErrorSnackbar(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      if (version) {
        setSelectedVersion(version);
      }
    }
  }, [isOpen, version, fetchHistory]);

  // Fetch specific notes when selected version changes
  useEffect(() => {
    if (isOpen && selectedVersion) {
      fetchReleaseNotes(selectedVersion);
    }
  }, [isOpen, selectedVersion, fetchReleaseNotes]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      const timeoutId = setTimeout(() => {
        setReleaseNotes(null);
        setError(null);
        setShowErrorSnackbar(false);
        setHistory([]);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);



  const handleClose = () => {
    if (!loading) onClose();
  };

  const handleVersionClick = (ver: string) => {
    setSelectedVersion(ver);
  };

  /**
   * Helper to get display version (stripping -dev suffix)
   */
  const getDisplayVersion = (ver: string) => {
    return ver.split('-')[0].replace('v', '');
  };

  /**
   * Renders the sidebar list of versions
   */
  const renderSidebar = () => {
    if (loadingHistory && history.length === 0) {
      return (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    return (
      <List component="nav" sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {history.map((item) => (
          <React.Fragment key={item.version}>
            <ListItemButton
              selected={selectedVersion === item.version || selectedVersion === `v${item.version}`}
              onClick={() => handleVersionClick(item.version)}
            >
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight="bold">
                    {getDisplayVersion(item.version)}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.releaseDate).toLocaleDateString()}
                  </Typography>
                }
              />
              {(selectedVersion === item.version || selectedVersion === `v${item.version}`) && (
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <FeatureIcon fontSize="small" color="primary" />
                </ListItemIcon>
              )}
            </ListItemButton>
            <Divider component="li" />
          </React.Fragment>
        ))}
        {history.length === 0 && !loadingHistory && (
          <ListItem>
            <ListItemText primary="No history available" />
          </ListItem>
        )}
      </List>
    );
  };

  // ... (keep helper functions like getChangeTypeIcon, getChangeTypeColor, etc. if needed, or assume they are unchanged above this block) 
  // Wait, I am replacing the whole component body, so I need to preserve the helper functions if they are inside. 
  // In the original file, they were inside the component. I should keep them.

  // Re-declaring helper functions inside the component as they were before
  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType?.toLowerCase()) {
      case 'feature': return <FeatureIcon color="primary" />;
      case 'bugfix': case 'bug': case 'fix': return <BugIcon color="error" />;
      case 'improvement': case 'enhancement': return <ImprovementIcon color="success" />;
      case 'breaking': case 'breakingchange': return <BreakingIcon color="warning" />;
      default: return <ImprovementIcon color="success" />;
    }
  };


  const renderChangeItems = (items: ChangeItem[], title: string, icon: React.ReactNode) => {
    if (!items || items.length === 0) return null;
    return (
      <Accordion defaultExpanded sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Typography variant="h6">{title} ({items.length})</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {items.map((item, index) => (
              <ListItem key={item.id || index} sx={{ pl: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>{getChangeTypeIcon(item.changeType)}</ListItemIcon>
                <ListItemText
                  primary={item.description}
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      {item.author && <Chip icon={<AuthorIcon />} label={item.author} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />}
                      {item.commitSha && <Chip icon={<CommitIcon />} label={item.commitSha.substring(0, 7)} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />}
                      {item.impact && <Chip label={`Impact: ${item.impact}`} size="small" variant="outlined" color={item.impact === 'High' ? 'error' : item.impact === 'Medium' ? 'warning' : 'info'} sx={{ mr: 0.5, mb: 0.5 }} />}
                      {item.jiraTicket && <Chip label={item.jiraTicket} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    );
  };



  const renderContent = () => {
    if (loading) return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
        <CircularProgress data-testid="content-loading" />
        <Typography sx={{ mt: 2 }}>Loading release notes...</Typography>
      </Box>
    );
    if (error) return (
      <Box sx={{ py: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => fetchReleaseNotes(selectedVersion)}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
    if (!releaseNotes) return <Typography>Select a version</Typography>;

    const hasChanges =
      (releaseNotes.features?.length || 0) > 0 ||
      (releaseNotes.bugFixes?.length || 0) > 0 ||
      (releaseNotes.improvements?.length || 0) > 0 ||
      (releaseNotes.breakingChanges?.length || 0) > 0;

    return (
      <Box sx={{ py: 1 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" color="primary" gutterBottom>v{getDisplayVersion(releaseNotes.version)}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DateIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Released: {new Date(releaseNotes.releaseDate).toLocaleDateString()}
              </Typography>
            </Box>
            {releaseNotes.environment && <Chip label={`Env: ${releaseNotes.environment}`} size="small" variant="outlined" />}
            {releaseNotes.branch && <Chip label={`Branch: ${releaseNotes.branch}`} size="small" variant="outlined" />}
          </Box>
        </Box>
        {!hasChanges ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" fontWeight="bold">No changes documented</Typography>
            <Typography color="text.secondary">This version doesn't have any documented changes.</Typography>
          </Box>
        ) : (
          <>
            {renderChangeItems(releaseNotes.features, 'New Features', <FeatureIcon />)}
            {renderChangeItems(releaseNotes.bugFixes, 'Bug Fixes', <BugIcon />)}
            {renderChangeItems(releaseNotes.improvements, 'Improvements', <ImprovementIcon />)}
            {renderChangeItems(releaseNotes.breakingChanges, 'Breaking Changes', <BreakingIcon />)}
          </>
        )}
      </Box>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      aria-labelledby="release-notes-dialog-title"
      aria-describedby="release-notes-dialog-content"
      PaperProps={{
        sx: { height: '80vh' },
        'data-testid': 'release-notes-dialog'
      } as any}
    >
      <DialogTitle id="release-notes-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Release Notes</Typography>
        <IconButton onClick={handleClose} aria-label="close" disabled={loading}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent id="release-notes-dialog-content" dividers sx={{ display: 'flex', p: 0 }}>
        {!isMobile && (
          <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
            {renderSidebar()}
          </Box>
        )}
        <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
          {renderContent()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Close</Button>
      </DialogActions>
      <Snackbar open={showErrorSnackbar} autoHideDuration={6000} onClose={() => setShowErrorSnackbar(false)}>
        <Alert severity="error" onClose={() => setShowErrorSnackbar(false)}>Failed to load release notes</Alert>
      </Snackbar>
    </Dialog>
  );
});

export default ReleaseNotesModal;