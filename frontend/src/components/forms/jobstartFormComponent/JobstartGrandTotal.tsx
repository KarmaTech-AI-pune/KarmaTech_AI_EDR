import { useState } from 'react';
import {
  Box,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';

const JobstartGrandTotal = () => {
  // Styles
  const tableCellStyle = { 
    borderBottom: '1px solid #e0e0e0', 
    padding: '12px 16px' 
  }; 
  
  const summaryRowStyle = { 
    bgcolor: '#f8f9fa', 
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

  // Function to calculate grand total - placeholder for now
  const calculateGrandTotal = () => {
    // This would typically sum up all the costs from different sections
    // For now, returning a placeholder value
    return '0.00';
  };

  return (
    <Box sx={{ ...sectionStyle, mb: 3 }}>
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow sx={{
              ...summaryRowStyle,
              '& .MuiTableCell-root': {
                borderBottom: 'none',
                fontSize: '1.1em'
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
  );
};

export default JobstartGrandTotal;
