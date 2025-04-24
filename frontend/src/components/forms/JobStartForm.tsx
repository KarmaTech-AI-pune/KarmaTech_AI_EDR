import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Container,
  Snackbar,
  Alert
} from '@mui/material';
import LoadingButton from '../common/LoadingButton'; // Corrected path
import { projectManagementAppContext } from '../../App';
import { projectManagementAppContextType, JobStartFormData } from '../../types';
import { FormWrapper } from './FormWrapper';
import {
  submitJobStartForm,
  getJobStartFormByProjectId,
  updateJobStartForm,
  getWBSResourceData
} from '../../services/jobStartFormApi';
import {
  EmployeeAllocation,
  TimeContingencyEntry,
  ExpensesType,
  OutsideAgencyType,
  ProjectSpecificType,
      ExpenseEntry,
      ServiceTaxEntry,
      OutsideAgencyEntry,
      ProjectSpecificEntry // Added missing import
    } from '../../types/jobStartForm';
import { formatTitle } from '../../utils/jobStartFormUtils';
import {
  textFieldStyle,
  tableHeaderStyle,
  tableCellStyle,
  accordionStyle,
  sectionStyle,
  summaryRowStyle
} from '../../utils/jobStartFormStyles';
import TimeSection from './JobStartFormComponents/TimeSection';
import ExpensesSection from './JobStartFormComponents/ExpensesSection';
import SummarySection from './JobStartFormComponents/SummarySection';

const JobStartForm: React.FC = () => {
  const context = useContext<projectManagementAppContextType | null>(projectManagementAppContext);
  const [employeeAllocations, setEmployeeAllocations] = useState<EmployeeAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentFormId, setCurrentFormId] = useState<number | string | null>(null);

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
        setLoading(true);
        setError(null);

        const wbsResourceData = await getWBSResourceData(context.selectedProject?.id?.toString() || '');

        const employeeMap = new Map<string, EmployeeAllocation>();

        // Process the resource allocations from the backend
        wbsResourceData.resourceAllocations.forEach((allocation: any) => {
          const employeeId = allocation.employeeId;

          // Determine the correct name based on task type
          let displayName;
          if (allocation.taskType === 1) { // TaskType.ODC = 1
            // For ODC tasks, use the name field
            displayName = allocation.name;
          } else {
            // For Manpower tasks, use the employeeName field
            displayName = allocation.employeeName;
          }

          if (!employeeMap.has(employeeId)) {
            employeeMap.set(employeeId, {
              id: employeeId,
              name: displayName,
              is_consultant: allocation.isConsultant,
              allocations: [],
              totalHours: 0,
              totalCost: 0,
              remarks: ''
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

        setEmployeeAllocations(Array.from(employeeMap.values()));

      } catch (error) {
        console.error('Error fetching WBS resource data:', error);
        setError('Failed to load WBS resource data. Please ensure you have submitted a WBS form for this project.');
      } finally {
        setLoading(false);
      }
    };

    fetchWBSResourceData();
  }, [context?.selectedProject?.id]);

  // Effect for loading existing Job Start Form data or falling back to local storage
  useEffect(() => {
    const loadFormData = async () => {
      const projectId = context?.selectedProject?.id?.toString();
      if (!projectId) return;

      setLoading(true);
      setIsUpdating(false);
      setCurrentFormId(null);

      try {
        const responseArray = await getJobStartFormByProjectId(projectId);

        if (responseArray && Array.isArray(responseArray) && responseArray.length > 0) {
          const backendDto = responseArray[0];
          console.log('Flat DTO loaded from backend:', backendDto);

          setProjectFees(backendDto.projectFees?.toString() ?? '');
          setServiceTax({ percentage: backendDto.serviceTaxPercentage?.toString() ?? '18' });

          setIsUpdating(true);
          setCurrentFormId(backendDto.formId);

          setLoading(false);
          return;
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

          setEmployeeAllocations(parsedData.time.employeeAllocations);
          setTimeContingency(parsedData.time.timeContingency);
          setExpenses(parsedData.expenses.regularExpenses);
          setSurveyWorks(parsedData.expenses.surveyWorks);
          setOutsideAgency(parsedData.expenses.outsideAgency);
          setProjectSpecific(parsedData.expenses.projectSpecific);
          setProjectFees(parsedData.projectFees?.toString() ?? '');
          setServiceTax({ percentage: parsedData.serviceTax.percentage?.toString() ?? '18' });

          if (parsedData.formId) {
            setIsUpdating(true);
            setCurrentFormId(parsedData.formId);
          } else {
            setIsUpdating(false);
            setCurrentFormId(null);
          }
        } else {
          console.log('No form data found in local storage either. Starting fresh.');
          setIsUpdating(false);
          setCurrentFormId(null);
        }
      } catch (e) {
        console.error("Error reading or parsing local storage data:", e);
        setIsUpdating(false);
        setCurrentFormId(null);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [context?.selectedProject?.id]);

  // Handler functions
  const handleRemarksChange = (employeeId: string, value: string) => {
    setEmployeeAllocations((prevAllocations: EmployeeAllocation[]) =>
      prevAllocations.map(emp =>
        emp.id === employeeId ? { ...emp, remarks: value } : emp
      )
    );
  };

  const handleTimeContingencyChange = (field: keyof TimeContingencyEntry, value: string) => {
    setTimeContingency((prev: TimeContingencyEntry) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpenseChange = (id: keyof ExpensesType, field: keyof ExpenseEntry, value: string) => {
    setExpenses((prev: ExpensesType) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSurveyWorksChange = (field: keyof ExpenseEntry, value: string) => {
    setSurveyWorks((prev: ExpenseEntry) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOutsideAgencyChange = (id: keyof OutsideAgencyType, field: keyof OutsideAgencyEntry, value: string) => {
    setOutsideAgency((prev: OutsideAgencyType) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleProjectSpecificChange = (id: keyof ProjectSpecificType, field: keyof ProjectSpecificEntry, value: string) => {
    setProjectSpecific((prev: ProjectSpecificType) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleProjectFeesChange = (value: string) => {
    setProjectFees(value);
  };

  const handleServiceTaxChange = (value: string) => {
    setServiceTax((prev: ServiceTaxEntry) => ({
      ...prev,
      percentage: value
    }));
  };

  // Calculation functions
  const calculateTotalCost = (employees: EmployeeAllocation[], isConsultant: boolean) => {
    return employees
      .filter(emp => emp.is_consultant === isConsultant)
      .reduce((total, emp) => total + emp.totalCost, 0);
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
    Object.values(expenses).forEach((entry: ExpenseEntry) => {
      total += Number(entry.number) || 0;
    });
    // Add survey works
    total += Number(surveyWorks.number) || 0;
    // Add up outside agency entries (rate * units)
    Object.values(outsideAgency).forEach((entry: OutsideAgencyEntry) => {
      total += calculateOutsideAgencyCost(entry);
    });
    // Add up project specific entries
    Object.values(projectSpecific).forEach((entry: ProjectSpecificEntry) => {
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

  const handleSubmit = async () => {
    const projectId = context?.selectedProject?.id;
    if (!projectId) {
      setSnackbarMessage('No project selected. Cannot submit.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      // Collect all form data into the structure expected by the API
      const formData: JobStartFormData = {
        projectId: projectId,
        formId: isUpdating ? Number(currentFormId) : undefined,
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
      };

      let response;
      if (isUpdating && currentFormId) {
        console.log(`Attempting to update form ID: ${currentFormId} for project: ${projectId}`);
        response = await updateJobStartForm(projectId, currentFormId, formData);
        setSnackbarMessage('Job Start Form updated successfully');
      } else {
        console.log(`Attempting to create new form for project: ${projectId}`);
        response = await submitJobStartForm(projectId, formData);
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
          <TimeSection
            employeeAllocations={employeeAllocations}
            timeContingency={timeContingency}
            onRemarksChange={handleRemarksChange}
            onTimeContingencyChange={handleTimeContingencyChange}
            calculateTotalCost={calculateTotalCost}
            calculateTimeContingencyCost={calculateTimeContingencyCost}
            calculateTotalTimeCost={calculateTotalTimeCost}
            expanded={expanded}
            handleAccordionChange={handleAccordionChange}
            textFieldStyle={textFieldStyle}
            tableHeaderStyle={tableHeaderStyle}
            tableCellStyle={tableCellStyle}
            accordionStyle={accordionStyle}
            sectionStyle={sectionStyle}
            summaryRowStyle={summaryRowStyle}
            formatTitle={formatTitle}
          />

          {/* Expenses Section */}
          <ExpensesSection
            expenses={expenses}
            surveyWorks={surveyWorks}
            outsideAgency={outsideAgency}
            projectSpecific={projectSpecific}
            onExpenseChange={handleExpenseChange}
            onSurveyWorksChange={handleSurveyWorksChange}
            onOutsideAgencyChange={handleOutsideAgencyChange}
            onProjectSpecificChange={handleProjectSpecificChange}
            calculateOutsideAgencyCost={calculateOutsideAgencyCost}
            calculateExpensesTotal={calculateExpensesTotal}
            expanded={expanded}
            handleAccordionChange={handleAccordionChange}
            textFieldStyle={textFieldStyle}
            tableHeaderStyle={tableHeaderStyle}
            tableCellStyle={tableCellStyle}
            accordionStyle={accordionStyle}
            sectionStyle={sectionStyle}
            summaryRowStyle={summaryRowStyle}
          />

          {/* Summary Section */}
          <SummarySection
            projectFees={projectFees}
            serviceTax={serviceTax}
            onProjectFeesChange={handleProjectFeesChange}
            onServiceTaxChange={handleServiceTaxChange}
            calculateGrandTotal={calculateGrandTotal}
            calculateProfit={calculateProfit}
            calculateServiceTax={calculateServiceTax}
            calculateTotalProjectFees={calculateTotalProjectFees}
            textFieldStyle={textFieldStyle}
            tableCellStyle={tableCellStyle}
            sectionStyle={sectionStyle}
          />

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
