import React, { useState, useEffect, useContext } from 'react'
import { FormWrapper } from './FormWrapper'
import JobstartTime from './jobstartFormComponent/JobstartTime'
import EstimatedExpenses from './jobstartFormComponent/EstimatedExpenses'
import JobstartGrandTotal from './jobstartFormComponent/JobstartGrandTotal'
import JobstartSummary from './jobstartFormComponent/JobstartSummary'
import { Container, Box, Paper, Typography, CircularProgress, Alert } from '@mui/material'
import { getWBSResourceData } from '../../services/jobStartFormApi'
import { WBSResource } from '../../types/jobStartFormTypes'
import { projectManagementAppContext } from '../../App'
import { projectManagementAppContextType } from '../../types'

const JobStartForm: React.FC = () => {
  const context = useContext<projectManagementAppContextType | null>(projectManagementAppContext)
  const [wbsResources, setWbsResources] = useState<WBSResource[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // State to track total costs for different sections
  const [totalTimeCost, setTotalTimeCost] = useState<number>(0)
  const [totalODCExpensesCost, setTotalODCExpensesCost] = useState<number>(0)

  // Get project ID from context
  const projectId = context?.selectedProject?.id?.toString()

  useEffect(() => {
    const fetchWBSResourceData = async () => {
      if (!projectId) {
        setError('Project ID is missing')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getWBSResourceData(projectId)

        // Transform the data from the API to match our WBSResource type
        const resources: WBSResource[] = data.resourceAllocations.map((allocation: any) => ({
          id: allocation.taskId,
          taskType: allocation.taskType,
          description: allocation.taskTitle,
          rate: allocation.costRate,
          units: allocation.totalHours,
          budgetedCost: allocation.totalCost,
          remarks: '',
          employeeName: allocation.employeeName !== 'null' ? allocation.employeeName : null,
          name: allocation.name !== 'null' ? allocation.name : null
        }))

        setWbsResources(resources)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching WBS resource data:', err)
        setError('Failed to load WBS resource data. Please try again later.')
        setLoading(false)
      }
    }

    fetchWBSResourceData()
  }, [projectId])

  // If context is not available, show an error
  if (!context) {
    return (
      <Container>
        <Alert severity="error">Context not available</Alert>
      </Container>
    );
  }

  // If no project is selected, show a warning
  if (!projectId) {
    return (
      <Container>
        <Alert severity="warning">No project selected</Alert>
      </Container>
    );
  }

  return (
    <FormWrapper>
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
                  onTotalCostChange={(data) => {
                    // Calculate total from resources and custom rows
                    const resourcesCost = data.resources.reduce((sum, resource) => sum + resource.budgetedCost, 0);
                    const customRowsCost = data.customRows.reduce((sum, row) => sum + (row.budgetedCost || 0), 0);
                    setTotalTimeCost(resourcesCost + customRowsCost);
                  }}
                />
                <EstimatedExpenses
                  wbsResources={wbsResources.filter(resource => resource.taskType === 1)}
                  onTotalCostChange={(data) => {
                    // Calculate total from resources and custom rows
                    const resourcesCost = data.resources.reduce((sum, resource) => sum + resource.budgetedCost, 0);
                    const customRowsCost = data.customRows.reduce((sum, row) => sum + (row.budgetedCost || 0), 0);
                    setTotalODCExpensesCost(resourcesCost + customRowsCost);
                  }}
                />
                <JobstartGrandTotal
                  timeCost={totalTimeCost}
                  odcExpensesCost={totalODCExpensesCost}
                />
                <JobstartSummary />
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </FormWrapper>
  )
}

export default JobStartForm
