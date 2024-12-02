import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  styled
} from '@mui/material';

const HeaderCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'center',
  fontWeight: 'bold',
  backgroundColor: theme.palette.background.paper,
  padding: '16px 8px',
  borderBottom: `2px solid ${theme.palette.divider}`
}));

interface WBSSummaryProps {
  totalHours: number;
  totalCost: number;
  currency: string;
  disabled: boolean;
  onSave: () => void;
}

const WBSSummary: React.FC<WBSSummaryProps> = ({
  totalHours,
  totalCost,
  currency,
  disabled,
  onSave
}) => {
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <TableContainer>
          <Table size="small" sx={{ maxWidth: 400, ml: 'auto' }}>
            <TableHead>
              <TableRow>
                <HeaderCell>Total Hours</HeaderCell>
                <HeaderCell>Total Cost</HeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  {totalHours}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  {currency} {totalCost.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={disabled}
        >
          Save WBS Data
        </Button>
      </Box>
    </>
  );
};

export default WBSSummary;
