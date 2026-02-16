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
} from '@mui/icons-material';
import { releaseNotesApi, ProcessedReleaseNotes, ChangeItem } from '../services/releaseNotesApi';

const FALLBACK_RELEASE_NOTES: Record<string, ProcessedReleaseNotes> = {
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
  const [history, setHistory] = useState<ProcessedReleaseNotes[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<string>(version || '');
  const [showErrorSnackbar, setShowErrorSnackbar] = useState<boolean>(false);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const historyData = await releaseNotesApi.getReleaseHistory(undefined, 0, 20);
      setHistory(historyData || []);
    } catch (err) {
      console.error('Failed to fetch release history:', err);
    } finally {
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
        // Direct call to fetch release notes to avoid multiple effect triggers
        fetchReleaseNotes(version);
      }
    }
  }, [isOpen, version, fetchHistory, fetchReleaseNotes]);

  // Handle version selection changes manually or via sidebar
  const handleVersionClick = (ver: string) => {
    setSelectedVersion(ver);
    fetchReleaseNotes(ver);
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

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

  const renderSidebar = () => {
    return (
      <List component="nav">
        {(history || []).map((item) => (
          <ListItem
            key={item.version}
            disablePadding
          >
            <ListItemButton
              selected={selectedVersion === item.version || selectedVersion === `v${item.version}`}
              onClick={() => handleVersionClick(item.version)}
            >
              <ListItemText
                primary={item.version}
                secondary={new Date(item.releaseDate).toLocaleDateString()}
              />
            </ListItemButton>
          </ListItem>
        ))}
        {history.length === 0 && !loadingHistory && (
          <ListItem><ListItemText primary="No history available" /></ListItem>
        )}
      </List>
    );
  };

  const renderContent = () => {
    if (loading) return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
        <CircularProgress />
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
      <Box>
        <Typography variant="h4" gutterBottom>v{releaseNotes.version}</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Released: {new Date(releaseNotes.releaseDate).toLocaleDateString()}
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        {!hasChanges ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>No changes documented</Typography>
            <Typography variant="body1" color="text.secondary">
              This version doesn't have any documented changes.
            </Typography>
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