import { useState, useEffect } from 'react';
import { WBSRowData } from '../types/wbs';

interface UseWBSTotalsProps {
  manpowerRows: WBSRowData[];
  odcRows: WBSRowData[];
  formType: 'manpower' | 'odc';
}

export const useWBSTotals = ({ manpowerRows, odcRows, formType }: UseWBSTotalsProps) => {
  const [calculatedTotalHours, setCalculatedTotalHours] = useState<number>(0);
  const [calculatedTotalCost, setCalculatedTotalCost] = useState<number>(0);

  const calculateOverallTotals = () => {
    const currentRows = formType === 'manpower' ? manpowerRows : odcRows;
    const level3Rows = currentRows.filter(row => row.level === 3);
    const totalHours = level3Rows.reduce((sum, row) => sum + (row.totalHours || 0), 0);
    const totalCost = level3Rows.reduce((sum, row) => sum + row.totalCost, 0);
    return {
      totalHours: totalHours,
      totalCost: totalCost
    };
  };

  useEffect(() => {
    const { totalHours, totalCost } = calculateOverallTotals();
    setCalculatedTotalHours(totalHours);
    setCalculatedTotalCost(totalCost);
  }, [manpowerRows, odcRows, formType]);

  return {
    calculatedTotalHours,
    calculatedTotalCost,
  };
};
