import { axiosInstance } from './axiosConfig';
// Removed unused imports from ../data/types/dashboard

// DTO Interfaces matching Backend
export interface PendingFormDto {
    formType: string;
    formId: number;
    projectId: number;
    statusId: number;
    formName: string;
    projectName: string;
    holdingUserName: string;
}

export interface PendingFormsResponseDto {
    totalPendingForms: number;
    pendingForms: PendingFormDto[];
}

export interface TaskPriorityItemDto {
    id: number;
    title: string;
    project: string;
    assignee: string;
    category: 'urgent_important' | 'important_not_urgent' | 'urgent_not_important' | 'neither';
}

export interface TotalRevenueExpectedDto {
    totalRevenue: number;
    changeDescription: string;
    changeType: string;
}

export interface TotalRevenueActualDto {
    totalRevenue: number;
    changeDescription: string;
    changeType: string;
}

export interface ProfitMarginDto {
    profitMargin: number;
    changeDescription: string;
    changeType: string;
}

export interface RevenueAtRiskDto {
    revenueAtRisk: number;
    projectsAffectedDescription: string;
    changeType: string;
}

export interface ProjectAtRiskDto {
    projectId: number;
    projectName: string;
    priority: string;
    region: string;
    status: string;
    delayDays: number;
    budgetSpent: number;
    budgetTotal: number;
    budgetPercentage: number;
    issues: string[];
    manager: string;
}

export interface ProjectsAtRiskResponseDto {
    criticalCount: number;
    projects: ProjectAtRiskDto[];
}

export interface MonthlyCashflowDto {
    month: string;
    planned: number;
    actual: number;
    variance: number;
}

export interface RegionalPortfolioDto {
    region: string;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    revenue: number;
    profit: number;
}

export interface NpvProfitabilityDto {
    currentNpv: number;
    highProfitProjectsCount: number;
    mediumProfitProjectsCount: number;
    lowProfitProjectsCount: number;
    whatIfAnalysis: string;
}

export interface MilestoneBillingDto {
    id: number;
    project: string;
    milestone: string;
    expectedAmount: number;
    status: string;
    daysDelayed: number;
    penalty: number;
}

export interface ProjectDashboardDto {
    projectId: number;
    projectName: string;
    totalRevenueExpected: number;
    revenueChangeDescription: string;
    revenueChangeType: 'positive' | 'negative' | 'neutral';
    totalRevenueActual: number;
    profitMargin: number;
    profitMarginChangeDescription: string;
    profitMarginChangeType: 'positive' | 'negative' | 'neutral';
    currentNpv: number;
    whatIfAnalysis: string;
    budgetTotal: number;
    budgetSpent: number;
    budgetPercentage: number;
    pendingForms: PendingFormDto[];
    milestones: MilestoneBillingDto[];
    monthlyCashflow: MonthlyCashflowDto[];
    projectsAtRisk: ProjectAtRiskDto[];
    regionalPortfolio: RegionalPortfolioDto[];
    taskPriorityMatrix: TaskPriorityItemDto[];
}

// Service object
export const dashboardService = {
    getPendingForms: async (): Promise<PendingFormsResponseDto> => {
        const response = await axiosInstance.get<PendingFormsResponseDto>('api/Dashboard/pending-forms');
        return response.data;
    },

    getTotalRevenueExpected: async (): Promise<TotalRevenueExpectedDto> => {
        const response = await axiosInstance.get<TotalRevenueExpectedDto>('api/Dashboard/total-revenue-expected');
        return response.data;
    },

    getTotalRevenueActual: async (): Promise<TotalRevenueActualDto> => {
        const response = await axiosInstance.get<TotalRevenueActualDto>('api/Dashboard/total-revenue-actual');
        return response.data;
    },

    getProfitMargin: async (): Promise<ProfitMarginDto> => {
        const response = await axiosInstance.get<ProfitMarginDto>('api/Dashboard/profit-margin');
        return response.data;
    },

    getRevenueAtRisk: async (): Promise<RevenueAtRiskDto> => {
        const response = await axiosInstance.get<RevenueAtRiskDto>('api/Dashboard/revenue-at-risk');
        return response.data;
    },

    getProjectsAtRisk: async (): Promise<ProjectsAtRiskResponseDto> => {
        const response = await axiosInstance.get<ProjectsAtRiskResponseDto>('api/Dashboard/projects-at-risk');
        return response.data;
    },

    getMonthlyCashflow: async (): Promise<MonthlyCashflowDto[]> => {
        const response = await axiosInstance.get<MonthlyCashflowDto[]>('api/Dashboard/monthly-cashflow');
        return response.data;
    },

    getRegionalPortfolio: async (): Promise<RegionalPortfolioDto[]> => {
        const response = await axiosInstance.get<RegionalPortfolioDto[]>('api/Dashboard/regional-portfolio');
        return response.data;
    },

    getNpvProfitability: async (): Promise<NpvProfitabilityDto> => {
        const response = await axiosInstance.get<NpvProfitabilityDto>('api/Dashboard/npv-profitability');
        return response.data;
    },

    getMilestoneBilling: async (): Promise<MilestoneBillingDto[]> => {
        const response = await axiosInstance.get<MilestoneBillingDto[]>('api/Dashboard/milestone-billing');
        return response.data;
    },

    getProjectDashboard: async (projectId: number): Promise<ProjectDashboardDto> => {
        const response = await axiosInstance.get<ProjectDashboardDto>(`api/ProjectDashboard/project/${projectId}`);
        return response.data;
    },

    getTaskPriorityMatrix: async (): Promise<TaskPriorityItemDto[]> => {
        const response = await axiosInstance.get<TaskPriorityItemDto[]>('api/Dashboard/task-priority-matrix');
        return response.data;
    },

    getProgramDashboard: async (programId: number): Promise<any> => {
        const response = await axiosInstance.get<any>(`api/ProgramDashboard/program/${programId}`);
        return response.data;
    }
};
