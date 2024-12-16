export interface ManpowerWorkItem {
    workAssignment: string;
    assignee: string[];
    planned: number | null;
    consumed: number | null;
    balance: number | null;
    nextMonthPlanning: number | null;
    comments: string;
}

export interface ChangeOrderItem {
    contractTotal: number | null;
    cost: number | null;
    fee: number | null;
    summaryDetails: string;
    status: 'Proposed' | 'Submitted' | 'Approved';
}

export interface ActionItem {
    description: string;
    date: string;
    comments: string;
    priority?: 'H' | 'M' | 'L';
}

export interface MonthlyReviewModel {
    fees: {
        net: number | null;
        serviceTax: number | null;
        total: number | null;
    };
    budgetCosts: {
        odcs: number | null;
        staff: number | null;
        subTotal: number | null;
    };
    contractType: {
        lumpsum: boolean;
        tAndE: boolean;
        percentage: number | null;
    };
    actualCosts: {
        odcs: number | null;
        staff: number | null;
        subtotal: number | null;
    };
    accruals: number | null;
    costsToComplete: {
        odcs: number | null;
        staff: number | null;
        subtotal: number | null;
    };
    totalEACEstimate: number | null;
    grossProfitPercentage: number | null;
    budgetComparison: {
        originalBudget: {
            revenue: number | null;
            cost: number | null;
            profit: null;
        };
        currentBudget: {
            revenue: number | null;
            cost: number | null;
            profit: null;
        };
    };
    completion: {
        percentCompleteOnCosts: number | null;
        percentCompleteOnEV: number | null;
    };
    schedule: {
        dateOfIssueWOLOI: string;
        completionDateAsPerContract: string;
        completionDateAsPerExtension: string;
        expectedCompletionDate: string;
        spi: number | null;
    };
    manpowerPlanning: ManpowerWorkItem[];
    changeOrders: {
        proposed: ChangeOrderItem[];
        submitted: ChangeOrderItem[];
        approved: ChangeOrderItem[];
    };
    lastMonthActions: ActionItem[];
    currentMonthActions: ActionItem[];
}
