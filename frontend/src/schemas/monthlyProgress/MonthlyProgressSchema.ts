import { z } from "zod";

const financialDetailsSchema = z.object({
    net: z.number().nullable(),
    serviceTax: z.number().min(0).max(100).nullable(),
    feeTotal: z.number().nullable(),
    budgetOdcs: z.number().nullable(),
    budgetStaff: z.number().nullable(),
    BudgetSubTotal: z.number().nullable()
})

const contractAndCostSchema = z.object({
    contractType: z.enum(['lumpsum', 'timeAndExpense'], {
    required_error: "Please select a contract type"
  }),
    percentage: z.number().min(0).max(100).nullable(),
    actualOdcs: z.number().nullable(),
    actualStaff: z.number().nullable(),
    actualSubtotal: z.number().nullable(),
})

const ctcAndEacSchema = z.object({
    ctcODC: z.number().nullable(),
    ctcStaff: z.number().nullable(),
    ctcSubtotal: z.number().nullable(),
    totalEAC: z.number().nullable(),
    grossProfitPercentage: z.number().nullable(),
})

const manpowerSchema = z.object({
    workAssignment: z.string(),
    assignee: z.string().array(),
    planned: z.number().nullable(),
    consumed: z.number().nullable(),
    balance: z.number().nullable(),
    nextMonthPlanning: z.number().nullable(),
    manpowerComments: z.string()
});

const progressDeliverableSchema = z.object({
    milestone : z.string(),
    dueDateContract: z.date(),
    dueDatePlanned: z.date(),
    achievedDate: z.date(),
    paymentDue: z.number().nullable(),
    invoiceDate: z.date(),
    paymentReceivedDate: z.date(),
    deliverableComments: z.string(),
})

const changeOrderSchema = z.object({
    contractTotal: z.number().nullable(),
    cost: z.number().nullable(),
    fee: z.number().nullable(),
    summaryDetails: z.string(),
    status: z.enum(['Proposed', 'Submitted', 'Approved'])
});

const lastMonthActionSchema = z.object({
    LMactions: z.string(),
    LMAdate: z.date(),
    LMAcomments: z.string(),
});

const currentMonthActionSchema = z.object({
    CMactions: z.string(),
    CMAdate: z.date(),
    CMAcomments: z.string(),
    CMApriority: z.enum(['H', 'M', 'L']).nullable()
});

// Budget Table Schema
const BudgetRowSchema = z.object({
    revenueFee: z
        .number()
        .min(1, "Revenue/Fee is required")
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: "Revenue/Fee must be a valid positive number"
        })
        .transform((val) => Number(val)),
    
    cost: z
        .number()
        .min(1, "Cost is required")
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: "Cost must be a valid positive number"
        })
        .transform((val) => Number(val)),
    
    profitPercentage: z
        .number()
        .min(1, "Profit percentage is required")
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
            message: "Profit percentage must be between 0 and 100"
        })
        .transform((val) => Number(val))
});

const BudgetTableSchema = z.object({
    originalBudget: BudgetRowSchema,
    
    currentBudgetInMIS: BudgetRowSchema,
    
    percentCompleteOnCosts: z.object({
        revenueFee: z
            .number()
            .min(1, "Revenue/Fee completion percentage is required")
            .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
                message: "Revenue/Fee completion must be between 0 and 100"
            })
            .transform((val) => Number(val)),
        
        cost: z
            .number()
            .min(1, "Cost completion percentage is required")
            .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
                message: "Cost completion must be between 0 and 100"
            })
            .transform((val) => Number(val)),
        
        profitPercentage: z
            .number()
            .min(1, "Profit completion percentage is required")
            .refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
                message: "Profit completion must be between 0 and 100"
            })
            .transform((val) => Number(val))
    })
});

export const MonthlyProgressSchema = z.object({
    financialDetails: financialDetailsSchema,
    contractAndCost: contractAndCostSchema,
    ctcAndEac: ctcAndEacSchema,
    dateOfIssueWOLOI: z.date(),
    completionDateAsPerContract: z.date(),
    completionDateAsPerExtension: z.date(),
    expectedCompletionDate: z.date(),
    completeOnCosts: z.number().nullable(),
    budgetTable: BudgetTableSchema,
    manpowerPlanning: z.array(manpowerSchema),
    manpowerTotal: z.number(),
    progressDeliverable: z.array(progressDeliverableSchema),
    changeOrder: z.array(changeOrderSchema),
    lastMonthActions: z.array(lastMonthActionSchema),
    currentMonthActions: z.array(currentMonthActionSchema)
})

export type MonthlyProgressSchemaType = z.infer<typeof MonthlyProgressSchema>;