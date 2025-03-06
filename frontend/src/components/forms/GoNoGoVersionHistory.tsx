import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItemText,
  Button,
  Chip,
  Box,
  ListItemButton
} from '@mui/material';
import { GoNoGoVersionDto } from '../../models/goNoGoVersionModel';
import { GoNoGoVersionStatus } from '../../models/workflowModel';

interface Props {
  versions: GoNoGoVersionDto[];
  currentVersion: number;
  onVersionSelect: (version: GoNoGoVersionDto) => void;
  onApprove: (version: GoNoGoVersionDto) => void;
  userRole: string;
  score: number;
}

const canUserApprove = (status: GoNoGoVersionStatus, userRole: string): boolean => {
  switch (status) {
    case GoNoGoVersionStatus.BDM_PENDING:
      return userRole === 'Business Development Manager';
    case GoNoGoVersionStatus.RM_PENDING:
      return userRole === 'Regional Manager';
    default:
      return false;
  }
};

const getStatusColor = (status: GoNoGoVersionStatus): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
  switch (status) {
    case GoNoGoVersionStatus.BDM_APPROVED:
    case GoNoGoVersionStatus.RM_APPROVED:
    case GoNoGoVersionStatus.RD_APPROVED:
    case GoNoGoVersionStatus.COMPLETED:
      return 'success';
    case GoNoGoVersionStatus.BDM_PENDING:
    case GoNoGoVersionStatus.RM_PENDING:
    case GoNoGoVersionStatus.RD_PENDING:
      return 'warning';
    default:
      return 'default';
  }
};

const GoNoGoVersionHistory: React.FC<Props> = ({
  versions,
  currentVersion,
  onVersionSelect,
  onApprove,
  userRole
}) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Version History
      </Typography>
      <List>
        {versions.map((version) => (
          <ListItemButton
            key={version.id}
            selected={currentVersion === version.versionNumber}
            onClick={() => onVersionSelect(version)}
          >
            <ListItemText
              primary={`Version ${version.versionNumber}`}
              secondary={
                <>
                  Created by {version.createdBy} on {new Date(version.createdAt).toLocaleString('en-IN')}

                  <br /> Score: {JSON.parse(version.formData).Summary.TotalScore}
                </>
              }
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={version.versionNumber}
                color={getStatusColor(version.status)}
                size="small"
              />
              {canUserApprove(version.status, userRole) && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(version);
                  }}
                >
                  Sent to Approve
                </Button>
              )}
            </Box>
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

export default GoNoGoVersionHistory;
