import * as XLSX from 'xlsx';
import { MonthlyReport } from './monthlyProgressApi';
import { getMonthName } from '../utils/dateUtils';

export const exportToExcel = (reportData: MonthlyReport): Blob => {
  console.log('Starting Excel export for month:', reportData.month);
  
  try {
    // Check if XLSX is properly imported
    if (!XLSX || !XLSX.utils || !XLSX.utils.book_new) {
      throw new Error('XLSX library not properly imported');
    }

    // Check if data exists
    if (!reportData) {
      throw new Error('Monthly report data is not available');
    }

    const wb = XLSX.utils.book_new();
    const ws_data = [];

    // Simple version first - just add basic data without complex styling
    console.log('Adding report title...');
    ws_data.push([`${getMonthName(reportData.month)} ${reportData.year} Report`]);
    ws_data.push([]);

    // Financial and Contract Details
    if (reportData.financialAndContractDetails) {
      console.log('Adding financial details...');
      ws_data.push(['Financial and Contract Details']);
      Object.entries(reportData.financialAndContractDetails).forEach(([key, value]) => {
        ws_data.push([key, value]);
      });
      ws_data.push([]);
    }

    // Actual Cost
    if (reportData.actualCost) {
      console.log('Adding actual cost...');
      ws_data.push(['Actual Cost']);
      Object.entries(reportData.actualCost).forEach(([key, value]) => {
        ws_data.push([key, value]);
      });
      ws_data.push([]);
    }

    // CTC and EAC
    if (reportData.ctcAndEac) {
      console.log('Adding CTC and EAC...');
      ws_data.push(['CTC and EAC']);
      Object.entries(reportData.ctcAndEac).forEach(([key, value]) => {
        ws_data.push([key, value]);
      });
      ws_data.push([]);
    }

    // Schedule
    if (reportData.schedule) {
      console.log('Adding schedule...');
      ws_data.push(['Schedule']);
      Object.entries(reportData.schedule).forEach(([key, value]) => {
        ws_data.push([key, value]);
      });
      ws_data.push([]);
    }

    // Budget Table
    if (reportData.budgetTable) {
      console.log('Adding budget table...');
      ws_data.push(['Budget Table']);
      
      // Original Budget
      if (reportData.budgetTable.originalBudget) {
        ws_data.push(['Original Budget']);
        Object.entries(reportData.budgetTable.originalBudget).forEach(([key, value]) => {
          ws_data.push([key, value]);
        });
      }
      
      // Current Budget
      if (reportData.budgetTable.currentBudgetInMIS) {
        ws_data.push(['Current Budget in MIS']);
        Object.entries(reportData.budgetTable.currentBudgetInMIS).forEach(([key, value]) => {
          ws_data.push([key, value]);
        });
      }
      
      // Percent Complete
      if (reportData.budgetTable.percentCompleteOnCosts) {
        ws_data.push(['Percent Complete on Costs']);
        Object.entries(reportData.budgetTable.percentCompleteOnCosts).forEach(([key, value]) => {
          ws_data.push([key, value]);
        });
      }
      
      ws_data.push([]);
    }

    // Manpower Planning
    if (reportData.manpowerPlanning && reportData.manpowerPlanning.manpower) {
      console.log('Adding manpower planning...');
      ws_data.push(['Manpower Planning']);
      
      if (reportData.manpowerPlanning.manpower.length > 0) {
        const headers = Object.keys(reportData.manpowerPlanning.manpower[0]);
        ws_data.push(headers);
        
        reportData.manpowerPlanning.manpower.forEach(item => {
          ws_data.push(headers.map(header => (item as any)[header] || ''));
        });
      }
      ws_data.push([]);
    }

    // Progress Deliverable
    if (reportData.progressDeliverable && reportData.progressDeliverable.deliverables) {
      console.log('Adding progress deliverable...');
      ws_data.push(['Progress Deliverable']);
      
      if (reportData.progressDeliverable.deliverables.length > 0) {
        const headers = Object.keys(reportData.progressDeliverable.deliverables[0]);
        ws_data.push(headers);
        
        reportData.progressDeliverable.deliverables.forEach(item => {
          ws_data.push(headers.map(header => (item as any)[header] || ''));
        });
      }
      ws_data.push([]);
    }

    // Change Order
    if (reportData.changeOrder && reportData.changeOrder.length > 0) {
      console.log('Adding change order...');
      ws_data.push(['Change Order']);
      
      const headers = Object.keys(reportData.changeOrder[0]);
      ws_data.push(headers);
      
      reportData.changeOrder.forEach(item => {
        ws_data.push(headers.map(header => (item as any)[header] || ''));
      });
      ws_data.push([]);
    }

    // Programme Schedule
    if (reportData.programmeSchedule && reportData.programmeSchedule.length > 0) {
      console.log('Adding programme schedule...');
      ws_data.push(['Programme Schedule']);
      
      const headers = Object.keys(reportData.programmeSchedule[0]);
      ws_data.push(headers);
      
      reportData.programmeSchedule.forEach(item => {
        ws_data.push(headers.map(header => (item as any)[header] || ''));
      });
      ws_data.push([]);
    }

    // Early Warnings
    if (reportData.earlyWarnings && reportData.earlyWarnings.length > 0) {
      console.log('Adding early warnings...');
      ws_data.push(['Early Warnings']);
      
      const headers = Object.keys(reportData.earlyWarnings[0]);
      ws_data.push(headers);
      
      reportData.earlyWarnings.forEach(item => {
        ws_data.push(headers.map(header => (item as any)[header] || ''));
      });
      ws_data.push([]);
    }

    // Last Month Actions
    if (reportData.lastMonthActions && reportData.lastMonthActions.length > 0) {
      console.log('Adding last month actions...');
      ws_data.push(['Last Month Actions']);
      
      const headers = Object.keys(reportData.lastMonthActions[0]);
      ws_data.push(headers);
      
      reportData.lastMonthActions.forEach(item => {
        ws_data.push(headers.map(header => (item as any)[header] || ''));
      });
      ws_data.push([]);
    }

    // Current Month Actions
    if (reportData.currentMonthActions && reportData.currentMonthActions.length > 0) {
      console.log('Adding current month actions...');
      ws_data.push(['Current Month Actions']);
      
      const headers = Object.keys(reportData.currentMonthActions[0]);
      ws_data.push(headers);
      
      reportData.currentMonthActions.forEach(item => {
        ws_data.push(headers.map(header => (item as any)[header] || ''));
      });
      ws_data.push([]);
    }

    console.log('Creating worksheet...');
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    console.log('Setting column widths...');
    // Set column widths
    const maxCols = Math.max(...ws_data.map(row => row.length));
    const colWidths = [];
    for (let C = 0; C < maxCols; C++) {
      let maxLength = 10; // minimum width
      for (let R = 0; R < ws_data.length; R++) {
        if (ws_data[R] && ws_data[R][C] != null) {
          const cellLength = ws_data[R][C].toString().length;
          maxLength = Math.max(maxLength, cellLength);
        }
      }
      colWidths.push({ wch: Math.min(maxLength + 2, 50) });
    }
    ws['!cols'] = colWidths;

    console.log('Adding worksheet to workbook...');
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/octet-stream' });

  } catch (error) {
    console.error('Excel export error:', error);
    if (error instanceof Error) {
        console.error('Error stack:', error.stack);
    }
    
    // Re-throw the error so it can be caught by the calling function
    throw error;
  }
};
