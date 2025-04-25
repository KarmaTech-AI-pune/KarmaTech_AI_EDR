import { useState, useEffect } from 'react';
import {
  Box,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField
} from '@mui/material';

// Define interface for component props
interface JobstartSummaryProps {
  grandTotal: number;
  onDataChange?: (data: {
    projectFees: number;
    serviceTaxPercentage: number;
    serviceTaxAmount: number;
    totalProjectFees: number;
    profit: number;
  }) => void;
}

const JobstartSummary = ({ grandTotal, onDataChange }: JobstartSummaryProps) => {
  // State for project fees and service tax
  const [projectFees, setProjectFees] = useState<string>('0');
  const [serviceTax, setServiceTax] = useState({
    percentage: '18', // Default GST rate in India
    amount: '0'
  });

  // Styles
  const tableCellStyle = {
    borderBottom: '1px solid #e0e0e0',
    padding: '12px 16px'
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      backgroundColor: '#fff',
      '&:hover fieldset': {
        borderColor: '#1976d2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
      }
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

  // Handlers for input changes
  const handleProjectFeesChange = (value: string) => {
    setProjectFees(value);
    notifyParentOfChanges(value, serviceTax.percentage);
  };

  const handleServiceTaxChange = (value: string) => {
    setServiceTax({
      ...serviceTax,
      percentage: value
    });
    notifyParentOfChanges(projectFees, value);
  };

  // Notify parent component of changes
  const notifyParentOfChanges = (fees: string, taxPercentage: string) => {
    if (onDataChange) {
      const feesNum = parseFloat(fees) || 0;
      const taxPercent = parseFloat(taxPercentage) || 0;
      const taxAmount = (feesNum * taxPercent / 100);
      const totalFees = feesNum + taxAmount;
      const profit = feesNum - grandTotal;

      onDataChange({
        projectFees: feesNum,
        serviceTaxPercentage: taxPercent,
        serviceTaxAmount: taxAmount,
        totalProjectFees: totalFees,
        profit: profit
      });
    }
  };

  // Notify parent component on mount and when grandTotal changes
  useEffect(() => {
    notifyParentOfChanges(projectFees, serviceTax.percentage);
  }, [grandTotal]);

  // Calculation functions
  const calculateProfit = () => {
    // Calculate profit as project fees minus grand total
    const fees = parseFloat(projectFees) || 0;
    const profit =  fees - grandTotal;
    return profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculateServiceTax = () => {
    // Calculate service tax based on project fees and tax percentage
    const fees = parseFloat(projectFees) || 0;
    const taxRate = parseFloat(serviceTax.percentage) || 0;
    const taxAmount = (fees * taxRate / 100);
    return taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculateTotalProjectFees = () => {
    // Calculate total project fees including service tax
    const fees = parseFloat(projectFees) || 0;
    const tax = parseFloat(calculateServiceTax().replace(/,/g, '')) || 0;
    const total = fees + tax;
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <>
      {/* Summary Section */}
      <Box sx={{
        ...sectionStyle,
        '& .MuiTableRow-root:not(:last-child)': {
          '& .MuiTableCell-root': {
            borderBottom: '1px solid #e0e0e0'
          }
        }
      }}>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableBody>
              {/* Profit Row */}
              <TableRow sx={{
                bgcolor: '#e3f2fd',
                '& .MuiTableCell-root': {
                  py: 2,
                  fontSize: '1.1em',
                  fontWeight: 'bold'
                }
              }}>
                <TableCell colSpan={4} sx={{...tableCellStyle, width: 'calc(100% - 256px)'}}>Profit</TableCell>
                <TableCell
                  align="right"
                  sx={{
                    ...tableCellStyle,
                    width: '240px',
                    color: parseFloat(calculateProfit().replace(/,/g, '')) >= 0 ? '#2e7d32' : '#d32f2f',
                    fontSize: '1.2em'
                  }}
                >
                  {calculateProfit()}
                </TableCell>
                <TableCell sx={{...tableCellStyle, width: '16px'}}></TableCell>
              </TableRow>

              {/* Project Fees Section */}
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell colSpan={4} sx={{ ...tableCellStyle, width: 'calc(100% - 256px)', fontWeight: 'bold' }}>PROJECT FEES</TableCell>
                <TableCell align="right" sx={{...tableCellStyle, width: '240px'}}>
                  <TextField
                    size="small"
                    type="number"
                    value={projectFees}
                    onChange={(e) => handleProjectFeesChange(e.target.value)}
                    sx={{
                      ...textFieldStyle,
                      width: '50%',
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#fff'
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{...tableCellStyle, width: '16px'}}></TableCell>
              </TableRow>

              {/* Service Tax Row */}
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell
                  colSpan={4}
                  sx={{
                    ...tableCellStyle,
                    width: 'calc(100% - 256px)',
                    fontWeight: 'bold',
                    '& .MuiBox-root': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }
                  }}
                >
                  <Box>
                    Service Tax (GST)
                    <Box component="span" sx={{ mx: 1 }}>@</Box>
                    <TextField
                      size="small"
                      type="number"
                      value={serviceTax.percentage}
                      onChange={(e) => handleServiceTaxChange(e.target.value)}
                      sx={{
                        width: '80px',
                        ...textFieldStyle,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fff',
                          height: '36px'
                        }
                      }}
                    />
                    <Box component="span" sx={{ ml: 1 }}>%</Box>
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    ...tableCellStyle,
                    width: '240px',
                    fontWeight: 'bold',
                    color: '#1976d2'
                  }}
                >
                  {calculateServiceTax()}
                </TableCell>
                <TableCell sx={{...tableCellStyle, width: '16px'}}></TableCell>
              </TableRow>

              {/* Total Project Fees Row */}
              <TableRow sx={{
                bgcolor: '#f5f5f5',
                '& .MuiTableCell-root': {
                  borderBottom: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1em'
                }
              }}>
                <TableCell colSpan={4} sx={{...tableCellStyle, width: 'calc(100% - 256px)'}}>TOTAL PROJECT FEES</TableCell>
                <TableCell align="right" sx={{...tableCellStyle, width: '240px'}}>{calculateTotalProjectFees()}</TableCell>
                <TableCell sx={{...tableCellStyle, width: '16px'}}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default JobstartSummary;
