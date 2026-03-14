import { getJobStartFormByProjectId } from './jobStartFormApi';
import { WBSStructureAPI } from '../features/wbs/services/wbsApi';
import { projectApi } from './projectApi';
import { MonthlyProgressSchemaType } from '../schemas/monthlyProgress/MonthlyProgressSchema';
import { addCalculation, percentageCalculation } from '../utils/calculations';
import { MonthlyProgressAPI, ManpowerResourcesResponse, MonthlyHourDto } from './monthlyProgressApi';
import { formatDateForInput } from '../utils/dateUtils';

// Define types for the expected API responses for better type safety
interface JobStartData {
  projectFees: number | null;
  serviceTaxPercentage: number | null;
  grandTotal: number;
  profitPercentage: number;
  // Add other properties from the job start form API response as needed
}

import { WBSRowData } from '../features/wbs/types/wbs';

interface WBSResponse {
  wbsHeaderId: number;
  tasks: WBSRowData[];
  workBreakdownStructures: any[];
}

interface ProjectData {
  feeType: 'lumpsum' | 'timeAndExpense' | 'percentage';
  startDate: string | null;
  endDate: string | null;
  // Add other properties from the project API response as needed
}

interface AssigneeProgressDto {
  assigneeId: string | null;
  assigneeName: string;
  month: string;
  estimatedHours: number;
  actualHours: number;
  remainingHours: number;
}

const transformDataForMonthlyProgress = (
  jobStartResult: PromiseSettledResult<JobStartData[]>,
  wbsResult: PromiseSettledResult<WBSResponse>,
  projectResult: PromiseSettledResult<ProjectData>,
  manpowerResult: PromiseSettledResult<ManpowerResourcesResponse>,
  assigneeProgressResult: PromiseSettledResult<AssigneeProgressDto[]>,
  selectedYear?: number,
  selectedMonth?: number
): Partial<MonthlyProgressSchemaType> => {
  const transformedData: Partial<MonthlyProgressSchemaType> = {
    financialAndContractDetails: {
      net: null,
      serviceTax: null,
      feeTotal: null,
      budgetOdcs: null,
      budgetStaff: null,
      budgetSubTotal: null,
      contractType: 'lumpsum',
    },
    actualCost: {
      priorCumulativeOdc: null,
      priorCumulativeStaff: null,
      priorCumulativeTotal: null,
      actualOdc: null,
      actualStaff: null,
      actualSubtotal: null,
      totalCumulativeOdc: null,
      totalCumulativeStaff: null,
      totalCumulativeCost: null,
    },
    ctcAndEac: {
      ctcODC: null,
      ctcStaff: null,
      ctcSubtotal: null,
      actualctcODC: null,
      actualCtcStaff: null,
      actualCtcSubtotal: null,
      eacOdc: null,
      eacStaff: null,
      totalEAC: null,
      grossProfitPercentage: null,
    },
    budgetTable: {
      originalBudget: {
        cost: null,
        revenueFee: null,
        profitPercentage: null,
      },
      currentBudgetInMIS: {
        revenueFee: null,
        cost: null,
        profitPercentage: null,
      },
      percentCompleteOnCosts: {
        revenueFee: null,
        cost: null,
      }
    },
    schedule: {
      dateOfIssueWOLOI: null,
      completionDateAsPerContract: null,
      completionDateAsPerExtension: null,
      expectedCompletionDate: null,
    },
    manpowerPlanning: {
      manpower: [],
      manpowerTotal: {
        plannedTotal: 0,
        consumedTotal: 0,
        balanceTotal: 0,
        nextMonthPlanningTotal: 0,
      },
    },
    progressDeliverable: {
      deliverables: [],
      totalPaymentDue: null,
    },
    changeOrder: [],
    programmeSchedule: [],
    earlyWarnings: [],
    lastMonthActions: [],
    currentMonthActions: [],
  };

  // Process JobStart data if the promise was fulfilled
  if (jobStartResult.status === 'fulfilled' && jobStartResult.value && jobStartResult.value.length > 0) {
    const jobStart = jobStartResult.value[0];
    if (transformedData.financialAndContractDetails) {
      const net = jobStart.projectFees ?? 0;
      const serviceTax = jobStart.serviceTaxPercentage ?? 0;
      transformedData.financialAndContractDetails.net = net;
      transformedData.financialAndContractDetails.serviceTax = serviceTax;
      const taxAmount = percentageCalculation(serviceTax, net);
      transformedData.financialAndContractDetails.feeTotal = addCalculation(net, taxAmount);
    }
    if (transformedData.budgetTable) {
      if (transformedData.budgetTable.originalBudget) {
        transformedData.budgetTable.originalBudget.revenueFee = jobStart.projectFees || 0;
        transformedData.budgetTable.originalBudget.cost = jobStart.grandTotal || 0;
        transformedData.budgetTable.originalBudget.profitPercentage = jobStart.profitPercentage || 0;

      }
      if (transformedData.budgetTable.currentBudgetInMIS) {
        transformedData.budgetTable.currentBudgetInMIS.revenueFee = jobStart.projectFees || 0;
      }
    }
  }

  // Process WBS data if the promise was fulfilled
  if (wbsResult.status === 'fulfilled' && wbsResult.value) {
    const wbsData = wbsResult.value.tasks || [];
    const budgetOdcs = wbsData
      .filter(row => row.taskType === 1)
      .reduce((sum, row) => sum + (row.totalCost || 0), 0);
    const budgetStaff = wbsData
      .filter(row => row.taskType === 0)
      .reduce((sum, row) => sum + (row.totalCost || 0), 0);

    if (transformedData.financialAndContractDetails) {
      transformedData.financialAndContractDetails.budgetOdcs = budgetOdcs;
      transformedData.financialAndContractDetails.budgetStaff = budgetStaff;
      transformedData.financialAndContractDetails.budgetSubTotal = addCalculation(budgetOdcs, budgetStaff);
    }
  }

  // Process Project data if the promise was fulfilled
  if (projectResult.status === 'fulfilled' && projectResult.value) {
    const project = projectResult.value;
    if (transformedData.financialAndContractDetails) {
      if (project.feeType) {
        let normalizedFeeType = project.feeType.toLowerCase().replace('&', 'And');
        if (normalizedFeeType === 'timeandexpense' || normalizedFeeType === 'timeAndexpense') {
          normalizedFeeType = 'timeAndExpense';
        }
        transformedData.financialAndContractDetails.contractType = normalizedFeeType as 'lumpsum' | 'timeAndExpense' | 'percentage';
      } else {
        transformedData.financialAndContractDetails.contractType = 'lumpsum';
      }
    }
    if (transformedData.schedule) {
      transformedData.schedule.dateOfIssueWOLOI = formatDateForInput(project.startDate) || null;
      transformedData.schedule.completionDateAsPerContract = formatDateForInput(project.endDate) || null;
      transformedData.schedule.completionDateAsPerExtension = formatDateForInput(project.endDate) || null;
      transformedData.schedule.expectedCompletionDate = formatDateForInput(project.endDate) || null;
    }
  }

  if (manpowerResult.status === 'fulfilled' && manpowerResult.value) {
    console.log('🚀 Processing manpower data...');
    console.log('📅 Selected month/year:', { selectedMonth, selectedYear });
    
    const getMonthlyHours = (plannedHours: MonthlyHourDto[]) => {
      // Use selected month/year if provided, otherwise use current date
      const targetDate = selectedYear && selectedMonth 
        ? new Date(selectedYear, selectedMonth - 1, 1)
        : new Date();
      
      const currentMonth = targetDate.toLocaleString('default', { month: 'long' });
      const currentYear = targetDate.getFullYear();

      const nextDate = new Date(targetDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      const nextMonth = nextDate.toLocaleString('default', { month: 'long' });
      const nextYear = nextDate.getFullYear();

      const currentMonthData = plannedHours?.find(item =>
        item.month === currentMonth && item.year === currentYear
      );

      const nextMonthData = plannedHours?.find(item =>
        item.month === nextMonth && item.year === nextYear
      );

      return {
        currentMonthHours: currentMonthData?.plannedHours || 0,
        nextMonthHours: nextMonthData?.plannedHours || 0
      };
    };
    const manpowerData = manpowerResult.value.resources.map(resource => {
      const { currentMonthHours, nextMonthHours } = getMonthlyHours(resource.plannedHours);
      
      // Get assignee progress data for this employee
      let consumedHours = 0; // employeeLoggedHours
      let approvedHours = 0; // actualHours
      
      if (assigneeProgressResult.status === 'fulfilled' && assigneeProgressResult.value) {
        const targetDate = selectedYear && selectedMonth 
          ? new Date(selectedYear, selectedMonth - 1, 1)
          : new Date();
        
        const targetMonth = targetDate.toLocaleString('default', { month: 'long' });
        const targetYear = targetDate.getFullYear();
        const targetMonthYear = `${targetMonth} ${targetYear}`;
        
        const normalizeString = (str: string) => 
          str?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
        
        const normalizedEmployeeName = normalizeString(resource.employeeName);
        
        const match = assigneeProgressResult.value.find(ap => {
          const nameMatch = normalizeString(ap.assigneeName) === normalizedEmployeeName;
          const monthMatch = normalizeString(ap.month) === normalizeString(targetMonthYear);
          return nameMatch && monthMatch;
        });
        
        if (match) {
          consumedHours = match.employeeLoggedHours; // Logged hours
          approvedHours = match.actualHours; // Actual hours
        }
      }
      
      console.log('📋 Entry:', {
        name: resource.employeeName,
        rate: resource.costRate,
        planned: currentMonthHours,
        consumed: consumedHours,
        approved: approvedHours,
        balance: currentMonthHours - consumedHours
      });
      
      return {
        workAssignment: resource.taskTitle,
        assignee: resource.employeeName,
        rate: resource.costRate || 0,
        planned: currentMonthHours,
        consumed: consumedHours,
        approved: approvedHours,
        balance: currentMonthHours - approvedHours,
        payment: (resource.costRate && consumedHours) ? resource.costRate * consumedHours : 0,
        extraHours: consumedHours - approvedHours,
        extraCost: (consumedHours - approvedHours) * (resource.costRate || 0),
        nextMonthPlanning: nextMonthHours,
        manpowerComments: ""
      };
    });

    const plannedTotal = manpowerData.reduce((sum, entry) => sum + (entry.planned || 0), 0);
    const consumedTotal = manpowerData.reduce((sum, entry) => sum + (entry.consumed || 0), 0);
    const paymentTotal = manpowerData.reduce((sum, entry) => sum + (entry.payment || 0), 0);
    const balanceTotal = plannedTotal - consumedTotal;
    const nextMonthPlanningTotal = manpowerData.reduce((sum, entry) => sum + (entry.nextMonthPlanning || 0), 0);

    console.log('📊 Summary:', {
      total: manpowerData.length,
      plannedTotal,
      consumedTotal,
      balanceTotal,
      withActualHours: manpowerData.filter(e => e.consumed > 0).length
    });

    if (transformedData.manpowerPlanning) {
      transformedData.manpowerPlanning.manpower = manpowerData;
      transformedData.manpowerPlanning.manpowerTotal = {
        plannedTotal,
        consumedTotal,
        paymentTotal,
        balanceTotal,
        nextMonthPlanningTotal,
      };
    }
  }

  return transformedData;
};

export const getAggregatedMonthlyProgressData = async (
  projectId: string,
  year?: number,
  month?: number
): Promise<Partial<MonthlyProgressSchemaType>> => {
  const results = await Promise.allSettled([
    getJobStartFormByProjectId(projectId),
    WBSStructureAPI.getProjectWBS(projectId),
    projectApi.getById(projectId),
    MonthlyProgressAPI.getManpowerResources(projectId),
    MonthlyProgressAPI.getAssigneeProgress(projectId),
  ]);

  const [jobStartResult, wbsResult, projectResult, manpowerResult, assigneeProgressResult] = results;

  // Basic error logging. In a real app, you might want a more robust logging service.
  results.forEach(result => {
    if (result.status === 'rejected') {
      console.error('API call failed:', result.reason);
    }
  });

  return transformDataForMonthlyProgress(
    jobStartResult as PromiseSettledResult<JobStartData[]>,
    wbsResult as PromiseSettledResult<WBSResponse>,
    projectResult as PromiseSettledResult<ProjectData>,
    manpowerResult as PromiseSettledResult<ManpowerResourcesResponse>,
    assigneeProgressResult as PromiseSettledResult<AssigneeProgressDto[]>,
    year,
    month
  );
};

export const getMonthlyProgressData = async (
  projectId: string,
  year: number,
  month: number
): Promise<Partial<MonthlyProgressSchemaType>> => {
  let previousMonthData: Partial<MonthlyProgressSchemaType> = {};

  // Calculate previous month and year
  let previousMonth = month - 1;
  let previousYear = year;
  if (previousMonth === 0) {
    previousMonth = 12;
    previousYear -= 1;
  }

  try {
    // Attempt to fetch previous month's data
    const prevMonthReport = await MonthlyProgressAPI.getMonthlyReportByYearMonth(
      projectId,
      previousYear,
      previousMonth
    );
    if (prevMonthReport && prevMonthReport.actualCost) {
      previousMonthData = {
        actualCost: {
          priorCumulativeOdc: prevMonthReport.actualCost.totalCumulativeOdc ?? null,
          priorCumulativeStaff: prevMonthReport.actualCost.totalCumulativeStaff ?? null,
          priorCumulativeTotal: prevMonthReport.actualCost.totalCumulativeCost ?? null,
          actualOdc: null, // These are for the current month, so initialize as null
          actualStaff: null,
          actualSubtotal: null,
          totalCumulativeOdc: null,
          totalCumulativeStaff: null,
          totalCumulativeCost: null,
        },
        lastMonthActions: prevMonthReport.currentMonthActions || [],
      };
    }
  } catch (error) {
    console.info(
      `No previous month's report found for ${previousYear}-${previousMonth}.`,
      error
    );
  }

  try {
    const monthlyProgressData = await MonthlyProgressAPI.getMonthlyReportByYearMonth(
      projectId,
      year,
      month
    );

    // Check if the response is not null and has keys, indicating existing data
    if (monthlyProgressData && Object.keys(monthlyProgressData).length > 0) {
      const aggregatedData = await getAggregatedMonthlyProgressData(projectId, year, month);
      
      // Format schedule dates before merging
      const formattedSchedule = monthlyProgressData.schedule ? {
        ...monthlyProgressData.schedule,
        dateOfIssueWOLOI: formatDateForInput(monthlyProgressData.schedule.dateOfIssueWOLOI) || null,
        completionDateAsPerContract: formatDateForInput(monthlyProgressData.schedule.completionDateAsPerContract) || null,
        completionDateAsPerExtension: formatDateForInput(monthlyProgressData.schedule.completionDateAsPerExtension) || null,
        expectedCompletionDate: formatDateForInput(monthlyProgressData.schedule.expectedCompletionDate) || null,
      } : undefined;

      return {
        ...aggregatedData,
        ...previousMonthData, // Merge previous month's data
        ...monthlyProgressData,
        ...(formattedSchedule ? { schedule: formattedSchedule } : {}),
        lastMonthActions: previousMonthData.lastMonthActions || monthlyProgressData.lastMonthActions || [],
      };
    }
  } catch (error) {
    // If getMonthlyReportByYearMonth fails (e.g., 404 Not Found), log it and proceed.
    console.info(
      `No existing monthly progress report for ${year}-${month}. Fetching initial data.`,
      error
    );
  }

  // If no existing data or if the fetch failed, get aggregated data
  const aggregatedData = await getAggregatedMonthlyProgressData(projectId, year, month);
  return {
    ...aggregatedData,
    ...previousMonthData, // Merge previous month's data even if current month data is new
    lastMonthActions: previousMonthData.lastMonthActions || [],
  };
};
