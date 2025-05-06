import {
  Box,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';

// Define interface for component props
interface JobstartGrandTotalProps {
  timeCost: number;
  odcExpensesCost: number;
}

const JobstartGrandTotal = ({ timeCost, odcExpensesCost }: JobstartGrandTotalProps) => {
  // Styles
  const tableCellStyle = {
    borderBottom: '1px solid #e0e0e0',
    padding: '12px 16px'
  };

  const summaryRowStyle = {
    bgcolor: '#e3f2fd', // Changed to match the Profit row in JobstartSummary
    '& .MuiTableCell-root': {
      fontWeight: 'bold'
    }
  };

  const sectionStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    '& .MuiAccordion-root': {
      borderRadius: '4px 4px 0 0 !important',
      borderBottom: 'none'
    },
    '& .MuiTableContainer-root': {
      borderRadius: '0 0 4px 4px',
      borderTop: 'none'
    }
  };

  // Function to calculate grand total as sum of timeCost and odcExpensesCost
  const calculateGrandTotal = (): string => {
    const grandTotal = timeCost + odcExpensesCost;
    return grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Box sx={{ ...sectionStyle, mb: 3 }}>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableBody>
            <TableRow sx={{
              ...summaryRowStyle,
              '& .MuiTableCell-root': {
                borderBottom: 'none',
                fontSize: '1.1em'
              }
            }}>
              <TableCell colSpan={4} sx={{...tableCellStyle, width: 'calc(100% - 256px)'}}>GRAND TOTAL</TableCell>
              <TableCell align="right" sx={{...tableCellStyle, width: '240px'}}>{calculateGrandTotal()}</TableCell>
              <TableCell sx={{...tableCellStyle, width: '16px'}}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default JobstartGrandTotal;
