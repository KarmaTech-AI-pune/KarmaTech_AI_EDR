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
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.2, 5.4
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
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { releaseNotesApi, ProcessedReleaseNotes, ChangeItem } from '../services/releaseNotesApi';

/**
 * Hardcoded release notes for when API is unavailable
 * This ensures users always see something meaningful
 */
const FALLBACK_RELEASE_NOTES: Record<string, ProcessedReleaseNotes> = {
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
      { id: 2, changeType: 'Feature', description: 'Automatic versioning system based on conventional commits' },
      { id: 3, changeType: 'Feature', description: 'Release notes generation from commit messages' },
      { id: 4, changeType: 'Feature', description: 'Project Budget change tracking with audit history' },
      { id: 5, changeType: 'Feature', description: 'Go/No-Go decision score cap functionality' },
    ],
    bugFixes: [
      { id: 6, changeType: 'BugFix', description: 'Fixed version synchronization across all application components' },
      { id: 7, changeType: 'BugFix', description: 'Fixed build-time version injection for consistent version display' },
    ],
    improvements: [
      { id: 8, changeType: 'Improvement', description: 'Enhanced GitHub Actions workflow with conventional commit parsing' },
      { id: 9, changeType: 'Improvement', description: 'Replaced hardcoded version with dynamic version injection' },
      { id: 10, changeType: 'Improvement', description: 'Updated build process to include version information' },
    ],
    breakingChanges: [],
  },
};

/**
 * Gets fallback release notes for a version when API is unavailable
 * Provides meaningful content to users even when backend is down
 * @param version - Version string to get fallback notes for
 * @returns ProcessedReleaseNotes object or null if no fallback available
 */
function getFallbackReleaseNotes(version: string): ProcessedReleaseNotes | null {
  const cleanVersion = version.startsWith('v') ? version.substring(1) : version;
  return FALLBACK_RELEASE_NOTES[cleanVersion] || null;
}

/**
 * Props interface for the ReleaseNotesModal component
 */
interface ReleaseNotesModalProps {
  /** 
   * Version to display release notes for (e.g., "1.0.38" or "v1.0.38")
   * The component will clean the version string automatically
   */
  version: string;

  /** 
   * Whether the modal dialog is currently open
   */
  isOpen: boolean;

  /** 
   * Callback function called when modal should be closed
   * Triggered by close button, escape key, or clicking outside modal
   */
  onClose: () => void;
}

/**
 * ReleaseNotesModal Component
 * 
 * A comprehensive modal dialog for displaying version-specific release notes with:
 * - Material-UI Dialog layout with responsive design (mobile/desktop)
 * - Organized content sections (Features, Bug Fixes, Improvements, Breaking Changes)
 * - Loading states with skeleton loaders and progress indicators
 * - Error handling with retry functionality and fallback content
 * - Accessibility support (keyboard navigation, ARIA labels, screen readers)
 * - Caching integration for performance optimization
 * - Fallback release notes when API is unavailable
 * 
 * @example
 * ```tsx
 * const [isModalOpen, setIsModalOpen] = useState(false);
 * const [currentVersion, setCurrentVersion] = useState('1.0.38');
 * 
 * <ReleaseNotesModal
 *   version={currentVersion}
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 * />
 * ```
 * 
 * @component
 * @since 1.0.38
 * @author Interactive Version Display Feature Team
 * 
 * Requirements Coverage:
 * - 3.1: Modal dialog with version number in header
 * - 3.2: Organized sections for different change types
 * - 3.3: Brief descriptions with commit references
 * - 3.4: Close functionality and loading states
 * - 3.5: Responsive design for mobile and desktop
 * - 5.2: Performance optimization with lazy loading
 * - 5.4: Comprehensive error handling with retry
 */
const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = React.memo(({
  version,
  isOpen,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for the currently displayed release notes
  const [releaseNotes, setReleaseNotes] = useState<ProcessedReleaseNotes | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState<boolean>(false);

  // State for release history sidebar
  const [history, setHistory] = useState<ProcessedReleaseNotes[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<string>(version || '');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  /**
   * Fetches the release history list
   */
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      // Fetch history (last 20 versions should be enough for the list)
      const historyData = await releaseNotesApi.getReleaseHistory(undefined, 0, 20);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to fetch release history:', err);
      // Fallback to static history if API fails
      const fallbackHistory = Object.values(FALLBACK_RELEASE_NOTES).sort((a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
      setHistory(fallbackHistory);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  /**
   * Fetches release notes for a specific version
   */
  const fetchReleaseNotes = useCallback(async (ver: string) => {
    if (!ver) return;

    setLoading(true);
    setError(null);

    // Check if we already have the data in our history list to avoid an API call
    const cachedInHistory = history.find(n => n.version === ver || n.version === ver.replace('v', ''));
    if (cachedInHistory) {
      setReleaseNotes(cachedInHistory);
      setLoading(false);
      return;
    }

    try {
      const notes = await releaseNotesApi.getReleaseNotes(ver);
      setReleaseNotes(notes);
    } catch (err) {
      // Try fallback release notes first
      const fallbackNotes = getFallbackReleaseNotes(ver);
      if (fallbackNotes) {
        console.log(`Using fallback release notes for version ${ver}`);
        setReleaseNotes(fallbackNotes);
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load release notes';
        setError(errorMessage);
        setShowErrorSnackbar(true);
      }
    } finally {
      setLoading(false);
    }
  }, [history]);

  // Initial fetch when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      // If version is provided, start with that
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

  const handleRetry = useCallback(() => {
    // Retry both
    fetchHistory();
    if (selectedVersion) {
      fetchReleaseNotes(selectedVersion);
    }
  }, [fetchHistory, fetchReleaseNotes, selectedVersion]);

  const handleClose = () => {
    if (!loading) onClose();
  };

  const handleVersionClick = (ver: string) => {
    setSelectedVersion(ver);
    if (isMobile) setMobileDrawerOpen(false);
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
    switch (changeType.toLowerCase()) {
      case 'feature': return <FeatureIcon color="primary" />;
      case 'bugfix': case 'bug': case 'fix': return <BugIcon color="error" />;
      case 'improvement': case 'enhancement': return <ImprovementIcon color="success" />;
      case 'breaking': case 'breakingchange': return <BreakingIcon color="warning" />;
      default: return <ImprovementIcon color="success" />;
    }
  };

  const getChangeTypeColor = (changeType: string): 'primary' | 'error' | 'success' | 'warning' | 'default' => {
    switch (changeType.toLowerCase()) {
      case 'feature': return 'primary';
      case 'bugfix': case 'bug': case 'fix': return 'error';
      case 'improvement': case 'enhancement': return 'success';
      case 'breaking': case 'breakingchange': return 'warning';
      default: return 'default';
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
                      {item.jiraTicket && <Chip label={item.jiraTicket} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />}
                      {item.impact && <Chip label={`Impact: ${item.impact}`} size="small" color={getChangeTypeColor(item.impact)} sx={{ mr: 0.5, mb: 0.5 }} />}
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
    if (loading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 2 }}>
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary">Loading release notes for {selectedVersion}...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ py: 2 }}>
          <Alert severity="error" icon={<ErrorIcon />} action={<Button color="inherit" size="small" onClick={() => fetchReleaseNotes(selectedVersion)} startIcon={<RefreshIcon />}>Retry</Button>}>
            <Typography variant="body2"><strong>{error}</strong></Typography>
          </Alert>
        </Box>
      );
    }

    if (!releaseNotes) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">Select a version to view details</Typography>
        </Box>
      );
    }

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

        <Divider sx={{ mb: 2 }} />

        {renderChangeItems(releaseNotes.features, 'New Features', <FeatureIcon color="primary" />)}
        {renderChangeItems(releaseNotes.improvements, 'Improvements', <ImprovementIcon color="success" />)}
        {renderChangeItems(releaseNotes.bugFixes, 'Bug Fixes', <BugIcon color="error" />)}
        {renderChangeItems(releaseNotes.breakingChanges, 'Breaking Changes', <BreakingIcon color="warning" />)}
      </Box>
    );
  };

  /**
   * Handles escape key press
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  /**
   * Handles error snackbar close
   */
  const handleCloseErrorSnackbar = () => {
    setShowErrorSnackbar(false);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        onKeyDown={handleKeyDown}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
        PaperProps={{
          sx: { height: isMobile ? '100vh' : '80vh', display: 'flex', flexDirection: 'column' }
        }}
      >
        {/* Header */}
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={() => setMobileDrawerOpen(prev => !prev)} sx={{ mr: 1 }}>
                <RefreshIcon sx={{ transform: 'rotate(90deg)' }} />
                <Typography variant="button">History</Typography>
              </IconButton>
            )}
            <Typography variant="h6">Release Notes</Typography>
          </Box>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Body with Sidebars */}
        <DialogContent sx={{ p: 0, display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Sidebar (Desktop) */}
          {!isMobile && (
            <Box sx={{ width: 280, borderRight: 1, borderColor: 'divider', overflowY: 'auto', bgcolor: 'grey.50' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary">VERSION HISTORY</Typography>
              </Box>
              {renderSidebar()}
            </Box>
          )}

          {/* Main Content */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
            {renderContent()}
          </Box>

        </DialogContent>
        {/* Drawer for Mobile History */}
        {isMobile && mobileDrawerOpen && (
          <Box sx={{
            position: 'absolute', top: 60, left: 0, bottom: 0, width: '80%', zIndex: 10,
            bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', boxShadow: 3
          }}>
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="small" onClick={() => setMobileDrawerOpen(false)}>Close Menu</Button>
            </Box>
            {renderSidebar()}
          </Box>
        )}
      </Dialog>

      {/* Error notification snackbar */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={8000}
        onClose={handleCloseErrorSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseErrorSnackbar}
          severity="error"
          sx={{ width: '100%' }}
          action={
            error ? (
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  handleCloseErrorSnackbar();
                  handleRetry();
                }}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            ) : undefined
          }
        >
          Release Notes: {error || 'Unknown error'}
        </Alert>
      </Snackbar>
    </>
  );
});

export default ReleaseNotesModal;