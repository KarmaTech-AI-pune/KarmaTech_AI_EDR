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
  // Returns the button label if the user can act on this version, or null if they cannot
  getActionLabel: (status: GoNoGoVersionStatus) => string | null;
  score: number;
}



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
  getActionLabel
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
                  <br />
                  Score: {(() => {
                    try {
                      const fd = typeof version.formData === 'string' ? JSON.parse(version.formData) : version.formData;
                      return fd?.Summary?.TotalScore ?? 0;
                    } catch { return 0; }
                  })()}
                </>
              }
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={version.versionNumber}
                color={getStatusColor(version.status)}
                size="small"
              />
              {(() => {
                const label = getActionLabel(version.status);
                return label ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(version);
                    }}
                  >
                    {label}
                  </Button>
                ) : null;
              })()}
            </Box>
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

export default GoNoGoVersionHistory;
