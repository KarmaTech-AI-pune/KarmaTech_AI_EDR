import { useState, useEffect } from 'react';
import { addCalculation, percentageCalculation, getPercentage } from '../../../utils/calculations';
import { formatToIndianNumber } from '../../../utils/numberFormatting';
import {
  Box,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  InputAdornment
} from '@mui/material';

// Define interface for component props
interface JobstartSummaryProps {
  grandTotal: number;
  initialProjectFees?: number;
  initialServiceTaxPercentage?: number;
  onDataChange?: (data: {
    projectFees: number;
    serviceTaxPercentage: number;
    serviceTaxAmount: number;
    totalProjectFees: number;
    profit: number;
    profitPercentage: number;
  }) => void;
}

const JobstartSummary = ({ grandTotal, initialProjectFees, initialServiceTaxPercentage, onDataChange }: JobstartSummaryProps) => {
  // State for project fees and service tax
  const [projectFees, setProjectFees] = useState<string>(
    (initialProjectFees || 0).toFixed(2)
  );
  const [serviceTax, setServiceTax] = useState({
    percentage: (initialServiceTaxPercentage || 18).toString(), // Default GST rate in India
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
    // Only allow numeric values (including decimal points)
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setProjectFees(value);
      notifyParentOfChanges(value, serviceTax.percentage);
    }
  };

  const handleProjectFeesBlur = () => {
    const numValue = parseFloat(projectFees);
    if (!isNaN(numValue)) {
      setProjectFees(numValue.toFixed(2));
      notifyParentOfChanges(numValue.toFixed(2), serviceTax.percentage);
    } else {
      setProjectFees('0.00');
      notifyParentOfChanges('0.00', serviceTax.percentage);
    }
  };

  const handleServiceTaxChange = (value: string) => {
    // Only allow numeric values (including decimal points)
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      // Remove any leading zeros (except for decimal values like 0.xx)
      let cleanedValue = value;
      if (value.length > 1 && value.startsWith('0') && value.charAt(1) !== '.') {
        cleanedValue = value.replace(/^0+/, '');
      }

      setServiceTax({
        ...serviceTax,
        percentage: cleanedValue
      });
      notifyParentOfChanges(projectFees, cleanedValue);
    }
  };

  // Handle service tax when focus is lost
  const handleServiceTaxBlur = () => {
    if (serviceTax.percentage) {
      const numValue = parseFloat(serviceTax.percentage);
      if (!isNaN(numValue)) {
        // Just use the numeric value without decimal formatting
        const formattedValue = numValue.toString();
        setServiceTax({
          ...serviceTax,
          percentage: formattedValue
        });
        notifyParentOfChanges(projectFees, formattedValue);
      }
    } else {
      // If field is empty, set to 0
      setServiceTax({
        ...serviceTax,
        percentage: '0'
      });
      notifyParentOfChanges(projectFees, '0');
    }
  };

  // Notify parent component of changes
  const notifyParentOfChanges = (fees: string, taxPercentage: string) => {
    if (onDataChange) {
      const feesNum = parseFloat(fees) || 0;
      const taxPercent = parseFloat(taxPercentage) || 0;
      const taxAmount = percentageCalculation(taxPercent, feesNum);
      const totalFees = addCalculation(feesNum, taxAmount);
      const profit = feesNum - grandTotal;
      const profitPercentage = getPercentage(profit, feesNum);

      onDataChange({
        projectFees: feesNum,
        serviceTaxPercentage: taxPercent,
        serviceTaxAmount: taxAmount,
        totalProjectFees: totalFees,
        profit: profit,
        profitPercentage: profitPercentage
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
    return formatToIndianNumber(profit);
  };

  const calculateServiceTax = () => {
    // Calculate service tax based on project fees and tax percentage
    const fees = parseFloat(projectFees) || 0;
    const taxRate = parseFloat(serviceTax.percentage) || 0;
    const taxAmount = percentageCalculation(taxRate, fees);
    return formatToIndianNumber(taxAmount);
  };

  const calculateTotalProjectFees = () => {
    // Calculate total project fees including service tax
    const fees = parseFloat(projectFees) || 0;
    const tax = parseFloat(calculateServiceTax().replace(/,/g, '')) || 0;
    const total = addCalculation(fees, tax);
    return formatToIndianNumber(total);
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

              {/* Profit Percentage Row */}
              <TableRow sx={{
                bgcolor: '#e3f2fd',
                '& .MuiTableCell-root': {
                  py: 2,
                  fontSize: '1.1em',
                  fontWeight: 'bold'
                }
              }}>
                <TableCell colSpan={4} sx={{...tableCellStyle, width: 'calc(100% - 256px)'}}>Profit Percentage</TableCell>
                <TableCell
                  align="right"
                  sx={{
                    ...tableCellStyle,
                    width: '240px',
                    color: parseFloat(calculateProfit().replace(/,/g, '')) >= 0 ? '#2e7d32' : '#d32f2f',
                    fontSize: '1.2em'
                  }}
                >
                  {parseFloat(projectFees) > 0 ? `${((parseFloat(calculateProfit().replace(/,/g, '')) / parseFloat(projectFees)) * 100).toFixed(2)}%` : '0.00%'}
                </TableCell>
                <TableCell sx={{...tableCellStyle, width: '16px'}}></TableCell>
              </TableRow>

              {/* Project Fees Section */}
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell colSpan={4} sx={{ ...tableCellStyle, width: 'calc(100% - 256px)', fontWeight: 'bold' }}>PROJECT FEES</TableCell>
                <TableCell align="right" sx={{...tableCellStyle, width: '240px', fontWeight: 'bold', color: '#1976d2', fontSize: '1.2em'}}>
                   <TextField
                      size="small"
                      type="text"
                      value={projectFees}
                      onChange={(e) => handleProjectFeesChange(e.target.value)}
                      onBlur={handleProjectFeesBlur}
                      sx={{
                        width: '150px',
                        ...textFieldStyle,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fff',
                          height: '36px',
                          '& input': {
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: '#1976d2',
                          }
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
                    <TextField
                      size="small"
                      type="text"
                      // Using inputProps for now as slotProps doesn't support min/max/step directly
                      inputProps={{
                        min: 0,
                        max: 100,
                        step: 0.01
                      }}
                      value={serviceTax.percentage}
                      onChange={(e) => handleServiceTaxChange(e.target.value)}
                      onBlur={handleServiceTaxBlur}
                      sx={{
                        width: '80px',
                        ml: 2,
                        ...textFieldStyle,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fff',
                          height: '36px'
                        }
                      }}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">%</InputAdornment>
                        }
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    ...tableCellStyle,
                    width: '240px',
                    fontWeight: 'bold',
                    color: '#1976d2',
                    fontSize: '1.2em' // Added font size
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
                <TableCell colSpan={4} sx={{...tableCellStyle, width: 'calc(100% - 256px)'}}>TOTAL PROJECT FEES(Incl.tax)</TableCell>
                <TableCell align="right" sx={{...tableCellStyle, width: '240px', fontSize: '1.2em'}}>{calculateTotalProjectFees()}</TableCell>
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
