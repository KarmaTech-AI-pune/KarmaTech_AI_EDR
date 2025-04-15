import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField
} from '@mui/material';
import { SummarySectionProps } from '../../../types/jobStartForm';

const SummarySection: React.FC<SummarySectionProps> = ({
  projectFees,
  serviceTax,
  onProjectFeesChange,
  onServiceTaxChange,
  calculateGrandTotal,
  calculateProfit,
  calculateServiceTax,
  calculateTotalProjectFees,
  textFieldStyle,
  tableCellStyle,
  sectionStyle
}) => {
  return (
    <>
      {/* Grand Total Section */}
      <Box sx={{ ...sectionStyle, mb: 3 }}>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow sx={{
                bgcolor: '#f8f9fa',
                '& .MuiTableCell-root': {
                  borderBottom: 'none',
                  fontSize: '1.1em',
                  fontWeight: 'bold'
                }
              }}>
                <TableCell colSpan={4} sx={tableCellStyle}>GRAND TOTAL</TableCell>
                <TableCell align="right" sx={tableCellStyle}>{calculateGrandTotal()}</TableCell>
                <TableCell sx={tableCellStyle}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

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
                    color: calculateProfit() >= 0 ? '#2e7d32' : '#d32f2f',
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
                    onChange={(e) => onProjectFeesChange(e.target.value)}
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
                      onChange={(e) => onServiceTaxChange(e.target.value)}
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

export default SummarySection;
