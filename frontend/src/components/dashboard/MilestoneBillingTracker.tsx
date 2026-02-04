import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { MilestoneData } from '../../data/types/dashboard';
import { MILESTONE_STATUS_COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import ActionButton from '../shared/ActionButton';

interface MilestoneBillingTrackerProps {
  milestones: MilestoneData[];
  onSendNotice: (id: number) => void;
  onFollowUp: (id: number) => void;
}

const MilestoneBillingTracker: React.FC<MilestoneBillingTrackerProps> = ({
  milestones,
  onSendNotice,
  onFollowUp
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card>
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Typography
          variant="h6"
          fontWeight="semibold"
          sx={{
            mb: isMobile ? 2 : 3,
            fontSize: isMobile ? '1.1rem' : '1.25rem',
            lineHeight: isMobile ? 1.3 : 1.2
          }}
        >
          Milestone & Billing Tracker
        </Typography>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'medium', color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 'medium', color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>Milestone</TableCell>
                <TableCell sx={{ fontWeight: 'medium', color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>Expected Amount</TableCell>
                <TableCell sx={{ fontWeight: 'medium', color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'medium', color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>Days Delayed</TableCell>
                <TableCell sx={{ fontWeight: 'medium', color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>Penalty</TableCell>
                <TableCell sx={{ fontWeight: 'medium', color: 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {milestones.map((milestone) => {
                const statusStyle = MILESTONE_STATUS_COLORS[milestone.status] || {
                  backgroundColor: '#f5f5f5',
                  color: '#616161'
                };
                return (
                  <TableRow key={milestone.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}>{milestone.project}</TableCell>
                    <TableCell sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}>{milestone.milestone}</TableCell>
                    <TableCell sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>{formatCurrency(milestone.expectedAmount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={milestone.status}
                        size="small"
                        sx={{
                          backgroundColor: statusStyle.backgroundColor,
                          color: statusStyle.color,
                          fontWeight: 'medium',
                          fontSize: isMobile ? '0.65rem' : '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: milestone.daysDelayed > 0 ? theme.palette.error.main : 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
                      {milestone.daysDelayed > 0 ? `${milestone.daysDelayed} days` : '-'}
                    </TableCell>
                    <TableCell sx={{ color: milestone.penalty > 0 ? theme.palette.error.main : 'text.secondary', fontSize: isMobile ? '0.7rem' : '0.875rem' }}>
                      {milestone.penalty > 0 ? formatCurrency(milestone.penalty) : '-'}
                    </TableCell>
                    <TableCell>
                      {milestone.status === 'Overdue' && (
                        <ActionButton
                          variant="outline"
                          size="small"
                          onClick={() => onSendNotice(milestone.id)}
                          sx={{ fontSize: isMobile ? '0.7rem' : '0.8125rem', py: isMobile ? 0.25 : 0.5 }}
                        >
                          Send Notice
                        </ActionButton>
                      )}
                      {milestone.status === 'At Risk' && (
                        <ActionButton
                          variant="outline"
                          size="small"
                          onClick={() => onFollowUp(milestone.id)}
                          sx={{ fontSize: isMobile ? '0.7rem' : '0.8125rem', py: isMobile ? 0.25 : 0.5 }}
                        >
                          Follow Up
                        </ActionButton>
                      )}
                      {milestone.status === 'On Track' && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ fontSize: isMobile ? '0.7rem' : '0.8125rem' }}
                        >
                          No Action
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default MilestoneBillingTracker;
