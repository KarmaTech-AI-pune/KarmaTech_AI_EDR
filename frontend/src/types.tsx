import { ReactElement } from 'react';
import { User } from './models';
import { GoNoGoDecision } from './models/goNoGoDecisionModel';
import { Project, OpportunityTracking } from './models';

export interface screensArrayType {
    [key: string]: ReactElement | null;
}

export interface UserWithRole extends User {
    roleDetails?: {
        id: string;
        name: string;
        permissions: string[];
    } | null;
}

export interface projectManagementAppContextType {
    isAuthenticated: boolean;
    setIsAuthenticated: (auth: boolean) => void;
    user: User | null;
    setUser: (user: User | null) => void;
    handleLogout: () => void;
    selectedProject: Project | OpportunityTracking | null;
    setSelectedProject: (project: Project | OpportunityTracking | null) => void;
    currentGoNoGoDecision: GoNoGoDecision | null;
    setCurrentGoNoGoDecision: (decision: GoNoGoDecision | null) => void;
    goNoGoDecisionStatus: string | null;
    setGoNoGoDecisionStatus: (status: string | null) => void;
    goNoGoVersionNumber: number | null;
    setGoNoGoVersionNumber: (versionNumber: number | null) => void;
    currentUser: UserWithRole | null;
    setCurrentUser: (user: UserWithRole | null) => void;
    canEditOpportunity: boolean;
    setCanEditOpportunity: (can: boolean) => void;
    canDeleteOpportunity: boolean;
    setCanDeleteOpportunity: (can: boolean) => void;
    canSubmitForReview: boolean;
    setCanSubmitForReview: (can: boolean) => void;
    canReviewBD: boolean;
    setCanReviewBD: (can: boolean) => void;
    canApproveBD: boolean;
    setCanApproveBD: (can: boolean) => void;
    canSubmitForApproval: boolean;
    setCanSubmitForApproval: (can: boolean) => void;

    canProjectSubmitForReview: boolean
    setProjectCanSubmitForReview: (can: boolean) => void;
    canProjectSubmitForApproval: boolean
    setProjectCanSubmitForApproval: (can: boolean) => void;
    canProjectCanApprove: boolean
    setProjectCanApprove: (can: boolean) => void;
}

export interface Credentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    user?: UserWithRole;
    token?: string;
    message?: string;
}

export interface OpportunityItemProps {
    opportunity: OpportunityTracking;
    onOpportunityDeleted?: (id: string) => void;
    onOpportunityUpdated?: (updatedOpportunity?: OpportunityTracking) => void;
}

// Types for JobStartForm Data Structure
export interface TaskAllocation {
    taskId: string;
    title: string;
    rate: number;
    hours: number;
    cost: number;
}

export interface EmployeeAllocation {
    id: string;
    name: string;
    is_consultant: boolean;
    allocations: TaskAllocation[];
    totalHours: number;
    totalCost: number;
    remarks: string;
}

export interface ExpenseEntry {
    number: string; // Can be number or string depending on input, handle conversion
    remarks: string;
}

export interface OutsideAgencyEntry {
    description: string;
    rate: string; // Can be number or string
    units: string; // Can be number or string
    remarks: string;
}

export interface ProjectSpecificEntry {
    name: string;
    number: string; // Can be number or string
    remarks: string;
}

export interface TimeContingencyEntry {
    units: string; // Can be number or string
    remarks: string;
}

export interface ServiceTaxData {
    percentage: number;
    amount: number;
}

export interface TimeData {
    employeeAllocations: EmployeeAllocation[];
    timeContingency: TimeContingencyEntry;
    totalTimeCost: number;
}

export interface ExpensesData {
    regularExpenses: { // Matches ExpensesType structure
        '2a': ExpenseEntry;
        '2b': ExpenseEntry;
        '3': ExpenseEntry;
        '4': ExpenseEntry;
        '5': ExpenseEntry;
        '7': ExpenseEntry;
    };
    surveyWorks: ExpenseEntry;
    outsideAgency: { // Matches OutsideAgencyType structure
        'a': OutsideAgencyEntry;
        'b': OutsideAgencyEntry;
        'c': OutsideAgencyEntry;
    };
    projectSpecific: { // Matches ProjectSpecificType structure
        '6c': ProjectSpecificEntry;
        '6d': ProjectSpecificEntry;
        '6e': ProjectSpecificEntry;
    };
    totalExpenses: number;
}

export interface JobStartFormResourceData {
    wbsTaskId?: number | string;
    taskType: number; // 0 = Manpower/Time, 1 = ODC/Expenses
    description: string;
    rate: number;
    units: number;
    budgetedCost: number;
    remarks?: string;
    employeeName?: string; // For Manpower resources (taskType=0)
    name?: string; // For ODC resources (taskType=1)
}

export interface JobStartFormData {
    formId?: number | string; // Added optional formId for updates
    projectId: number | string | undefined; // Match context type
    time: TimeData;
    expenses: ExpensesData;
    grandTotal: number;
    projectFees: number;
    serviceTax: ServiceTaxData;
    totalProjectFees: number;
    profit: number;
    // Optional fields for backend
    formTitle?: string;
    description?: string;
    startDate?: string;
    preparedBy?: string;
    selections?: any[]; // JobStartFormSelectionDto[]
    resources?: JobStartFormResourceData[]; // Resources for Time and Expenses
}
