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
  TableBody,
  TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EstimatedExpensesProps } from '../../../types/jobStartFormTypes';

const EstimatedExpenses = ({ wbsResources }: EstimatedExpensesProps) => {
  const [expanded, setExpanded] = useState<string[]>(['expenses']);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});

  const handleAccordionChange = (panel: string) => {
    setExpanded(prev => {
      if (prev.includes(panel)) {
        return prev.filter(p => p !== panel);
      } else {
        return [...prev, panel];
      }
    });
  };

  const handleRemarksChange = (id: string | number, value: string) => {
    setRemarks(prev => ({
      ...prev,
      [id.toString()]: value
    }));
  };

  // Calculate total budgeted cost
  const totalBudgetedCost = wbsResources.reduce((sum, resource) => sum + resource.budgetedCost, 0);

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
      {/* Expenses Section */}
      <Box sx={{ ...sectionStyle, mb: 3 }}>
        <Accordion
          expanded={expanded.includes('expenses')}
          onChange={() => handleAccordionChange('expenses')}
          elevation={0}
          sx={accordionStyle}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 'bold' }}>2.0 ESTIMATED EXPENSES</Typography>
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
                  {/* ODC Expenses Section */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', pl: 3 }}>2a</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>ODC Expenses</TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell></TableCell>
                  </TableRow>

                  {/* WBS Resources with taskType=1 (ODC) */}
                  {wbsResources.map((resource, index) => (
                    <TableRow key={resource.id}>
                      <TableCell sx={{ pl: 5 }}>{`2a.${index + 1}`}</TableCell>
                      <TableCell>
                        {resource.name || resource.employeeName || "Unknown"}
                      </TableCell>
                      <TableCell align="right">{resource.rate.toLocaleString()}</TableCell>
                      <TableCell align="right">{resource.units.toLocaleString()}</TableCell>
                      <TableCell align="right">{resource.budgetedCost.toLocaleString()}</TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          variant="outlined"
                          value={remarks[resource.id.toString()] || ''}
                          onChange={(e) => handleRemarksChange(resource.id, e.target.value)}
                          sx={textFieldStyle}
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Total Row */}
                  {wbsResources.length > 0 && (
                    <TableRow sx={summaryRowStyle}>
                      <TableCell colSpan={4} align="right">Total ODC Expenses</TableCell>
                      <TableCell align="right">{totalBudgetedCost.toLocaleString()}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
};

export default EstimatedExpenses;
