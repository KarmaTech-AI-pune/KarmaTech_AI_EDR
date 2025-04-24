import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import TableTemplate, { CustomRow } from './TableTemplate';
import { JobstartTimeProps, WBSResource } from '../../../types/jobStartFormTypes';

const JobstartTime = ({ wbsResources, onTotalCostChange }: JobstartTimeProps) => {
  const [tableData, setTableData] = useState<{
    resources: WBSResource[];
    customRows: CustomRow[];
  }>({
    resources: wbsResources,
    customRows: [
      {
        id: 'time-contingencies',
        prefix: '1b',
        title: 'Time Contingencies',
        hasRateField: true,
        hasUnitsField: true,
        unitSuffix: '%',
        budgetedCost: 0,
        remarks: ''
      }
    ]
  });

  // Notify parent component when data changes
  useEffect(() => {
    if (onTotalCostChange) {
      onTotalCostChange(tableData);
    }
  }, [tableData, onTotalCostChange]);

  const handleDataChange = (data: { resources: WBSResource[]; customRows: CustomRow[] }) => {
    setTableData(data);
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
        totalCalculationType='sumResourcesOnly' // Add this prop
      />
    </>
  );
};

export default JobstartTime;
