import { z } from "zod";

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

export const MonthlyProgressSchema = z.object({
    net: z.number(),
    serviceTax: z.number().min(0).max(100),
    feeTotal: z.number().min(1),
    odcs: z.number().nullable(),
    staff: z.number().nullable(),
    BudgetSubTotal: z.number().nullable(),
    lumpsum: z.boolean(),
    timeAndExpense: z.boolean(),
    percentage: z.number().nullable(),
    actualOdcs: z.number().nullable(),
    actualStaff: z.number().nullable(),
    actualSubtotal: z.number().nullable(),
    dateOfIssueWOLOI: z.date(),
    completionDateAsPerContract: z.date(),
    completionDateAsPerExtension: z.date(),
    expectedCompletionDate: z.date(),
    completeOnCosts: z.number().nullable(),
    manpowerPlanning: z.array(manpowerSchema),
    manpowerTotal: z.number(),
    progressDeliverable: z.array(progressDeliverableSchema),
    changeOrder: z.array(changeOrderSchema),
    lastMonthActions: z.array(lastMonthActionSchema),
    currentMonthActions: z.array(currentMonthActionSchema)
})

export type MonthlyProgressSchemaType = z.infer<typeof MonthlyProgressSchema>;

