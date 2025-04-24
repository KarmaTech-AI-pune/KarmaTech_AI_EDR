import { useState } from 'react';
import {
  Box,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField
} from '@mui/material';

const JobstartSummary = () => {
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
  };

  const handleServiceTaxChange = (value: string) => {
    setServiceTax({
      ...serviceTax,
      percentage: value
    });
  };

  // Calculation functions
  const calculateProfit = () => {
    // This would typically calculate profit based on revenue minus costs
    // For now, returning a placeholder value
    return '50000.00';
  };

  const calculateServiceTax = () => {
    // Calculate service tax based on project fees and tax percentage
    const fees = parseFloat(projectFees) || 0;
    const taxRate = parseFloat(serviceTax.percentage) || 0;
    const taxAmount = (fees * taxRate / 100).toFixed(2);
    return taxAmount;
  };

  const calculateTotalProjectFees = () => {
    // Calculate total project fees including service tax
    const fees = parseFloat(projectFees) || 0;
    const tax = parseFloat(calculateServiceTax()) || 0;
    return (fees + tax).toFixed(2);
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
          <Table>
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
                <TableCell colSpan={4} sx={tableCellStyle}>Profit</TableCell>
                <TableCell 
                  align="right" 
                  sx={{
                    ...tableCellStyle,
                    color: parseFloat(calculateProfit()) >= 0 ? '#2e7d32' : '#d32f2f',
                    fontSize: '1.2em'
                  }}
                >
                  {calculateProfit()}
                </TableCell>
                <TableCell sx={tableCellStyle}></TableCell>
              </TableRow>

              {/* Project Fees Section */}
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell colSpan={4} sx={{ ...tableCellStyle, fontWeight: 'bold' }}>PROJECT FEES</TableCell>
                <TableCell align="right" sx={tableCellStyle}>
                  <TextField
                    size="small"
                    type="number"
                    value={projectFees}
                    onChange={(e) => handleProjectFeesChange(e.target.value)}
                    sx={{
                      ...textFieldStyle,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#fff'
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={tableCellStyle}></TableCell>
              </TableRow>

              {/* Service Tax Row */}
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell 
                  colSpan={4} 
                  sx={{ 
                    ...tableCellStyle, 
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
                    fontWeight: 'bold',
                    color: '#1976d2'
                  }}
                >
                  {calculateServiceTax()}
                </TableCell>
                <TableCell sx={tableCellStyle}></TableCell>
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
                <TableCell colSpan={4} sx={tableCellStyle}>TOTAL PROJECT FEES</TableCell>
                <TableCell align="right" sx={tableCellStyle}>{calculateTotalProjectFees()}</TableCell>
                <TableCell sx={tableCellStyle}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default JobstartSummary;
