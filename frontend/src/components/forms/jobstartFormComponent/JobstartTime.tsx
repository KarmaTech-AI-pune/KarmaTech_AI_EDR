import { useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const JobstartTime = () => {
  const [expanded, setExpanded] = useState<string[]>(['time']);

  const handleAccordionChange = (panel: string) => {
    setExpanded(prev => {
      if (prev.includes(panel)) {
        return prev.filter(p => p !== panel);
      } else {
        return [...prev, panel];
      }
    });
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

  const tableHeaderStyle = {
    '& .MuiTableCell-head': {
      fontWeight: 600,
      backgroundColor: '#f5f5f5',
      borderBottom: '2px solid #e0e0e0'
    }
  };

  const tableCellStyle = {
    borderBottom: '1px solid #e0e0e0',
    padding: '12px 16px'
  };

  const accordionStyle = {
    '& .MuiAccordionSummary-root': {
      backgroundColor: '#f8f9fa',
      borderLeft: '3px solid #1976d2',
      minHeight: '48px',
      '&.Mui-expanded': {
        borderBottom: '1px solid #e0e0e0'
      }
    },
    '& .MuiAccordionSummary-content': {
      margin: '12px 0',
      '&.Mui-expanded': {
        margin: '12px 0'
      }
    },
    '& .MuiAccordionDetails-root': {
      padding: 0,
      backgroundColor: '#fff'
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

  const summaryRowStyle = {
    bgcolor: '#f8f9fa',
    '& .MuiTableCell-root': {
      fontWeight: 'bold'
    }
  };

  return (
    <>
      {/* Time Section */}
      <Box sx={{ ...sectionStyle, mb: 3 }}>
        <Accordion
          expanded={expanded.includes('time')}
          onChange={() => handleAccordionChange('time')}
          elevation={0}
          sx={accordionStyle}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 'bold' }}>1.0 TIME</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={tableHeaderStyle}>
                    <TableCell sx={tableCellStyle}>Sr. No.</TableCell>
                    <TableCell sx={tableCellStyle}>Description</TableCell>
                    <TableCell align="right" sx={tableCellStyle}>Rate (Rs)</TableCell>
                    <TableCell align="right" sx={tableCellStyle}>Units</TableCell>
                    <TableCell align="right" sx={tableCellStyle}>Budgeted Cost (Rs.)</TableCell>
                    <TableCell sx={tableCellStyle}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Employee Personnel Section */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', pl: 3 }}>1a</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Employee Personnel</TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
};

export default JobstartTime;
