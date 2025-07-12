import { getJobStartFormByProjectId } from './jobStartFormApi';
import { WBSStructureAPI } from './wbsApi';
import { projectApi } from './projectApi';
import { MonthlyProgressSchemaType } from '../schemas/monthlyProgress/MonthlyProgressSchema';
import { addCalculation, percentageCalculation } from '../utils/calculations';

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
  projectResult: PromiseSettledResult<ProjectData>
): Partial<MonthlyProgressSchemaType> => {
  const transformedData: Partial<MonthlyProgressSchemaType> = {
    financialAndContractDetails: {
      net: null,
      serviceTax: null,
      feeTotal: null,
      budgetOdcs: null,
      budgetStaff: null,
      BudgetSubTotal: null,
      contractType: 'lumpsum',
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
    }
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
      transformedData.financialAndContractDetails.BudgetSubTotal = addCalculation(budgetOdcs, budgetStaff);
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
      transformedData.schedule.dateOfIssueWOLOI = project.startDate ? new Date(project.startDate) : null;
      transformedData.schedule.completionDateAsPerContract = project.endDate ? new Date(project.endDate) : null;
      transformedData.schedule.completionDateAsPerExtension = project.endDate ? new Date(project.endDate) : null;
      transformedData.schedule.expectedCompletionDate = project.endDate ? new Date(project.endDate) : null;
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
  ]);

  const [jobStartResult, wbsResult, projectResult] = results;

  // Basic error logging. In a real app, you might want a more robust logging service.
  results.forEach(result => {
    if (result.status === 'rejected') {
      console.error('API call failed:', result.reason);
    }
  });

  return transformDataForMonthlyProgress(
    jobStartResult as PromiseSettledResult<JobStartData[]>,
    wbsResult as PromiseSettledResult<WBSData>,
    projectResult as PromiseSettledResult<ProjectData>
  );
};
