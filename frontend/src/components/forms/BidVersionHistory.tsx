import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Container,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import { BidVersionHistory as BidVersionHistoryType, BidPreparationStatus } from '../../dummyapi/bidVersionHistoryApi';
import { getStatusLabel } from '../../utils/statusUtils';

interface BidVersionHistoryProps {
  versionHistory:BidVersionHistoryType[]
}

const BidVersionHistory: React.FC<BidVersionHistoryProps> = ({ versionHistory }) => {

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Version History
      </Typography>
      <Paper sx={{ mb: 2 }}>
        {versionHistory.length > 0 ? (
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
                <TableRow key={version.id} data-testid="history-row">
                  <TableCell data-testid="version-cell">{version.version}</TableCell>
                  <TableCell>{version.modifiedBy}</TableCell>

                  <TableCell>
                    <Chip
                      data-testid="status-chip"
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
        ) : (
          /* No Data Found alert hidden - do not delete */
          /* <Alert severity="error" sx={{ mb: 2 }}>
            No Data Found
          </Alert> */
          null
        )}
      </Paper>
    </Container>
  );
};

export default BidVersionHistory;
