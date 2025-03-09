import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Container,
  Chip,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import { getBidVersionHistory, BidVersionHistory as BidVersionHistoryType, BidPreparationStatus } from '../../dummyapi/bidVersionHistoryApi';

interface BidVersionHistoryProps {
  opportunityId: number | undefined;
}

const BidVersionHistory: React.FC<BidVersionHistoryProps> = ({ opportunityId }) => {
  const [versionHistory, setVersionHistory] = useState<BidVersionHistoryType[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    debugger;
    loadVersionHistory();
  }, [opportunityId]);


  const loadVersionHistory = useCallback(async () => {
    try {
      const history = await getBidVersionHistory(opportunityId);
      setVersionHistory(history);
      setError('');
    } catch (err) {
      setError('Failed to load version history');
    }
  }, [opportunityId]);

  const loadVersionHistory1 = async () => {
    try {
      const history = await getBidVersionHistory(opportunityId);
      setVersionHistory(history);
      setError('');
    } catch (err) {
      setError('Failed to load version history');
    }
  };
  
  const getStatusLabel = (status:any) => {
    switch (status) {
      case BidPreparationStatus.Approved:
        return 'Approved';
      case BidPreparationStatus.Rejected:
        return 'Rejected';
      case BidPreparationStatus.PendingApproval:
        return 'Pending Approval';
      case BidPreparationStatus.Draft:
      default:
        return 'Draft';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Version History
      </Typography>
      <Paper sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Version</TableCell>
              <TableCell>Modified By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Modified Date</TableCell>
              <TableCell>Comments</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {versionHistory.map((version) => (
              <TableRow key={version.id}>
                <TableCell>{version.version}</TableCell>
                <TableCell>{version.modifiedBy}</TableCell>

                <TableCell>
                  <Chip
                    label={getStatusLabel(version.status)}
                    color={
                      version.status === BidPreparationStatus.Approved ? 'success' :
                        version.status === BidPreparationStatus.Rejected ? 'error' :
                          version.status === BidPreparationStatus.PendingApproval ? 'warning' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {version.modifiedDate ? format(new Date(version.modifiedDate), 'dd/MM/yyyy HH:mm') : ''}
                </TableCell>
                <TableCell>{version.comments}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default BidVersionHistory;
