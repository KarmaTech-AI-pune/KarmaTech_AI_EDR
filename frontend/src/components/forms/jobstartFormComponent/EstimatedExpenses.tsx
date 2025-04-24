import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import TableTemplate, { CustomRow } from './TableTemplate';
import { EstimatedExpensesProps, WBSResource } from '../../../types/jobStartFormTypes';
import { addCalculation, percentageCalculation } from '../../../utils/calculations';

const EstimatedExpenses = ({ wbsResources, onTotalCostChange }: EstimatedExpensesProps) => {
  const [tableData, setTableData] = useState<{
    resources: WBSResource[];
    customRows: CustomRow[];
  }>({
    resources: wbsResources,
    customRows: [
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
        unitPrefix: '%',
        budgetedCost: 0,
        remarks: ''
      },
      {
        id: 'expenses-expense-contingencies',
        prefix: '2d',
        title: 'Expense Contingencies (LS)',
        hasRateField: false,
        hasUnitsField: true,
        unitPrefix: '%',
        budgetedCost: 0,
        remarks: ''
      }
    ]
  });

  // Calculate subtotal and contingencies whenever resources change
  useEffect(() => {
    updateCalculations(tableData.resources, tableData.customRows);
  }, [tableData.resources]);

  // Notify parent component when data changes
  useEffect(() => {
    if (onTotalCostChange) {
      onTotalCostChange(tableData);
    }
  }, [tableData, onTotalCostChange]);

  const updateCalculations = (resources: WBSResource[], customRows: CustomRow[]) => {
    // Calculate subtotal from all resources
    const subtotal = addCalculation(...resources.map(resource => resource.budgetedCost));
    
    // Find the custom rows by id
    const subtotalRow = customRows.find(row => row.id === 'expenses-subtotal');
    const contingenciesRow = customRows.find(row => row.id === 'expenses-contingencies');
    const expenseContingenciesRow = customRows.find(row => row.id === 'expenses-expense-contingencies');
    
    // Update the subtotal row
    if (subtotalRow) {
      subtotalRow.budgetedCost = subtotal;
    }
    
    // Calculate contingencies based on percentage if units are provided
    if (contingenciesRow && contingenciesRow.units) {
      contingenciesRow.budgetedCost = percentageCalculation(contingenciesRow.units, subtotal);
    }
    
    // Calculate expense contingencies based on percentage if units are provided
    if (expenseContingenciesRow && expenseContingenciesRow.units) {
      expenseContingenciesRow.budgetedCost = percentageCalculation(expenseContingenciesRow.units, subtotal);
    }
    
    // Update the state with the new calculations
    setTableData(prevData => ({
      ...prevData,
      customRows: [...customRows]
    }));
  };

  const handleDataChange = (data: { resources: WBSResource[]; customRows: CustomRow[] }) => {
    // First update the data
    setTableData(data);
    
    // Then run calculations to update the custom rows
    updateCalculations(data.resources, data.customRows);
  };

  return (
    <>
      <TableTemplate
        title="2.0 ESTIMATED EXPENSES"
        sectionId="expenses"
        sectionPrefix="2a"
        headerTitle="ODC Expenses"
        resources={tableData.resources}
        totalLabel="Total ODC Expenses"
        initialExpanded={true}
        customRows={tableData.customRows}
        onDataChange={handleDataChange}
        totalCalculationType='sumExpenseContingencies' // Add this prop
      />
    </>
  );
};

export default EstimatedExpenses;
