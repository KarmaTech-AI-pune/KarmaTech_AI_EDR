/**
 * BudgetChangeTimeline Component
 * 
 * Visual timeline display for budget change history.
 * Features:
 * - Material-UI Timeline component for visual history
 * - Different visual indicators for cost vs fee changes
 * - Variance display with color coding for increases/decreases
 * - Shows change reasons when provided
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { ProjectBudgetChangeHistory } from '../../types/projectBudget';
import { VarianceIndicator } from './VarianceIndicator';
import { format, parseISO } from 'date-fns';

interface BudgetChangeTimelineProps {
  changes: ProjectBudgetChangeHistory[];
}

export const BudgetChangeTimeline: React.FC<BudgetChangeTimelineProps> = ({ changes }) => {
  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Format currency value
  const formatCurrency = (value: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Get field display name
  const getFieldDisplayName = (fieldName: string): string => {
    return fieldName === 'EstimatedProjectCost' ? 'Project Cost' : 'Project Fee';
  };

  // Get field color
  const getFieldColor = (fieldName: string): 'primary' | 'secondary' => {
    return fieldName === 'EstimatedProjectCost' ? 'primary' : 'secondary';
  };

  // Get field icon
  const getFieldIcon = (fieldName: string) => {
    return fieldName === 'EstimatedProjectCost' ? (
      <AttachMoneyIcon />
    ) : (
      <AccountBalanceWalletIcon />
    );
  };

  if (changes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No budget changes to display
        </Typography>
      </Box>
    );
  }

  return (
    <Timeline position="alternate">
      {changes.map((change, index) => (
        <TimelineItem key={change.id}>
          {/* Left side - Date and User info */}
          <TimelineOppositeContent
            sx={{ m: 'auto 0' }}
          >
            <Typography variant="body2" fontWeight="bold">
              {formatDate(change.changedDate)}
            </Typography>
            <Typography variant="caption" display="block">
              by {change.changedByUser.firstName} {change.changedByUser.lastName}
            </Typography>
            <Typography variant="caption" display="block" color="text.disabled">
              {change.changedByUser.email}
            </Typography>
          </TimelineOppositeContent>

          {/* Center - Timeline dot and connector */}
          <TimelineSeparator>
            <TimelineDot color={getFieldColor(change.fieldName)} variant="outlined">
              {getFieldIcon(change.fieldName)}
            </TimelineDot>
            {index < changes.length - 1 && <TimelineConnector />}
          </TimelineSeparator>

          {/* Right side - Change details */}
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                backgroundColor: index % 2 === 0 ? 'background.paper' : 'grey.50',
              }}
            >
              {/* Field name chip */}
              <Box sx={{ mb: 1 }}>
                <Chip
                  label={getFieldDisplayName(change.fieldName)}
                  color={getFieldColor(change.fieldName)}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              {/* Value change display */}
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Value Change:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={formatCurrency(change.oldValue, change.currency)}
                    size="small"
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    →
                  </Typography>
                  <Chip
                    label={formatCurrency(change.newValue, change.currency)}
                    size="small"
                    variant="outlined"
                    color={getFieldColor(change.fieldName)}
                  />
                </Box>
              </Box>

              {/* Variance indicator */}
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Variance:
                </Typography>
                <VarianceIndicator
                  variance={change.variance}
                  percentageVariance={change.percentageVariance}
                  currency={change.currency}
                  size="medium"
                />
              </Box>

              {/* Reason (if provided) */}
              {change.reason && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Reason:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontStyle: 'italic',
                        backgroundColor: 'action.hover',
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      "{change.reason}"
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default BudgetChangeTimeline;
