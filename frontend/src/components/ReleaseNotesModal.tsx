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
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.2, 5.4
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

interface ReleaseNotesModalProps {
  /** Version to display release notes for */
  version: string;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
}

/**
 * ReleaseNotesModal component for displaying version-specific release notes
 */
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
  const [retryCount, setRetryCount] = useState<number>(0);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState<boolean>(false);

  // Fetch release notes when modal opens
  const fetchReleaseNotes = useCallback(async () => {
    if (!version || !isOpen) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const notes = await releaseNotesApi.getReleaseNotes(version);
      setReleaseNotes(notes);
      setRetryCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load release notes';
      setError(errorMessage);
      setShowErrorSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [version, isOpen]);

  // Fetch release notes when modal opens or version changes
  useEffect(() => {
    if (isOpen && version) {
      fetchReleaseNotes();
    }
  }, [isOpen, version, fetchReleaseNotes]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timeoutId = setTimeout(() => {
        setReleaseNotes(null);
        setError(null);
        setRetryCount(0);
        setShowErrorSnackbar(false);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  /**
   * Handles retry button click
   */
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchReleaseNotes();
  }, [fetchReleaseNotes]);

  /**
   * Handles modal close
   */
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
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

  /**
   * Gets the appropriate icon for a change type
   */
  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType.toLowerCase()) {
      case 'feature':
        return <FeatureIcon color="primary" />;
      case 'bugfix':
      case 'bug':
      case 'fix':
        return <BugIcon color="error" />;
      case 'improvement':
      case 'enhancement':
        return <ImprovementIcon color="success" />;
      case 'breaking':
      case 'breakingchange':
        return <BreakingIcon color="warning" />;
      default:
        return <ImprovementIcon color="success" />;
    }
  };

  /**
   * Gets the appropriate color for a change type chip
   */
  const getChangeTypeColor = (changeType: string): 'primary' | 'error' | 'success' | 'warning' | 'default' => {
    switch (changeType.toLowerCase()) {
      case 'feature':
        return 'primary';
      case 'bugfix':
      case 'bug':
      case 'fix':
        return 'error';
      case 'improvement':
      case 'enhancement':
        return 'success';
      case 'breaking':
      case 'breakingchange':
        return 'warning';
      default:
        return 'default';
    }
  };

  /**
   * Renders a list of change items
   */
  const renderChangeItems = (items: ChangeItem[], title: string, icon: React.ReactNode) => {
    if (items.length === 0) {
      return null;
    }

    return (
      <Accordion defaultExpanded sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Typography variant="h6">
              {title} ({items.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {items.map((item, index) => (
              <ListItem key={item.id || index} sx={{ pl: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getChangeTypeIcon(item.changeType)}
                </ListItemIcon>
                <ListItemText
                  primary={item.description}
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      {item.author && (
                        <Chip
                          icon={<AuthorIcon />}
                          label={item.author}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      {item.commitSha && (
                        <Chip
                          icon={<CommitIcon />}
                          label={item.commitSha.substring(0, 7)}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      {item.jiraTicket && (
                        <Chip
                          label={item.jiraTicket}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      {item.impact && (
                        <Chip
                          label={`Impact: ${item.impact}`}
                          size="small"
                          color={getChangeTypeColor(item.impact)}
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
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

  /**
   * Renders the modal content based on current state
   */
  const renderContent = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            gap: 2,
          }}
        >
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary">
            Loading release notes...
          </Typography>
          {retryCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              Retry attempt: {retryCount}
            </Typography>
          )}
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ py: 2 }}>
          <Alert 
            severity="error"
            icon={<ErrorIcon />}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRetry}
                startIcon={<RefreshIcon />}
                disabled={loading}
              >
                Retry
              </Button>
            }
          >
            <Typography variant="body2" component="div">
              <strong>{error}</strong>
            </Typography>
            {retryCount > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Retry attempt: {retryCount}
              </Typography>
            )}
          </Alert>
        </Box>
      );
    }

    if (!releaseNotes) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No release notes available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Release notes for version {version} could not be found.
          </Typography>
        </Box>
      );
    }

    const hasAnyChanges = 
      releaseNotes.features.length > 0 ||
      releaseNotes.bugFixes.length > 0 ||
      releaseNotes.improvements.length > 0 ||
      releaseNotes.breakingChanges.length > 0;

    if (!hasAnyChanges) {
      return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No changes documented
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This version doesn't have any documented changes.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 1 }}>
        {/* Release Info */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <DateIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Released: {new Date(releaseNotes.releaseDate).toLocaleDateString()}
            </Typography>
          </Box>
          {releaseNotes.environment && (
            <Chip
              label={`Environment: ${releaseNotes.environment}`}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
          )}
          {releaseNotes.branch && (
            <Chip
              label={`Branch: ${releaseNotes.branch}`}
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            />
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Change Sections */}
        {renderChangeItems(
          releaseNotes.features,
          'New Features',
          <FeatureIcon color="primary" />
        )}
        
        {renderChangeItems(
          releaseNotes.improvements,
          'Improvements',
          <ImprovementIcon color="success" />
        )}
        
        {renderChangeItems(
          releaseNotes.bugFixes,
          'Bug Fixes',
          <BugIcon color="error" />
        )}
        
        {renderChangeItems(
          releaseNotes.breakingChanges,
          'Breaking Changes',
          <BreakingIcon color="warning" />
        )}
      </Box>
    );
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        onKeyDown={handleKeyDown}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
        aria-labelledby="release-notes-dialog-title"
        aria-describedby="release-notes-dialog-content"
        PaperProps={{
          sx: {
            minHeight: isMobile ? '100vh' : 400,
            maxHeight: isMobile ? '100vh' : '90vh',
          },
        }}
      >
        <DialogTitle
          id="release-notes-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box>
              <Typography variant="h5" component="span">
                Release Notes
              </Typography>
              <Typography variant="h6" color="primary" sx={{ ml: 1 }}>
                v{version}
              </Typography>
            </Box>
            
            {error && (
              <Chip
                icon={<ErrorIcon />}
                label="Error"
                size="small"
                color="error"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          
          <IconButton
            aria-label="close"
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          id="release-notes-dialog-content"
          dividers
          sx={{
            px: isMobile ? 2 : 3,
            py: 0,
          }}
        >
          {renderContent()}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          {error && (
            <Button
              onClick={handleRetry}
              disabled={loading}
              startIcon={<RefreshIcon />}
              variant="outlined"
              color="primary"
              sx={{ mr: 1 }}
            >
              Retry
            </Button>
          )}
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
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