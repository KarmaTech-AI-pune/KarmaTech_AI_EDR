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
            profit: number | null;
        };
        currentBudget: {
            revenue: number | null;
            cost: number | null;
            profit: number | null;
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

export const initialManpowerData: ManpowerWorkItem[] = [
    {
        workAssignment: "Topographical Survey",
        assignee: ["Lavisha Surveyor"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Geotechnical Survey",
        assignee: ["Suresh Kumar Wilson"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Hydraulic Modelling",
        assignee: ["Michael Brown", "Maria Patel", "Vikram Verma"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Draft DDR",
        assignee: ["Michael Brown", "Maria Patel", "Vikram Verma", "Fatima Rahman"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Final DDR",
        assignee: ["Michael Brown", "Maria Patel", "Vikram Verma", "Fatima Rahman"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Draft Tender docs",
        assignee: ["Michael Brown", "Maria Patel", "Vikram Verma", "Fatima Rahman"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Final Tender docs",
        assignee: ["Michael Brown", "Maria Patel", "Vikram Verma"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Tender Evaluation and Award of work",
        assignee: ["Michael Brown", "Maria Patel", "Vikram Verma"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    }
];

export const initialFormState: MonthlyReviewModel = {
    fees: {
        net: null,
        serviceTax: null,
        total: null
    },
    budgetCosts: {
        odcs: null,
        staff: null,
        subTotal: null
    },
    contractType: {
        lumpsum: false,
        tAndE: false,
        percentage: null
    },
    actualCosts: {
        odcs: null,
        staff: null,
        subtotal: null
    },
    accruals: null,
    costsToComplete: {
        odcs: null,
        staff: null,
        subtotal: null
    },
    totalEACEstimate: null,
    grossProfitPercentage: null,
    budgetComparison: {
        originalBudget: {
            revenue: null,
            cost: null,
            profit: null
        },
        currentBudget: {
            revenue: null,
            cost: null,
            profit: null
        }
    },
    completion: {
        percentCompleteOnCosts: null,
        percentCompleteOnEV: null
    },
    schedule: {
        dateOfIssueWOLOI: '',
        completionDateAsPerContract: '',
        completionDateAsPerExtension: '',
        expectedCompletionDate: '',
        spi: null
    },
    manpowerPlanning: initialManpowerData,
    changeOrders: {
        proposed: [],
        submitted: [],
        approved: []
    },
    lastMonthActions: [
        {
            description: "Meetings with MCGM for finalization of techniques of execution",
            date: "",
            comments: "",
            priority: undefined
        },
        {
            description: "Site visits with MCGM for slum sanitation schemes",
            date: "",
            comments: "",
            priority: undefined
        },
        {
            description: "Chasing to payment of invoices raised",
            date: "",
            comments: "",
            priority: undefined
        }
    ],
    currentMonthActions: [
        {
            description: "Cost comparison to be submitted to MCGM for various techniques",
            date: "8/10/15",
            comments: "",
            priority: "H"
        },
        {
            description: "Re-doing the final detailed project report and finalization of tenders",
            date: "9/11/15",
            comments: "",
            priority: "H"
        },
        {
            description: "Chasing to payment of invoices raised",
            date: "",
            comments: "",
            priority: "H"
        }
    ]
};
