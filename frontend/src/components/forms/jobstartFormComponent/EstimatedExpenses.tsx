import { useState } from 'react';
import { Box } from '@mui/material';
import TableTemplate, { CustomRow } from './TableTemplate';
import { EstimatedExpensesProps, WBSResource } from '../../../types/jobStartFormTypes';

const EstimatedExpenses = ({ wbsResources }: EstimatedExpensesProps) => {
  const [tableData, setTableData] = useState<{
    resources: WBSResource[];
    customRows: CustomRow[];
  }>({
    resources: wbsResources,
    customRows: []
  });

  const handleDataChange = (data: { resources: WBSResource[]; customRows: CustomRow[] }) => {
    setTableData(data);
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
      />
    </>
  );
};

export default EstimatedExpenses;
