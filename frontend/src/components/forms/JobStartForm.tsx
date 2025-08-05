import React, { useState, useEffect } from 'react'
import JobstartTime from './jobstartFormComponent/JobstartTime'
import EstimatedExpenses from './jobstartFormComponent/EstimatedExpenses'
import JobstartGrandTotal from './jobstartFormComponent/JobstartGrandTotal'
import JobstartSummary from './jobstartFormComponent/JobstartSummary'
import JobStartFormHeader from './jobstartFormComponent/JobStartFormHeader'
import { Container, Box, Paper, CircularProgress, Alert, Snackbar, Typography } from '@mui/material'
import { getWBSResourceData, submitJobStartForm, updateJobStartForm, getJobStartFormByProjectId } from '../../services/jobStartFormApi'
import { WBSResource } from '../../types/jobStartFormTypes'
import { CustomRow } from './jobstartFormComponent/TableTemplate'
import { useProject } from '../../context/ProjectContext'
import LoadingButton from '../common/LoadingButton'
import { projectApi } from '../../services/projectApi'; // Import projectApi from services
import { Project } from '../../models/projectModel'; // Import Project model

const JobStartForm: React.FC = () => {
  const { projectId } = useProject()
  const [wbsResources, setWbsResources] = useState<WBSResource[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // State to track total costs for different sections
  const [totalTimeCost, setTotalTimeCost] = useState<number>(0)
  const [totalODCExpensesCost, setTotalODCExpensesCost] = useState<number>(0)

  // State to track resources for Time and Expenses
  const [timeResources, setTimeResources] = useState<WBSResource[]>([])
  const [expensesResources, setExpensesResources] = useState<WBSResource[]>([])

  // State to track custom rows for Time and Expenses
  const [timeCustomRows, setTimeCustomRows] = useState<CustomRow[]>([
    {
      id: 'time-subtotal',
      prefix: '1b',
      title: 'Sub-Total',
      hasRateField: false,
      hasUnitsField: false,
      budgetedCost: 0,
      remarks: ''
    },
    {
      id: 'time-contingencies',
      prefix: '1c',
      title: 'Time Contingencies (LS)',
      hasRateField: false,
      hasUnitsField: true,
      unitSuffix: '%',
      budgetedCost: 0,
      units: 0,
      remarks: ''
    }
  ])

  const [expensesCustomRows, setExpensesCustomRows] = useState<CustomRow[]>([
    {
      id: 'expenses-subtotal',
      prefix: '2b',
      title: 'Sub-Total',
      hasRateField: false,
      hasUnitsField: false,
      budgetedCost: 0,
      remarks: ''
    },
    {
      id: 'expenses-contingencies',
      prefix: '2c',
      title: 'Contingencies (LS)',
      hasRateField: false,
      hasUnitsField: true,
      unitSuffix: '%',
      budgetedCost: 0,
      units: 0,
      remarks: ''
    },
    {
      id: 'expenses-expense-contingencies',
      prefix: '2d',
      title: 'Expense Contingencies (LS)',
      hasRateField: false,
      hasUnitsField: true,
      unitSuffix: '%',
      budgetedCost: 0,
      units: 0,
      remarks: ''
    }
  ])

  // State for summary data
  const [summaryData, setSummaryData] = useState({
    projectFees: 0,
    serviceTaxPercentage: 18,
    serviceTaxAmount: 0,
    totalProjectFees: 0,
    profit: 0,
    profitPercentage: 0
  })

  // State for form submission
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [formId, setFormId] = useState<number | null>(null)
  const [editMode, setEditMode] = useState<boolean>(true)
  const [formStatus, setFormStatus] = useState<string>('Initial')

  // State for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)
  const [snackbarMessage, setSnackbarMessage] = useState<string>('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setError('Project ID is missing')
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // First, try to fetch existing JobStartForm data
        let existingFormData = null;
        let existingResources: Record<string, any> = {};
        let existingCustomRows: Record<string, any> = {};
        let fetchedProject: Project | null = null; // To store fetched project data

        try {
          // Get data from /api/projects/{projectId}/jobstartforms
          const formData = await getJobStartFormByProjectId(projectId);
          if (formData && Array.isArray(formData) && formData.length > 0) {
            existingFormData = formData[0]; // Get the first form if multiple exist
            // Ensure formId is a number before setting it
            if (existingFormData.formId !== undefined) {
              setFormId(typeof existingFormData.formId === 'string'
                ? parseInt(existingFormData.formId)
                : existingFormData.formId);
            }
            setIsUpdating(true);

            // Set form status if available
            if (existingFormData.status) {
              setFormStatus(existingFormData.status);
              // If form is in review or approved, disable edit mode
              if (['Sent for Review', 'Sent for Approval', 'Approved', 'Review Changes', 'Approval Changes'].includes(existingFormData.status)) {
                setEditMode(false);
              }
            }

            // Set summary data from existing form
            setSummaryData({
              projectFees: existingFormData.projectFees || 0,
              serviceTaxPercentage: existingFormData.serviceTaxPercentage || 18,
              serviceTaxAmount: existingFormData.serviceTaxAmount || 0,
              totalProjectFees: existingFormData.totalProjectFees || 0,
              profit: existingFormData.profit || 0,
              profitPercentage: existingFormData.profitPercentage || 0
            });

            // Process existing resources and custom rows
            if (existingFormData.resources && Array.isArray(existingFormData.resources)) {
              // Create a map of existing resources by WBS task ID for easy lookup
              existingFormData.resources.forEach(resource => {
                if (resource.wbsTaskId) {
                  // Regular resource
                  existingResources[resource.wbsTaskId] = resource;
                } else if (resource.name) {
                  // Custom row (name field contains the row ID)
                  existingCustomRows[resource.name] = resource;
                }
              });
            }
          }
        } catch (err) {
          console.log('No existing JobStartForm found, creating a new one');
          // Continue with WBS data if no form exists
        }

        // Fetch Project data regardless of whether JobStartForm exists
        try {
          fetchedProject = await projectApi.getById(projectId);
          // If no existing JobStartForm data, initialize projectFees from fetched project
          if (!existingFormData) {
            setSummaryData(prev => ({
              ...prev,
              projectFees: fetchedProject?.estimatedProjectFee || 0
            }));
          }
        } catch (err) {
          console.error('Error fetching project data:', err);
          // Handle error, but don't block the form from loading
        }

        // Then fetch WBS resource data from /api/projects/{projectId}/jobstartforms/wbsresources
        const wbsData = await getWBSResourceData(projectId);

        // Transform the data from the API to match our WBSResource type
        const resources: WBSResource[] = wbsData.resourceAllocations.map((allocation: any) => {
          const taskId = allocation.taskId.toString()
          const existingResource = existingResources[taskId]

          return {
            id: taskId,
            taskType: allocation.taskType,
            description: allocation.taskTitle,
            rate: allocation.costRate,
            units: allocation.totalHours,
            budgetedCost: allocation.totalCost,
            // Use existing remarks if available, otherwise empty string
            remarks: existingResource?.remarks || '',
            employeeName: allocation.employeeName !== 'null' ? allocation.employeeName : null,
            name: allocation.name !== 'null' ? allocation.name : null
          }
        })

        setWbsResources(resources)

        // Set initial custom rows data if available
        if (Object.keys(existingCustomRows).length > 0) {
          // Create new arrays for custom rows with updated values
          const updatedTimeCustomRows = [...timeCustomRows];
          const updatedExpensesCustomRows = [...expensesCustomRows];

          // Update Time subtotal row remarks
          const timeSubtotalRow = existingCustomRows['time-subtotal'];
          if (timeSubtotalRow) {
            const timeSubtotalIndex = updatedTimeCustomRows.findIndex(row => row.id === 'time-subtotal');
            if (timeSubtotalIndex !== -1) {
              updatedTimeCustomRows[timeSubtotalIndex] = {
                ...updatedTimeCustomRows[timeSubtotalIndex],
                remarks: timeSubtotalRow.remarks || ''
              };
            }
          }

          // Update Time contingencies row
          const timeContingenciesRow = existingCustomRows['time-contingencies'];
          if (timeContingenciesRow) {
            const timeContingencyIndex = updatedTimeCustomRows.findIndex(row => row.id === 'time-contingencies');
            if (timeContingencyIndex !== -1) {
              updatedTimeCustomRows[timeContingencyIndex] = {
                ...updatedTimeCustomRows[timeContingencyIndex],
                units: timeContingenciesRow.units,
                remarks: timeContingenciesRow.remarks || ''
              };
            }
          }

          // Update Expenses subtotal row remarks
          const expensesSubtotalRow = existingCustomRows['expenses-subtotal'];
          if (expensesSubtotalRow) {
            const expensesSubtotalIndex = updatedExpensesCustomRows.findIndex(row => row.id === 'expenses-subtotal');
            if (expensesSubtotalIndex !== -1) {
              updatedExpensesCustomRows[expensesSubtotalIndex] = {
                ...updatedExpensesCustomRows[expensesSubtotalIndex],
                remarks: expensesSubtotalRow.remarks || ''
              };
            }
          }

          // Update Expenses contingencies row
          const expensesContingenciesRow = existingCustomRows['expenses-contingencies'];
          if (expensesContingenciesRow) {
            const expensesContingencyIndex = updatedExpensesCustomRows.findIndex(row => row.id === 'expenses-contingencies');
            if (expensesContingencyIndex !== -1) {
              updatedExpensesCustomRows[expensesContingencyIndex] = {
                ...updatedExpensesCustomRows[expensesContingencyIndex],
                units: expensesContingenciesRow.units,
                remarks: expensesContingenciesRow.remarks || ''
              };
            }
          }

          // Update Expense contingencies row
          const expenseExpenseContingenciesRow = existingCustomRows['expenses-expense-contingencies'];
          if (expenseExpenseContingenciesRow) {
            const expenseExpenseContingencyIndex = updatedExpensesCustomRows.findIndex(row => row.id === 'expenses-expense-contingencies');
            if (expenseExpenseContingencyIndex !== -1) {
              updatedExpensesCustomRows[expenseExpenseContingencyIndex] = {
                ...updatedExpensesCustomRows[expenseExpenseContingencyIndex],
                units: expenseExpenseContingenciesRow.units,
                remarks: expenseExpenseContingenciesRow.remarks || ''
              };
            }
          }

          // Set the updated custom rows
          setTimeCustomRows(updatedTimeCustomRows);
          setExpensesCustomRows(updatedExpensesCustomRows);

          // Log the updated custom rows for debugging
          console.log('Updated Time Custom Rows:', updatedTimeCustomRows);
          console.log('Updated Expenses Custom Rows:', updatedExpensesCustomRows);
        }

        setLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again later.')
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  // If no project is selected, show a warning
  if (!projectId) {
    return (
      <Container>
        <Alert severity="warning">No project selected</Alert>
      </Container>
    );
  }

  // Handler for snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  // Handler for edit mode toggle
  const handleEditModeToggle = () => {
    setEditMode(!editMode);
  };

  // Handler for status update
  const handleStatusUpdate = (newStatus: string) => {
    setFormStatus(newStatus);
    // If form is in review or approved, disable edit mode
    if (['Sent for Review', 'Sent for Approval', 'Approved', 'Review Changes', 'Approval Changes'].includes(newStatus)) {
      setEditMode(false);
    }
  };

  // Handler for form submission
  const handleSubmit = async () => {
    if (!projectId) {
      setSnackbarSeverity('error')
      setSnackbarMessage('Project ID is missing')
      setSnackbarOpen(true)
      return
    }

    try {
      setSubmitting(true)

      // Prepare form data
      const formData = {
        projectId: Number(projectId),
        formId: formId || 0,
        time: {
          totalTimeCost: totalTimeCost
        },
        expenses: {
          totalExpenses: totalODCExpensesCost
        },
        grandTotal: totalTimeCost + totalODCExpensesCost,
        projectFees: summaryData.projectFees,
        serviceTax: {
          percentage: summaryData.serviceTaxPercentage,
          amount: summaryData.serviceTaxAmount
        },
        totalProjectFees: summaryData.totalProjectFees,
        profit: summaryData.profit,
        profitPercentage: summaryData.profitPercentage,
        // Add resources for backend storage
        resources: [
          // Regular time resources
          ...timeResources.map(resource => ({
            wbsTaskId: typeof resource.id === 'string' ? parseInt(resource.id) : resource.id,
            taskType: 0, // Manpower/Time
            description: resource.description,
            rate: resource.rate,
            units: resource.units,
            budgetedCost: resource.budgetedCost,
            remarks: resource.remarks || '',
            employeeName: resource.employeeName || '',
            name: resource.name || ''
          })),
          // Time custom rows (subtotal, contingencies)
          ...timeCustomRows.map(row => ({
            wbsTaskId: null, // No WBS task ID for custom rows
            taskType: 0, // Manpower/Time
            description: row.title,
            rate: 0, // Custom rows don't have rates
            units: row.units || 0,
            budgetedCost: row.budgetedCost || 0,
            remarks: row.remarks || '',
            employeeName: '', // No employee name for custom rows
            name: row.id // Use the row ID as the name to identify it
          })),
          // Regular expenses resources
          ...expensesResources.map(resource => ({
            wbsTaskId: typeof resource.id === 'string' ? parseInt(resource.id) : resource.id,
            taskType: 1, // ODC/Expenses
            description: resource.description,
            rate: resource.rate,
            units: resource.units,
            budgetedCost: resource.budgetedCost,
            remarks: resource.remarks || '',
            employeeName: resource.employeeName || '',
            name: resource.name || ''
          })),
          // Expenses custom rows (subtotal, contingencies, expense contingencies)
          ...expensesCustomRows.map(row => ({
            wbsTaskId: null, // No WBS task ID for custom rows
            taskType: 1, // ODC/Expenses
            description: row.title,
            rate: 0, // Custom rows don't have rates
            units: row.units || 0,
            budgetedCost: row.budgetedCost || 0,
            remarks: row.remarks || '',
            employeeName: '', // No employee name for custom rows
            name: row.id // Use the row ID as the name to identify it
          }))
        ]
      }

      let result
      if (isUpdating && formId) {
        // Update existing form
        result = await updateJobStartForm(projectId, formId, formData)
        setSnackbarMessage('Job Start Form updated successfully')
      } else {
        // Create new form
        result = await submitJobStartForm(projectId, formData)
        setFormId(result.formId)
        setIsUpdating(true)
        setSnackbarMessage('Job Start Form submitted successfully')
      }

      setSnackbarSeverity('success')
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Error submitting Job Start Form:', err)
      setSnackbarSeverity('error')
      setSnackbarMessage('Failed to submit Job Start Form. Please try again.')
      setSnackbarOpen(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
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
            <JobStartFormHeader
              title="PMD1. Job Start Form"
              projectId={projectId}
              formId={formId !== null ? formId : undefined}
              status={formStatus}
              editMode={editMode}
              onEditModeToggle={handleEditModeToggle}
              onStatusUpdate={handleStatusUpdate}
            />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
            ) : (
              <>

                <JobstartTime
                  wbsResources={wbsResources.filter(resource => resource.taskType === 0)}
                  initialTimeContingencyUnits={timeCustomRows.find(row => row.id === 'time-contingencies')?.units}
                  initialTimeContingencyRemarks={timeCustomRows.find(row => row.id === 'time-contingencies')?.remarks}
                  initialSubtotalRemarks={timeCustomRows.find(row => row.id === 'time-subtotal')?.remarks}
                  onTotalCostChange={(data) => {
                    // Calculate total using only the time-related custom rows (subtotal and contingencies)
                    const timeTotal = data.customRows
                      .filter(row =>
                        row.id === 'time-subtotal' ||
                        row.id === 'time-contingencies'
                      )
                      .reduce((sum, row) => sum + (row.budgetedCost || 0), 0);

                    // Save the resources and custom rows for submission
                    setTimeResources(data.resources);
                    setTimeCustomRows(data.customRows);
                    setTotalTimeCost(timeTotal);
                  }}
                />
                <EstimatedExpenses
                  wbsResources={wbsResources.filter(resource => resource.taskType === 1)}
                  initialContingencyUnits={expensesCustomRows.find(row => row.id === 'expenses-contingencies')?.units}
                  initialContingencyRemarks={expensesCustomRows.find(row => row.id === 'expenses-contingencies')?.remarks}
                  initialExpenseContingencyUnits={expensesCustomRows.find(row => row.id === 'expenses-expense-contingencies')?.units}
                  initialExpenseContingencyRemarks={expensesCustomRows.find(row => row.id === 'expenses-expense-contingencies')?.remarks}
                  initialSubtotalRemarks={expensesCustomRows.find(row => row.id === 'expenses-subtotal')?.remarks}
                  onTotalCostChange={(data) => {
                    // Calculate total using only the expense-related custom rows
                    const expensesTotal = data.customRows
                      .filter(row =>
                        row.id === 'expenses-subtotal' ||
                        row.id === 'expenses-contingencies' ||
                        row.id === 'expenses-expense-contingencies'
                      )
                      .reduce((sum, row) => sum + (row.budgetedCost || 0), 0);

                    // Save the resources and custom rows for submission
                    setExpensesResources(data.resources);
                    setExpensesCustomRows(data.customRows);
                    setTotalODCExpensesCost(expensesTotal);
                  }}
                />
                <JobstartGrandTotal
                  timeCost={totalTimeCost}
                  odcExpensesCost={totalODCExpensesCost}
                />
                <JobstartSummary
                  grandTotal={totalTimeCost + totalODCExpensesCost}
                  initialProjectFees={summaryData.projectFees}
                  initialServiceTaxPercentage={summaryData.serviceTaxPercentage}
                  onDataChange={setSummaryData}
                />

                {/* Submit Button */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <LoadingButton
                    onClick={handleSubmit}
                    disabled={
                      submitting ||
                      ['Sent for Review', 'Sent for Approval', 'Approved'].includes(formStatus)
                    }
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
              </>
            )}
          </Paper>
        </Box>

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
    </Container>
  );
}

export default JobStartForm
