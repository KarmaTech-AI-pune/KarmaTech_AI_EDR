import { getJobStartFormByProjectId } from './jobStartFormApi';
import { WBSStructureAPI } from './wbsApi';
import { projectApi } from './projectApi';
import { MonthlyProgressSchemaType } from '../schemas/monthlyProgress/MonthlyProgressSchema';
import { addCalculation, percentageCalculation } from '../utils/calculations';
import { MonthlyProgressAPI, ManpowerResourcesResponse, MonthlyHourDto } from './monthlyProgressApi';

// Define types for the expected API responses for better type safety
interface JobStartData {
  projectFees: number | null;
  serviceTaxPercentage: number | null;
  grandTotal: number;
  profitPercentage: number;
  // Add other properties from the job start form API response as needed
}

import { WBSRowData } from '../types/wbs';

type WBSData = WBSRowData[];

interface ProjectData {
  feeType: 'lumpsum' | 'timeAndExpense' | 'percentage';
  startDate: string | null;
  endDate: string | null;
  // Add other properties from the project API response as needed
}

const transformDataForMonthlyProgress = (
  jobStartResult: PromiseSettledResult<JobStartData[]>,
  wbsResult: PromiseSettledResult<WBSData>,
  projectResult: PromiseSettledResult<ProjectData>,
  manpowerResult: PromiseSettledResult<ManpowerResourcesResponse>
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
        if(transformedData.budgetTable.originalBudget){
            transformedData.budgetTable.originalBudget.revenueFee = jobStart.projectFees || 0;
            transformedData.budgetTable.originalBudget.cost = jobStart.grandTotal || 0;
            transformedData.budgetTable.originalBudget.profitPercentage = jobStart.profitPercentage || 0;
            
        }
        if(transformedData.budgetTable.currentBudgetInMIS){
            transformedData.budgetTable.currentBudgetInMIS.revenueFee = jobStart.projectFees || 0;
        }
    }
  }

  // Process WBS data if the promise was fulfilled
  if (wbsResult.status === 'fulfilled' && wbsResult.value) {
    const wbsData = wbsResult.value;
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
      transformedData.schedule.dateOfIssueWOLOI = project.startDate;
      transformedData.schedule.completionDateAsPerContract = project.endDate;
      transformedData.schedule.completionDateAsPerExtension = project.endDate;
      transformedData.schedule.expectedCompletionDate = project.endDate;
    }
  }
  
  if (manpowerResult.status === 'fulfilled' && manpowerResult.value) {
    const getMonthlyHours = (monthlyHours: MonthlyHourDto[]) => {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
      const currentYear = currentDate.getFullYear();
      
      const nextDate = new Date(currentDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      const nextMonth = nextDate.toLocaleString('default', { month: 'long' });
      const nextYear = nextDate.getFullYear();
      
      const currentMonthData = monthlyHours?.find(item => 
        item.month === currentMonth && item.year === currentYear
      );
      
      const nextMonthData = monthlyHours?.find(item => 
        item.month === nextMonth && item.year === nextYear
      );
      
      return {
        currentMonthHours: currentMonthData?.plannedHours || 0,
        nextMonthHours: nextMonthData?.plannedHours || 0
      };
    };
    const manpowerData = manpowerResult.value.resources.map(resource => {
      const { currentMonthHours, nextMonthHours } = getMonthlyHours(resource.monthlyHours);
      return {
        workAssignment: resource.taskTitle,
        assignee: resource.employeeName,
        planned: currentMonthHours,
        consumed: null,
        balance: currentMonthHours,
        nextMonthPlanning: nextMonthHours,
        manpowerComments: ""
      };
    });

    const plannedTotal = manpowerData.reduce((sum, entry) => sum + (entry.planned || 0), 0);
    const nextMonthPlanningTotal = manpowerData.reduce((sum, entry) => sum + (entry.nextMonthPlanning || 0), 0);

    if (transformedData.manpowerPlanning) {
      transformedData.manpowerPlanning.manpower = manpowerData;
      transformedData.manpowerPlanning.manpowerTotal = {
        plannedTotal: plannedTotal,
        consumedTotal: 0,
        balanceTotal: plannedTotal,
        nextMonthPlanningTotal: nextMonthPlanningTotal,
      };
    }
  }

  return transformedData;
};

export const getAggregatedMonthlyProgressData = async (
  projectId: string
): Promise<Partial<MonthlyProgressSchemaType>> => {
  const results = await Promise.allSettled([
    getJobStartFormByProjectId(projectId),
    WBSStructureAPI.getProjectWBS(projectId),
    projectApi.getById(projectId),
    MonthlyProgressAPI.getManpowerResources(projectId),
  ]);

  const [jobStartResult, wbsResult, projectResult, manpowerResult] = results;

  // Basic error logging. In a real app, you might want a more robust logging service.
  results.forEach(result => {
    if (result.status === 'rejected') {
      console.error('API call failed:', result.reason);
    }
  });

  return transformDataForMonthlyProgress(
    jobStartResult as PromiseSettledResult<JobStartData[]>,
    wbsResult as PromiseSettledResult<WBSData>,
    projectResult as PromiseSettledResult<ProjectData>,
    manpowerResult as PromiseSettledResult<ManpowerResourcesResponse>
  );
};

export const getMonthlyProgressData = async (
  projectId: string,
  year: number,
  month: number
): Promise<Partial<MonthlyProgressSchemaType>> => {
  try {
    const monthlyProgressData = await MonthlyProgressAPI.getMonthlyReportByYearMonth(
      projectId,
      year,
      month
    );

    // Check if the response is not null and has keys, indicating existing data
    if (monthlyProgressData && Object.keys(monthlyProgressData).length > 0) {
      const aggregatedData = await getAggregatedMonthlyProgressData(projectId);
      return {
        ...aggregatedData,
        ...monthlyProgressData,
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
  const aggregatedData = await getAggregatedMonthlyProgressData(projectId);
  return aggregatedData;
};
