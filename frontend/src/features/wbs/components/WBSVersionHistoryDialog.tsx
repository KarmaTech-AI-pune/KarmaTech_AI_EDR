import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  CircularProgress
} from '@mui/material';
import { WBSVersion } from '../types/wbs';

interface WBSVersionHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  versions: WBSVersion[];
  loading: boolean;
  onActivateVersion?: (version: string) => void;
  onSelectVersion?: (version: string) => void;
}

const WBSVersionHistoryDialog: React.FC<WBSVersionHistoryDialogProps> = ({
  open,
  onClose,
  versions,
  loading,
  onActivateVersion,
  onSelectVersion
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Review Changes':
      case 'Approval Changes':
        return 'error';
      case 'Sent for Review':
      case 'Sent for Approval':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Find the latest approved version string
  const latestApprovedVersion = useMemo(() => {
    const approvedVersions = versions
      .filter(v => v.status === 'Approved')
      .sort((a, b) => {
        // Simple version comparison for strings like "1.0", "2.1", etc.
        const vA = a.version.split('.').map(Number);
        const vB = b.version.split('.').map(Number);
        for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
          const numA = vA[i] || 0;
          const numB = vB[i] || 0;
          if (numA !== numB) return numB - numA; // Sort descending
        }
        return 0;
      });
    return approvedVersions.length > 0 ? approvedVersions[0].version : null;
  }, [versions]);


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="version-history-title"
    >
      <DialogTitle id="version-history-title">
        WBS Version History
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : versions.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center' }}>
            No version history found.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table aria-label="wbs version history table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Version</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Created By</strong></TableCell>
                  <TableCell><strong>Created At</strong></TableCell>
                  <TableCell><strong>Comments</strong></TableCell>
                  {(onActivateVersion || onSelectVersion) && <TableCell align="center"><strong>Actions</strong></TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {versions
                  .filter(v => v.isLatest || v.status === 'Approved')
                  .map((version) => {
                  return (
                    <TableRow 
                      key={version.id}
                      sx={{ 
                        backgroundColor: version.isActive ? '#e3f2fd' : 'inherit',
                        '&:hover': { backgroundColor: '#f8f8f8' }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {version.version}
                          {version.isActive && (
                            <Chip label="Active" size="small" color="primary" variant="outlined" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={version.status} 
                          size="small" 
                          color={getStatusColor(version.status) as any}
                          variant="filled"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>{version.createdBy}</TableCell>
                      <TableCell>
                        {new Date(version.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{version.comments || '-'}</TableCell>
                      {(onActivateVersion || onSelectVersion) && (
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            {version.isActive ? (
                              onSelectVersion && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => onSelectVersion(version.version)}
                                >
                                  View
                                </Button>
                              )
                            ) : (version.isLatest || version.status === 'Approved') ? (
                              onActivateVersion && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => onActivateVersion(version.version)}
                                >
                                  Activate
                                </Button>
                              )
                            ) : null}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WBSVersionHistoryDialog;
