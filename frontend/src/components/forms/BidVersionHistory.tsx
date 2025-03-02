import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Container
} from '@mui/material';
import { format } from 'date-fns';
import { getBidVersionHistory, BidVersionHistory as BidVersionHistoryType } from '../../dummyapi/bidVersionHistoryApi';

interface BidVersionHistoryProps {
  opportunityId: number |undefined;
}

const BidVersionHistory: React.FC<BidVersionHistoryProps> = ({ opportunityId }) => {
  const [versionHistory, setVersionHistory] = useState<BidVersionHistoryType[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadVersionHistory();
  }, [opportunityId]);

  const loadVersionHistory = async () => {
    try {
      const history = await getBidVersionHistory();
      setVersionHistory(history);
      setError('');
    } catch (err) {
      setError('Failed to load version history');
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
                  {version.modifiedDate ? format(new Date(version.modifiedDate), 'dd/MM/yyyy HH:mm') : ''}
                </TableCell>
                <TableCell>{version.comments}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default BidVersionHistory;
