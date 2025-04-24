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
import { JobstartTimeProps } from '../../../types/jobStartFormTypes';

const JobstartTime = ({ wbsResources }: JobstartTimeProps) => {
  const [expanded, setExpanded] = useState<string[]>(['time']);
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

                  {/* WBS Resources with taskType=0 (Manpower) */}
                  {wbsResources.map((resource, index) => (
                    <TableRow key={resource.id}>
                      <TableCell sx={{ pl: 5 }}>{`1a.${index + 1}`}</TableCell>
                      <TableCell>
                        {resource.employeeName || resource.name || "Unknown"}
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

                  {/* Time Contingencies Row */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', pl: 3 }}>1b</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time Contingencies</TableCell>
                    <TableCell align="right">
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="Rate"
                        sx={textFieldStyle}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="Units"
                        sx={textFieldStyle}
                      />
                    </TableCell>
                    <TableCell align="right">0</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="Remarks"
                        sx={textFieldStyle}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Total Row */}
                  <TableRow sx={{
                    bgcolor: '#f0f0f0',
                    '& .MuiTableCell-root': {
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      padding: '16px'
                    }
                  }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>Total Time Cost</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{totalBudgetedCost.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
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
