import { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import JobstartTime from './JobstartTime';
import EstimatedExpenses from './EstimatedExpenses';
import JobstartGrandTotal from './JobstartGrandTotal';
import { WBSResource } from '../../../types/jobStartFormTypes';

const JobstartForm = () => {
  // Example data - in a real app, this would come from an API or parent component
  const timeResources: WBSResource[] = [
    {
      id: 1,
      taskType: 0,
      description: 'Project Manager',
      rate: 1000,
      units: 10,
      budgetedCost: 10000,
      remarks: null,
      employeeName: 'John Doe'
    },
    {
      id: 2,
      taskType: 0,
      description: 'Developer',
      rate: 800,
      units: 20,
      budgetedCost: 16000,
      remarks: null,
      employeeName: 'Jane Smith'
    }
  ];

  const expenseResources: WBSResource[] = [
    {
      id: 3,
      taskType: 1,
      description: 'Equipment',
      rate: 5000,
      units: 1,
      budgetedCost: 5000,
      remarks: null,
      name: 'Laptop'
    },
    {
      id: 4,
      taskType: 1,
      description: 'Software License',
      rate: 2000,
      units: 2,
      budgetedCost: 4000,
      remarks: null,
      name: 'IDE License'
    }
  ];

  // State to track total costs for different sections
  const [totalTimeCost, setTotalTimeCost] = useState<number>(0);
  const [totalODCExpensesCost, setTotalODCExpensesCost] = useState<number>(0);

  // Callback function to get updated costs from JobstartTime component
  const handleTimeDataChange = (data: { resources: WBSResource[], customRows: any[] }) => {
    // Calculate total from resources and custom rows
    const resourcesCost = data.resources.reduce((sum, resource) => sum + resource.budgetedCost, 0);
    const customRowsCost = data.customRows.reduce((sum, row) => sum + (row.budgetedCost || 0), 0);
    setTotalTimeCost(resourcesCost + customRowsCost);
  };

  // Callback function to get updated costs from EstimatedExpenses component
  const handleExpensesDataChange = (data: { resources: WBSResource[], customRows: any[] }) => {
    // Calculate total from resources and custom rows (including contingencies)
    const resourcesCost = data.resources.reduce((sum, resource) => sum + resource.budgetedCost, 0);
    const customRowsCost = data.customRows.reduce((sum, row) => sum + (row.budgetedCost || 0), 0);
    setTotalODCExpensesCost(resourcesCost + customRowsCost);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Time section */}
        <JobstartTime 
          wbsResources={timeResources} 
          onTotalCostChange={handleTimeDataChange}
        />
        
        {/* Expenses section */}
        <EstimatedExpenses 
          wbsResources={expenseResources} 
          onTotalCostChange={handleExpensesDataChange}
        />
        
        {/* Grand Total section */}
        <JobstartGrandTotal 
          timeCost={totalTimeCost} 
          odcExpensesCost={totalODCExpensesCost} 
        />
      </Box>
    </Container>
  );
};

export default JobstartForm; 