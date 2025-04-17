import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert
} from '@mui/material';
import LoadingButton from '../common/LoadingButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// Removed dummy API imports: import { ResourceAPI, WBSStructureAPI } from '../../dummyapi/wbsApi';
import { projectManagementAppContext } from '../../App';
import { projectManagementAppContextType, JobStartFormData } from '../../types'; // Added JobStartFormData
import { FormWrapper } from './FormWrapper';
import {
  submitJobStartForm,
  getJobStartFormByProjectId,
  updateJobStartForm, // Import the new update function
  getWBSResourceData // Import the new function to get WBS resource data
} from '../../services/jobStartFormApi';

interface TaskAllocation {
  taskId: string;
  title: string;
  rate: number;
  hours: number;
  cost: number;
}

interface EmployeeAllocation {
  id: string;
  name: string;
  is_consultant: boolean;
  allocations: TaskAllocation[];
  totalHours: number;
  totalCost: number;
  remarks: string;
}

interface ExpenseEntry {
  number: string;
  remarks: string;
}

interface OutsideAgencyEntry {
  description: string;
  rate: string;
  units: string;
  remarks: string;
}

interface ProjectSpecificEntry {
  name: string;
  number: string;
  remarks: string;
}

interface TimeContingencyEntry {
  rate: string;
  units: string;
  remarks: string;
}

interface ServiceTaxEntry {
  percentage: string;
}

type ExpensesType = {
  '2a': ExpenseEntry;
  '2b': ExpenseEntry;
  '3': ExpenseEntry;
  '4': ExpenseEntry;
  '5': ExpenseEntry;
  '7': ExpenseEntry;
}

// ExpensesData interface is defined in types.ts
        
type OutsideAgencyType = {
  'a': OutsideAgencyEntry;
  'b': OutsideAgencyEntry;
  'c': OutsideAgencyEntry;
}

type ProjectSpecificType = {
  '6c': ProjectSpecificEntry;
  '6d': ProjectSpecificEntry;
  '6e': ProjectSpecificEntry;
}

const formatTitle = (title: string): string => {
  return title
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const JobStartForm: React.FC = () => {
  const context = useContext<projectManagementAppContextType | null>(projectManagementAppContext);
  const [employeeAllocations, setEmployeeAllocations] = useState<EmployeeAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isUpdating, setIsUpdating] = useState(false); // State to track if updating
  const [currentFormId, setCurrentFormId] = useState<number | string | null>(null); // State to store the ID of the form being updated

  const [timeContingency, setTimeContingency] = useState<TimeContingencyEntry>({
    rate: '',
    units: '',
    remarks: ''
  });
  const [expanded, setExpanded] = useState<string[]>(['time', 'expenses']);

  const handleAccordionChange = (panel: string) => {
    setExpanded(prev => {
      if (prev.includes(panel)) {
        return prev.filter(p => p !== panel);
      } else {
        return [...prev, panel];
      }
    });
  };
  const [expenses, setExpenses] = useState<ExpensesType>({
    '2a': { number: '10000', remarks: '' },
    '2b': { number: '10000', remarks: '' },
    '3': { number: '', remarks: '' },
    '4': { number: '10000', remarks: '' },
    '5': { number: '10000', remarks: '' },
    '7': { number: '100000', remarks: '' },
  });

  const [surveyWorks, setSurveyWorks] = useState<ExpenseEntry>({
    number: '',
    remarks: ''
  });

  const [outsideAgency, setOutsideAgency] = useState<OutsideAgencyType>({
    'a': { description: '', rate: '', units: '', remarks: '' },
    'b': { description: '', rate: '', units: '', remarks: '' },
    'c': { description: '', rate: '', units: '', remarks: '' },
  });

  const [projectSpecific, setProjectSpecific] = useState<ProjectSpecificType>({
    '6c': { name: '', number: '', remarks: '' },
    '6d': { name: '', number: '', remarks: '' },
    '6e': { name: '', number: '', remarks: '' },
  });

  const [projectFees, setProjectFees] = useState<string>('800000');
  const [serviceTax, setServiceTax] = useState<ServiceTaxEntry>({
    percentage: '15'
  });

    // Effect for loading WBS and Resource data
  useEffect(() => {
    if (!context?.selectedProject?.id) return;

    const fetchWBSResourceData = async () => {
      try {
        setLoading(true); // Start loading for WBS/Resource data
        setError(null);

        // Use the new API to get WBS resource data
        const wbsResourceData = await getWBSResourceData(context.selectedProject?.id?.toString() || '');

        const employeeMap = new Map<string, EmployeeAllocation>();

        // Process the resource allocations from the backend
        wbsResourceData.resourceAllocations.forEach((allocation: any) => {
          const employeeId = allocation.employeeId;
          if (!employeeMap.has(employeeId)) {
            employeeMap.set(employeeId, {
              id: employeeId,
              name: allocation.employeeName,
              is_consultant: allocation.isConsultant,
              allocations: [],
              totalHours: 0,
              totalCost: 0,
              remarks: '' // Initialize remarks here
            });
          }

          const emp = employeeMap.get(employeeId)!;
          const taskCost = allocation.costRate * allocation.totalHours;

          emp.allocations.push({
            taskId: allocation.taskId,
            title: allocation.taskTitle || `Task ${allocation.taskId}`,
            rate: allocation.costRate,
            hours: allocation.totalHours,
            cost: taskCost
          });
          emp.totalHours += allocation.totalHours;
          emp.totalCost += taskCost;
        });

        // Set initial employee allocations based on WBS/Resource data
        // This will be overwritten if existing form data is found later
        setEmployeeAllocations(Array.from(employeeMap.values()));

      } catch (error) {
        console.error('Error fetching WBS resource data:', error);
        setError('Failed to load WBS resource data. Please ensure you have submitted a WBS form for this project.');
      } finally {
        setLoading(false); // Finish loading for WBS/Resource data
      }
    };

    fetchWBSResourceData();
  }, [context?.selectedProject?.id]);


  // Effect for loading existing Job Start Form data or falling back to local storage
  useEffect(() => {
    const loadFormData = async () => {
      const projectId = context?.selectedProject?.id?.toString();
      if (!projectId) return;

      setLoading(true); // Start loading for form data
      setIsUpdating(false); // Reset update status
      setCurrentFormId(null); // Reset form ID

      try {
        // Try to fetch the latest form data from the backend
        // Assuming getJobStartFormByProjectId fetches the most relevant/latest form if multiple exist
        // Or adjust to use getJobStartFormById if a specific ID is known/needed
        // Fetch the array of forms for the project
        const responseArray = await getJobStartFormByProjectId(projectId);

        // Check if the array is valid and contains at least one form
        if (responseArray && Array.isArray(responseArray) && responseArray.length > 0) {
          // Assume we use the first form found (backend might need sorting logic later)
          const backendDto = responseArray[0];
          console.log('Flat DTO loaded from backend:', backendDto);

          // Populate ONLY the state fields that exist in the flat DTO
          setProjectFees(backendDto.projectFees?.toString() ?? '');
          setServiceTax({ percentage: backendDto.serviceTaxPercentage?.toString() ?? '18' });
          // NOTE: We CANNOT populate employeeAllocations, expenses, timeContingency etc.
          // from the flat DTO as the detail is not stored there.
          // These rely on the initial WBS fetch, default values, and user input.

          // Mark as updating and store the form ID
          setIsUpdating(true);
          setCurrentFormId(backendDto.formId);

          // We don't save the flat DTO to local storage here, as local storage
          // should hold the full nested structure if needed for fallback.
          setLoading(false); // Finish loading
          return; // Exit after successful backend load (using flat DTO info)
        } else {
           console.log('No existing form data DTO found on backend for this project.');
        }

      } catch (error) {
        console.warn('Failed to fetch form data from backend, checking local storage.', error);
      }

      // Fallback to localStorage if backend fetch fails or returns no data
      try {
        const savedFormData = localStorage.getItem(`jobStartFormData_${projectId}`);
        if (savedFormData) {
          console.log('Loading form data from local storage.');
          const parsedData = JSON.parse(savedFormData);
          // Populate state with local storage data
          setEmployeeAllocations(parsedData.time.employeeAllocations);
          setTimeContingency(parsedData.time.timeContingency);
          setExpenses(parsedData.expenses.regularExpenses);
          setSurveyWorks(parsedData.expenses.surveyWorks);
          setOutsideAgency(parsedData.expenses.outsideAgency);
          setProjectSpecific(parsedData.expenses.projectSpecific);
          setProjectFees(parsedData.projectFees?.toString() ?? '');
          setServiceTax({ percentage: parsedData.serviceTax.percentage?.toString() ?? '18' });

          // If local storage data has an ID, assume we are updating it
          if (parsedData.formId) {
            setIsUpdating(true);
            setCurrentFormId(parsedData.formId);
          } else {
            // Data from local storage without an ID implies it was saved before first submission
            setIsUpdating(false);
            setCurrentFormId(null);
          }
        } else {
          console.log('No form data found in local storage either. Starting fresh.');
          // Reset form fields if needed, or rely on initial state values
           setIsUpdating(false);
           setCurrentFormId(null);
        }
      } catch (e) {
        console.error("Error reading or parsing local storage data:", e);
        setIsUpdating(false);
        setCurrentFormId(null);
      } finally {
         setLoading(false); // Finish loading attempt
      }
    };

    loadFormData();
    // Dependency array includes project ID to reload when project changes
  }, [context?.selectedProject?.id]);

  const calculateTotalCost = (employees: EmployeeAllocation[], isConsultant: boolean) => {
    return employees
      .filter(emp => emp.is_consultant === isConsultant)
      .reduce((total, emp) => total + emp.totalCost, 0);
  };

  const handleRemarksChange = (employeeId: string, value: string) => {
    setEmployeeAllocations(prevAllocations =>
      prevAllocations.map(emp =>
        emp.id === employeeId ? { ...emp, remarks: value } : emp
      )
    );
  };

  const handleTimeContingencyChange = (field: keyof TimeContingencyEntry, value: string) => {
    setTimeContingency(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpenseChange = (id: keyof ExpensesType, field: keyof ExpenseEntry, value: string) => {
    setExpenses(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSurveyWorksChange = (field: keyof ExpenseEntry, value: string) => {
    setSurveyWorks(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOutsideAgencyChange = (id: keyof OutsideAgencyType, field: keyof OutsideAgencyEntry, value: string) => {
    setOutsideAgency(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleProjectSpecificChange = (id: keyof ProjectSpecificType, field: keyof ProjectSpecificEntry, value: string) => {
    setProjectSpecific(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleProjectFeesChange = (value: string) => {
    setProjectFees(value);
  };

  const handleServiceTaxChange = (value: string) => {
    setServiceTax(prev => ({
      ...prev,
      percentage: value
    }));
  };

  const calculateTimeContingencyCost = () => {
    const rate = Number(timeContingency.rate) || 0;
    const units = Number(timeContingency.units) || 0;
    return rate * units;
  };

  const calculateOutsideAgencyCost = (entry: OutsideAgencyEntry) => {
    const rate = Number(entry.rate) || 0;
    const units = Number(entry.units) || 0;
    return rate * units;
  };

  const calculateTotalTimeCost = () => {
    const employeesTotal = calculateTotalCost(employeeAllocations, false);
    const consultantsTotal = calculateTotalCost(employeeAllocations, true);
    const contingencyTotal = calculateTimeContingencyCost();
    return employeesTotal + consultantsTotal + contingencyTotal;
  };

  const calculateExpensesTotal = () => {
    let total = 0;
    // Add up all expense entries
    Object.values(expenses).forEach(entry => {
      total += Number(entry.number) || 0;
    });
    // Add survey works
    total += Number(surveyWorks.number) || 0;
    // Add up outside agency entries (rate * units)
    Object.values(outsideAgency).forEach(entry => {
      total += calculateOutsideAgencyCost(entry);
    });
    // Add up project specific entries
    Object.values(projectSpecific).forEach(entry => {
      total += Number(entry.number) || 0;
    });
    return total;
  };

  const calculateGrandTotal = () => {
    const timeCost = calculateTotalTimeCost();
    const expensesTotal = calculateExpensesTotal();
    return timeCost + expensesTotal;
  };

  const calculateProfit = () => {
    const fees = Number(projectFees) || 0;
    const total = calculateGrandTotal();
    return fees - total;
  };

  const calculateServiceTax = () => {
    const fees = Number(projectFees) || 0;
    const taxPercentage = Number(serviceTax.percentage) || 0;
    return (fees * taxPercentage) / 100;
  };

  const calculateTotalProjectFees = () => {
    const fees = Number(projectFees) || 0;
    const tax = calculateServiceTax();
    return fees + tax;
  };

  // Removed the separate useEffect for loading form data as it's combined above.

  const handleSubmit = async () => {
    const projectId = context?.selectedProject?.id;
    if (!projectId) {
      setSnackbarMessage('No project selected. Cannot submit.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // It might be better to save to local storage periodically on field changes,
    // rather than only on submit, to prevent data loss if submission fails.
    // For now, we remove the automatic save on submit and clear it on success.
    // const formState = { ... }; // Data collection moved below
    // localStorage.setItem(`jobStartFormData_${projectId}`, JSON.stringify(formState));

    setSubmitting(true);
    try {
      // Collect all form data into the structure expected by the API
      const formData: JobStartFormData = {
        projectId: projectId,
        formId: isUpdating ? Number(currentFormId) : undefined, // Include formId only if updating
        time: {
          employeeAllocations,
          timeContingency,
          totalTimeCost: calculateTotalTimeCost()
        },
        expenses: {
          regularExpenses: expenses,
          surveyWorks,
          outsideAgency,
          projectSpecific,
          totalExpenses: calculateExpensesTotal()
        },
        grandTotal: calculateGrandTotal(),
        projectFees: Number(projectFees),
        serviceTax: {
          percentage: Number(serviceTax.percentage),
          amount: calculateServiceTax()
        },
        totalProjectFees: calculateTotalProjectFees(),
        profit: calculateProfit()
        // Add any other fields from the form that need to be sent
      };

      let response;
      if (isUpdating && currentFormId) {
        // Call the update API function
        console.log(`Attempting to update form ID: ${currentFormId} for project: ${projectId}`);
        response = await updateJobStartForm(projectId, currentFormId, formData);
        setSnackbarMessage('Job Start Form updated successfully');
      } else {
        // Call the create API function
        console.log(`Attempting to create new form for project: ${projectId}`);
        response = await submitJobStartForm(projectId, formData);
        // If creation is successful, we might get the new formId back
        // If so, update the state to reflect we are now "updating" this new form
        if (response && response.formId) {
             setIsUpdating(true);
             setCurrentFormId(response.formId);
             console.log(`New form created with ID: ${response.formId}. Switched to update mode.`);
        }
        setSnackbarMessage('Job Start Form submitted successfully');
      }

      // Clear local storage on successful submission/update
      localStorage.removeItem(`jobStartFormData_${projectId}`);
      console.log('Cleared local storage for project:', projectId);

      setSnackbarSeverity('success');
      setSnackbarOpen(true);

    } catch (error) {
      console.error('Error submitting/updating form:', error);
      setSnackbarMessage(`Failed to ${isUpdating ? 'update' : 'submit'} Job Start Form`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      // Consider saving the current state to local storage here on failure
      // to allow the user to retry without losing data.
      // localStorage.setItem(`jobStartFormData_${projectId}_failed`, JSON.stringify(formData));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <FormWrapper>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </FormWrapper>
    );
  }

  if (error) {
    return (
      <FormWrapper>
        <Paper sx={{ p: 3, bgcolor: '#fff3f3' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
        </FormWrapper>
      );
  }

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

  if (loading) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, bgcolor: '#fff3f3' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  const formContent = (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{
        width: '100%',
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        pr: 1,
        pb: 4
      }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid #e0e0e0',
            borderRadius: 1
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: '#1976d2',
              fontWeight: 500,
              mb: 3
            }}
          >
            PMD1. Job Start Form
          </Typography>

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
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell align="right">{calculateTotalCost(employeeAllocations, false)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>

                    {/* Employee Allocations */}
                    {employeeAllocations
                      .filter(emp => !emp.is_consultant)
                      .map((emp) => (
                        <React.Fragment key={emp.id}>
                          <TableRow>
                            <TableCell></TableCell>
                            <TableCell sx={{ pl: 4 }}>{emp.name}</TableCell>
                            <TableCell align="right">
                              {emp.allocations.length === 1 ? emp.allocations[0].rate : ''}
                            </TableCell>
                            <TableCell align="right">
                              {emp.allocations.length === 1 ? emp.allocations[0].hours : emp.totalHours}
                            </TableCell>
                            <TableCell align="right">{emp.totalCost}</TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                value={emp.remarks}
                                onChange={(e) => handleRemarksChange(emp.id, e.target.value)}
                                sx={textFieldStyle}
                              />
                            </TableCell>
                          </TableRow>
                          {emp.allocations.length > 1 && emp.allocations.map((alloc) => (
                            <TableRow key={`${emp.id}-${alloc.taskId}`}>
                              <TableCell></TableCell>
                              <TableCell sx={{ pl: 4 }}>{formatTitle(alloc.title)}</TableCell>
                              <TableCell align="right">{alloc.rate}</TableCell>
                              <TableCell align="right">{alloc.hours}</TableCell>
                              <TableCell align="right">{alloc.cost}</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}

                    {/* Contract Employee Section */}
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell sx={{ fontWeight: 'bold', pl: 3 }}>Contract Employee</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell align="right">{calculateTotalCost(employeeAllocations, true)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>

                    {/* Contract Employee Allocations */}
                    {employeeAllocations
                      .filter(emp => emp.is_consultant)
                      .map((emp) => (
                        <React.Fragment key={emp.id}>
                          <TableRow>
                            <TableCell></TableCell>
                            <TableCell sx={{ pl: 4 }}>{emp.name}</TableCell>
                            <TableCell align="right">
                              {emp.allocations.length === 1 ? emp.allocations[0].rate : ''}
                            </TableCell>
                            <TableCell align="right">
                              {emp.allocations.length === 1 ? emp.allocations[0].hours : emp.totalHours}
                            </TableCell>
                            <TableCell align="right">{emp.totalCost}</TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                value={emp.remarks}
                                onChange={(e) => handleRemarksChange(emp.id, e.target.value)}
                                sx={textFieldStyle}
                              />
                            </TableCell>
                          </TableRow>
                          {emp.allocations.length > 1 && emp.allocations.map((alloc) => (
                            <TableRow key={`${emp.id}-${alloc.taskId}`}>
                              <TableCell></TableCell>
                              <TableCell sx={{ pl: 4 }}>{formatTitle(alloc.title)}</TableCell>
                              <TableCell align="right">{alloc.rate}</TableCell>
                              <TableCell align="right">{alloc.hours}</TableCell>
                              <TableCell align="right">{alloc.cost}</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}

                    {/* Time Contingencies Row */}
                    <TableRow>
                      <TableCell sx={{ pl: 3 }}>1b</TableCell>
                      <TableCell>Time Contingencies</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={timeContingency.rate}
                          onChange={(e) => handleTimeContingencyChange('rate', e.target.value)}
                          placeholder="Rate"
                          sx={textFieldStyle}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={timeContingency.units}
                          onChange={(e) => handleTimeContingencyChange('units', e.target.value)}
                          placeholder="Units"
                          sx={textFieldStyle}
                        />
                      </TableCell>
                      <TableCell align="right">{calculateTimeContingencyCost()}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={timeContingency.remarks}
                          onChange={(e) => handleTimeContingencyChange('remarks', e.target.value)}
                          placeholder="Remarks"
                          sx={textFieldStyle}
                        />
                      </TableCell>
                    </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow sx={summaryRowStyle}>
                    <TableCell colSpan={4} sx={tableCellStyle}>TOTAL TIME COST</TableCell>
                    <TableCell align="right" sx={tableCellStyle}>{calculateTotalTimeCost()}</TableCell>
                    <TableCell sx={tableCellStyle}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

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
                      {/* Regular Expenses */}
                    {(['2a', '2b', '3', '4', '5'] as (keyof ExpensesType)[]).map((id: keyof ExpensesType) => (
                      <TableRow key={id}>
                        <TableCell sx={{ pl: 3 }}>{id}</TableCell>
                        <TableCell>
                          {id === '2a' && 'Travel'}
                          {id === '2b' && 'Subsistence'}
                          {id === '3' && 'Local conveyance'}
                          {id === '4' && 'Communications'}
                          {id === '5' && 'Stationery and printing'}
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={expenses[id].number}
                            onChange={(e) => handleExpenseChange(id, 'number', e.target.value)}
                            sx={textFieldStyle}
                          />
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell align="right">{expenses[id].number}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={expenses[id].remarks}
                            onChange={(e) => handleExpenseChange(id, 'remarks', e.target.value)}
                            sx={textFieldStyle}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Outside Agency Section */}
                    <TableRow>
                      <TableCell sx={{ pl: 3 }}>6a</TableCell>
                      <TableCell colSpan={5}>Outside Agency</TableCell>
                    </TableRow>

                    {(Object.entries(outsideAgency) as [keyof OutsideAgencyType, OutsideAgencyEntry][]).map(([id, entry]) => (
                      <TableRow key={id}>
                        <TableCell></TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={entry.description}
                            onChange={(e) => handleOutsideAgencyChange(id, 'description', e.target.value)}
                            placeholder="Enter description"
                            sx={textFieldStyle}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={entry.rate}
                            onChange={(e) => handleOutsideAgencyChange(id, 'rate', e.target.value)}
                            placeholder="Rate"
                            sx={textFieldStyle}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={entry.units}
                            onChange={(e) => handleOutsideAgencyChange(id, 'units', e.target.value)}
                            placeholder="Units"
                            sx={textFieldStyle}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {calculateOutsideAgencyCost(entry)}
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={entry.remarks}
                            onChange={(e) => handleOutsideAgencyChange(id, 'remarks', e.target.value)}
                            placeholder="Remarks"
                            sx={textFieldStyle}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Survey Works Section */}
                    <TableRow>
                      <TableCell sx={{ pl: 3 }}>6b</TableCell>
                      <TableCell>Survey works</TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          value={surveyWorks.number}
                          onChange={(e) => handleSurveyWorksChange('number', e.target.value)}
                          sx={textFieldStyle}
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell align="right">{surveyWorks.number}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={surveyWorks.remarks}
                          onChange={(e) => handleSurveyWorksChange('remarks', e.target.value)}
                          sx={textFieldStyle}
                        />
                      </TableCell>
                    </TableRow>

                    {/* Project Specific Items */}
                    {(Object.entries(projectSpecific) as [keyof ProjectSpecificType, ProjectSpecificEntry][]).map(([id, entry]) => (
                      <TableRow key={id}>
                        <TableCell sx={{ pl: 3 }}>{id}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={entry.name}
                            onChange={(e) => handleProjectSpecificChange(id, 'name', e.target.value)}
                            placeholder="Project specific item name"
                            sx={textFieldStyle}
                          />
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={entry.number}
                            onChange={(e) => handleProjectSpecificChange(id, 'number', e.target.value)}
                            sx={textFieldStyle}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={entry.remarks}
                            onChange={(e) => handleProjectSpecificChange(id, 'remarks', e.target.value)}
                            sx={textFieldStyle}
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Expense Contingencies */}
                    <TableRow>
                      <TableCell sx={{ pl: 3 }}>7</TableCell>
                      <TableCell>Expense Contingencies</TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          value={expenses['7'].number}
                          onChange={(e) => handleExpenseChange('7', 'number', e.target.value)}
                          sx={textFieldStyle}
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell align="right">{expenses['7'].number}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
fullWidth
                          value={expenses['7'].remarks}
                          onChange={(e) => handleExpenseChange('7', 'remarks', e.target.value)}
                          sx={textFieldStyle}
                        />
                      </TableCell>
                    </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow sx={summaryRowStyle}>
                    <TableCell colSpan={4} sx={tableCellStyle}>TOTAL EXPENSES (ODC)</TableCell>
                    <TableCell align="right" sx={tableCellStyle}>{calculateExpensesTotal()}</TableCell>
                    <TableCell sx={tableCellStyle}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

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

          {/* Submit Button */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              onClick={handleSubmit}
              disabled={submitting}
              loading={submitting}
              text={isUpdating ? 'Update Form' : 'Submit Form'}
              loadingText={isUpdating ? 'Updating...' : 'Submitting...'}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 1,
                fontWeight: 'bold',
                boxShadow: 2
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  );

  return (
    <FormWrapper>
      {formContent}

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </FormWrapper>
  );
};

export default JobStartForm;
