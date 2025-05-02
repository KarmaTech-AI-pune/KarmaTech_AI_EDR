import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import TableTemplate, { CustomRow } from './TableTemplate';
import { JobstartTimeProps, WBSResource } from '../../../types/jobStartFormTypes';
import { addCalculation, percentageCalculation } from '../../../utils/calculations';

const JobstartTime = ({
  wbsResources,
  initialTimeContingencyUnits,
  initialTimeContingencyRemarks,
  initialSubtotalRemarks,
  onTotalCostChange
}: JobstartTimeProps) => {
  const [tableData, setTableData] = useState<{
    resources: WBSResource[];
    customRows: CustomRow[];
  }>({
    resources: wbsResources,
    customRows: [
      {
        id: 'time-subtotal',
        prefix: '1b',
        title: 'Sub-Total',
        hasRateField: false,
        hasUnitsField: false,
        budgetedCost: 0,
        remarks: initialSubtotalRemarks || ''
      },
      {
        id: 'time-contingencies',
        prefix: '1c',
        title: 'Time Contingencies (LS)',
        hasRateField: false,
        hasUnitsField: true,
        unitSuffix: '%',
        budgetedCost: 0,
        units: initialTimeContingencyUnits,
        remarks: initialTimeContingencyRemarks || ''
      }
    ]
  });

  // Update when initial values change
  useEffect(() => {
    if (initialTimeContingencyUnits !== undefined ||
        initialTimeContingencyRemarks !== undefined ||
        initialSubtotalRemarks !== undefined) {
      setTableData(prevData => {
        const updatedCustomRows = prevData.customRows.map(row => {
          if (row.id === 'time-contingencies') {
            return {
              ...row,
              units: initialTimeContingencyUnits !== undefined ? initialTimeContingencyUnits : row.units,
              remarks: initialTimeContingencyRemarks !== undefined ? initialTimeContingencyRemarks : row.remarks
            };
          }
          if (row.id === 'time-subtotal' && initialSubtotalRemarks !== undefined) {
            return {
              ...row,
              remarks: initialSubtotalRemarks
            };
          }
          return row;
        });

        return {
          ...prevData,
          customRows: updatedCustomRows
        };
      });
    }
  }, [initialTimeContingencyUnits, initialTimeContingencyRemarks, initialSubtotalRemarks]);

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
    const subtotalRow = customRows.find(row => row.id === 'time-subtotal');
    const contingenciesRow = customRows.find(row => row.id === 'time-contingencies');

    // Update the subtotal row
    if (subtotalRow) {
      subtotalRow.budgetedCost = subtotal;
    }

    // Calculate contingencies based on percentage if units are provided
    if (contingenciesRow && contingenciesRow.units !== undefined && contingenciesRow.units !== null) {
      contingenciesRow.budgetedCost = percentageCalculation(contingenciesRow.units, subtotal);
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
        title="1.0 TIME"
        sectionId="time"
        sectionPrefix="1a"
        headerTitle="Employee Personnel"
        resources={tableData.resources}
        totalLabel="Total Time Cost"
        initialExpanded={true}
        customRows={tableData.customRows}
        onDataChange={handleDataChange}
        totalCalculationType='sumTimeContingencies' // Use the new calculation type for time-related rows
      />
    </>
  );
};

export default JobstartTime;
