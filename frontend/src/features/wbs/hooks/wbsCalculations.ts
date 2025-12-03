import { WBSRowData } from '../types/wbs';

export const calculateChildTotals = (parentRow: WBSRowData, allRows: WBSRowData[], months: string[]) => {
  let childRows: WBSRowData[] = [];
  if (parentRow.level === 1) {
    const level2Children = allRows.filter(r => r.level === 2 && r.parentId === parentRow.id);
    level2Children.forEach(l2 => {
      childRows = childRows.concat(allRows.filter(r => r.level === 3 && r.parentId === l2.id));
    });
  } else if (parentRow.level === 2) {
    childRows = allRows.filter(r => r.level === 3 && r.parentId === parentRow.id);
  }

  const totals = {
    plannedHours: {} as { [key: string]: { [key: string]: number } },
    totalHours: 0,
    odc: 0,
    odcHours: 0,
    totalCost: 0
  };

  childRows.forEach(child => {
    months.forEach(month => {
      const [monthName, yearStr] = month.split(' ');
      const year = `20${yearStr}`;
      const monthlyHours = child.plannedHours[year]?.[monthName] || 0;

      if (!totals.plannedHours[year]) {
        totals.plannedHours[year] = {};
      }
      totals.plannedHours[year][monthName] = (totals.plannedHours[year][monthName] || 0) + monthlyHours;
    });

    totals.totalHours += child.totalHours;
    totals.odc += child.odc;
    totals.odcHours += child.odcHours || 0;
    totals.totalCost += child.totalCost;
  });

  return totals;
};
