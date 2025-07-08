import * as XLSX from 'xlsx';
import { monthlyReportData } from '../dummyapi/monthlyReportData';

export const exportToExcel = (month: string) => {
  console.log('Starting Excel export for month:', month);
  console.log('Monthly report data:', monthlyReportData);
  
  try {
    // Check if XLSX is properly imported
    if (!XLSX || !XLSX.utils || !XLSX.utils.book_new) {
      throw new Error('XLSX library not properly imported');
    }

    // Check if data exists
    if (!monthlyReportData) {
      throw new Error('Monthly report data is not available');
    }

    const wb = XLSX.utils.book_new();
    const ws_data = [];

    // Simple version first - just add basic data without complex styling
    console.log('Adding report title...');
    ws_data.push([`${month} Monthly Report`]);
    ws_data.push([]);

    // Financial and Contract Details
    if (monthlyReportData.financialAndContractDetails) {
      console.log('Adding financial details...');
      ws_data.push(['Financial and Contract Details']);
      Object.entries(monthlyReportData.financialAndContractDetails).forEach(([key, value]) => {
        ws_data.push([key, value]);
      });
      ws_data.push([]);
    }

    // Actual Cost
    if (monthlyReportData.actualCost) {
      console.log('Adding actual cost...');
      ws_data.push(['Actual Cost']);
      Object.entries(monthlyReportData.actualCost).forEach(([key, value]) => {
        ws_data.push([key, value]);
      });
      ws_data.push([]);
    }

    // CTC and EAC
    if (monthlyReportData.ctcAndEac) {
      console.log('Adding CTC and EAC...');
      ws_data.push(['CTC and EAC']);
      Object.entries(monthlyReportData.ctcAndEac).forEach(([key, value]) => {
        ws_data.push([key, value]);
      });
      ws_data.push([]);
    }

    // Schedule
    if (monthlyReportData.schedule) {
      console.log('Adding schedule...');
      ws_data.push(['Schedule']);
      Object.entries(monthlyReportData.schedule).forEach(([key, value]) => {
        ws_data.push([key, value]);
      });
      ws_data.push([]);
    }

    // Budget Table
    if (monthlyReportData.budgetTable) {
      console.log('Adding budget table...');
      ws_data.push(['Budget Table']);
      
      // Original Budget
      if (monthlyReportData.budgetTable.originalBudget) {
        ws_data.push(['Original Budget']);
        Object.entries(monthlyReportData.budgetTable.originalBudget).forEach(([key, value]) => {
          ws_data.push([key, value]);
        });
      }
      
      // Current Budget
      if (monthlyReportData.budgetTable.currentBudgetInMIS) {
        ws_data.push(['Current Budget in MIS']);
        Object.entries(monthlyReportData.budgetTable.currentBudgetInMIS).forEach(([key, value]) => {
          ws_data.push([key, value]);
        });
      }
      
      // Percent Complete
      if (monthlyReportData.budgetTable.percentCompleteOnCosts) {
        ws_data.push(['Percent Complete on Costs']);
        Object.entries(monthlyReportData.budgetTable.percentCompleteOnCosts).forEach(([key, value]) => {
          ws_data.push([key, value]);
        });
      }
      
      ws_data.push([]);
    }

    // Manpower Planning
    if (monthlyReportData.manpowerPlanning && monthlyReportData.manpowerPlanning.manpower) {
      console.log('Adding manpower planning...');
      ws_data.push(['Manpower Planning']);
      
      if (monthlyReportData.manpowerPlanning.manpower.length > 0) {
        const headers = Object.keys(monthlyReportData.manpowerPlanning.manpower[0]);
        ws_data.push(headers);
        
        monthlyReportData.manpowerPlanning.manpower.forEach(item => {
          ws_data.push(headers.map(header => (item as any)[header] || ''));
        });
      }
      ws_data.push([]);
    }

    // Progress Deliverable
    if (monthlyReportData.progressDeliverable && monthlyReportData.progressDeliverable.deliverables) {
      console.log('Adding progress deliverable...');
      ws_data.push(['Progress Deliverable']);
      
      if (monthlyReportData.progressDeliverable.deliverables.length > 0) {
        const headers = Object.keys(monthlyReportData.progressDeliverable.deliverables[0]);
        ws_data.push(headers);
        
        monthlyReportData.progressDeliverable.deliverables.forEach(item => {
          ws_data.push(headers.map(header => (item as any)[header] || ''));
        });
      }
      ws_data.push([]);
    }

    // Change Order
    if (monthlyReportData.changeOrder && monthlyReportData.changeOrder.length > 0) {
      console.log('Adding change order...');
      ws_data.push(['Change Order']);
      
      const headers = Object.keys(monthlyReportData.changeOrder[0]);
      ws_data.push(headers);
      
      monthlyReportData.changeOrder.forEach(item => {
        ws_data.push(headers.map(header => (item as any)[header] || ''));
      });
      ws_data.push([]);
    }

    // Programme Schedule
    if (monthlyReportData.programmeSchedule && monthlyReportData.programmeSchedule.length > 0) {
      console.log('Adding programme schedule...');
      ws_data.push(['Programme Schedule']);
      
      const headers = Object.keys(monthlyReportData.programmeSchedule[0]);
      ws_data.push(headers);
      
      monthlyReportData.programmeSchedule.forEach(item => {
        ws_data.push(headers.map(header => (item as any)[header] || ''));
      });
      ws_data.push([]);
    }

    // Early Warnings
    if (monthlyReportData.earlyWarnings && monthlyReportData.earlyWarnings.length > 0) {
      console.log('Adding early warnings...');
      ws_data.push(['Early Warnings']);
      
      const headers = Object.keys(monthlyReportData.earlyWarnings[0]);
      ws_data.push(headers);
      
      monthlyReportData.earlyWarnings.forEach(item => {
        ws_data.push(headers.map(header => (item as any)[header] || ''));
      });
      ws_data.push([]);
    }

    // Last Month Actions
    if (monthlyReportData.lastMonthActions && monthlyReportData.lastMonthActions.length > 0) {
      console.log('Adding last month actions...');
      ws_data.push(['Last Month Actions']);
      
      const headers = Object.keys(monthlyReportData.lastMonthActions[0]);
      ws_data.push(headers);
      
      monthlyReportData.lastMonthActions.forEach(item => {
        ws_data.push(headers.map(header => (item as any)[header] || ''));
      });
      ws_data.push([]);
    }

    // Current Month Actions
    if (monthlyReportData.currentMonthActions && monthlyReportData.currentMonthActions.length > 0) {
      console.log('Adding current month actions...');
      ws_data.push(['Current Month Actions']);
      
      const headers = Object.keys(monthlyReportData.currentMonthActions[0]);
      ws_data.push(headers);
      
      monthlyReportData.currentMonthActions.forEach(item => {
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

    console.log('Generating file...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${month}_Monthly_Report_${timestamp}.xlsx`;

    console.log('Attempting to write file:', filename);
    
    // Try the standard method first
    try {
      XLSX.writeFile(wb, filename);
      console.log('File written successfully using XLSX.writeFile');
      return true;
    } catch (writeError) {
      console.warn('XLSX.writeFile failed, trying alternative method:', writeError);
      
      // Alternative method using blob
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('File downloaded successfully using blob method');
      return true;
    }

  } catch (error) {
    console.error('Excel export error:', error);
    if (error instanceof Error) {
        console.error('Error stack:', error.stack);
    }
    
    // Re-throw the error so it can be caught by the calling function
    throw error;
  }
};
