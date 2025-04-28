import { useState, useEffect } from 'react';
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
  TextField,
  InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { WBSResource } from '../../../types/jobStartFormTypes';

export interface CustomRow {
  id: string;
  prefix: string;
  title: string;
  hasRateField?: boolean;
  hasUnitsField?: boolean;
  unitSuffix?: string;
  units?: number;
  budgetedCost?: number;
  remarks?: string;
}

export interface TableTemplateProps {
  title: string;
  sectionId: string;
  sectionPrefix: string; // e.g., "1a" for Time, "2a" for Expenses
  headerTitle: string; // e.g., "Employee Personnel" or "ODC Expenses"
  resources: WBSResource[];
  totalLabel: string;
  initialExpanded?: boolean;
  customRows?: CustomRow[];
  totalCalculationType?: 'sumResourcesOnly' | 'sumExpenseContingencies' | 'sumTimeContingencies' | 'sumAll';
  onDataChange?: (data: { resources: WBSResource[], customRows: CustomRow[] }) => void;
}

export const tableStyles = {
  textField: {
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
  },
  tableHeader: {
    '& .MuiTableCell-head': {
      fontWeight: 600,
      backgroundColor: '#f5f5f5',
      borderBottom: '2px solid #e0e0e0'
    }
  },
  tableCell: {
    borderBottom: '1px solid #e0e0e0',
    padding: '12px 16px'
  },
  accordion: {
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
  },
  section: {
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
  },
  totalRow: {
    bgcolor: '#f0f0f0',
    '& .MuiTableCell-root': {
      fontWeight: 'bold',
      fontSize: '1rem',
      padding: '16px'
    }
  }
};

const TableTemplate = ({
  title,
  sectionId,
  sectionPrefix,
  headerTitle,
  resources,
  totalLabel,
  initialExpanded = true,
  customRows = [],
  totalCalculationType = 'sumAll', // Default to summing everything if not specified
  onDataChange
}: TableTemplateProps) => {
  const [expanded, setExpanded] = useState<string[]>(initialExpanded ? [sectionId] : []);
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [localCustomRows, setLocalCustomRows] = useState<CustomRow[]>(customRows);

  // Update localCustomRows when customRows prop changes
  useEffect(() => {
    setLocalCustomRows(customRows);
  }, [customRows]);

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
    const newRemarks = {
      ...remarks,
      [id.toString()]: value
    };
    setRemarks(newRemarks);

    if (onDataChange) {
      onDataChange({
        resources: resources.map(resource => ({
          ...resource,
          remarks: newRemarks[resource.id.toString()] || resource.remarks
        })),
        customRows: localCustomRows
      });
    }
  };

  const handleCustomRowChange = (rowId: string, field: string, value: string | number) => {
    const updatedRows = localCustomRows.map(row => {
      if (row.id === rowId) {
        return { ...row, [field]: field === 'remarks' ? value : Number(value) };
      }
      return row;
    });

    setLocalCustomRows(updatedRows);

    if (onDataChange) {
      onDataChange({
        resources,
        customRows: updatedRows
      });
    }
  };

  // Calculate total budgeted cost based on the specified type
  const totalBudgetedCost = (() => {
    switch (totalCalculationType) {
      case 'sumResourcesOnly':
        // Sum only the costs from the main resources array
        return resources.reduce((sum, resource) => sum + (resource.budgetedCost || 0), 0);
      case 'sumExpenseContingencies':
        // Sum only the specific expense-related custom rows
        return localCustomRows
          .filter(row =>
            row.id === 'expenses-subtotal' ||
            row.id === 'expenses-contingencies' ||
            row.id === 'expenses-expense-contingencies'
          )
          .reduce((sum, row) => sum + (row.budgetedCost || 0), 0);
      case 'sumTimeContingencies':
        // Sum only the specific time-related custom rows
        return localCustomRows
          .filter(row =>
            row.id === 'time-subtotal' ||
            row.id === 'time-contingencies'
          )
          .reduce((sum, row) => sum + (row.budgetedCost || 0), 0);
      case 'sumAll': // Default: Sum all resources and all custom rows
      default:
        return [
          ...resources.map(r => r.budgetedCost || 0),
          ...localCustomRows.filter(r => r.budgetedCost !== undefined).map(r => r.budgetedCost || 0)
        ].reduce((sum, cost) => sum + cost, 0);
    }
  })();

  return (
    <Box sx={{ ...tableStyles.section, mb: 3 }}>
      <Accordion
        expanded={expanded.includes(sectionId)}
        onChange={() => handleAccordionChange(sectionId)}
        elevation={0}
        sx={tableStyles.accordion}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={tableStyles.tableHeader}>
                  <TableCell sx={tableStyles.tableCell}>Sr. No.</TableCell>
                  <TableCell sx={tableStyles.tableCell}>Description</TableCell>
                  <TableCell align="center" sx={tableStyles.tableCell}>Rate (Rs)</TableCell>
                  <TableCell align="center" sx={tableStyles.tableCell}>Units</TableCell>
                  <TableCell align="center" sx={tableStyles.tableCell}>Budgeted Cost (Rs.)</TableCell>
                  <TableCell sx={tableStyles.tableCell}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Header Section */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', pl: 3 }}>{sectionPrefix}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{headerTitle}</TableCell>
                  <TableCell align="center"></TableCell>
                  <TableCell align="center"></TableCell>
                  <TableCell align="center"></TableCell>
                  <TableCell></TableCell>
                </TableRow>

                {/* Resource Items */}
                {resources.map((resource, index) => (
                  <TableRow key={resource.id}>
                    <TableCell sx={{ pl: 5 }}>{`${sectionPrefix}.${index + 1}`}</TableCell>
                    <TableCell>
                      {resource.employeeName || resource.name || resource.description || "Unknown"}
                    </TableCell>
                    <TableCell align="center">{resource.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="center">{resource.units.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="center">{resource.budgetedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={remarks[resource.id.toString()] || resource.remarks || ''}
                        onChange={(e) => handleRemarksChange(resource.id, e.target.value)}
                        sx={tableStyles.textField}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {/* Custom Rows */}
                {localCustomRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ fontWeight: 'bold', pl: 3 }}>{row.prefix}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{row.title}</TableCell>
                    <TableCell align="center">
                      {row.hasRateField ? (
                        <TextField
                          size="small"
                          variant="outlined"
                          placeholder="Rate"
                          type="text"
                          onChange={(e) => handleCustomRowChange(row.id, 'rate', e.target.value)}
                          sx={{ ...tableStyles.textField, width: '120px' }} // Apply width here
                        />
                      ) : null}
                    </TableCell>
                    <TableCell align="center">
                      {row.hasUnitsField ? (
                        <TextField
                          fullWidth
                          size="small"
                          variant="outlined"
                          type="text"
                            value={row.units || '0'}
                            onChange={(e) => handleCustomRowChange(row.id, 'units', e.target.value)}
                            sx={{ ...tableStyles.textField, width: '120px' }} // Apply width here
                            // Using slotProps instead of InputProps (which is deprecated)
                            slotProps={{
                              input: {
                                endAdornment: row.unitSuffix === '%' ? <InputAdornment position="end">%</InputAdornment> : undefined
                              }
                            }}
                        />
                      ) : null}
                    </TableCell>
                    <TableCell align="center">{row.budgetedCost ? row.budgetedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="Remarks"
                        value={row.remarks || ''}
                        onChange={(e) => handleCustomRowChange(row.id, 'remarks', e.target.value)}
                        sx={tableStyles.textField}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {/* Total Row */}
                <TableRow sx={tableStyles.totalRow}>
                  <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>{totalLabel}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>{totalBudgetedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default TableTemplate;
