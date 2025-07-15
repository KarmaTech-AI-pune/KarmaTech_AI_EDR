import { z } from "zod";

const financialAndContractSchema = z.object({
  net: z.number().nullable(),
  serviceTax: z.number().min(0).max(100).nullable(),
  feeTotal: z.number().nullable(),
  budgetOdcs: z.number().nullable(),
  budgetStaff: z.number().nullable(),
  budgetSubTotal: z.number().nullable(),
  contractType: z.enum(["lumpsum", "timeAndExpense","percentage"]),
});

const actualCostSchema = z.object({
  priorCumulativeOdc: z.number().nullable().optional(),
  priorCumulativeStaff: z.number().nullable().optional(),
  priorCumulativeTotal: z.number().nullable(),
  actualOdc: z.number().nullable().optional(),
  actualStaff: z.number().nullable().optional(),
  actualSubtotal: z.number().nullable(),
  totalCumulativeOdc: z.number().nullable(),
  totalCumulativeStaff: z.number().nullable(),
  totalCumulativeCost: z.number().nullable(),
});

const ctcAndEacSchema = z.object({
  ctcODC: z.number().nullable(),
  ctcStaff: z.number().nullable(),
  ctcSubtotal: z.number().nullable(),
  actualctcODC: z.number().nullable().optional(),
  actualCtcStaff: z.number().nullable().optional(),
  actualCtcSubtotal: z.number().nullable(),
  eacOdc: z.number().nullable(),
  eacStaff: z.number().nullable(),
  totalEAC: z.number().nullable(),
  grossProfitPercentage: z.number().nullable(),
});

const scheduleSchema = z.object({
  dateOfIssueWOLOI: z.string().nullable(),
  completionDateAsPerContract: z.string().nullable(),
  completionDateAsPerExtension: z.string().nullable(),
  expectedCompletionDate: z.string().nullable(),
});

// Budget Table Schema
const BudgetRowSchema = z.object({
  revenueFee: z
    .number()
    .nullable()
    .refine((val) => val === null || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Revenue/Fee must be a valid positive number",
    })
    .transform((val) => (val === null ? null : Number(val))),

  cost: z
    .number()
    .nullable()
    .refine((val) => val === null || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Cost must be a valid positive number",
    })
    .transform((val) => (val === null ? null : Number(val))),

  profitPercentage: z
    .number()
    .nullable()
    .transform((val) => (val === null ? null : Number(val))),
});

const BudgetTableSchema = z.object({
  originalBudget: BudgetRowSchema,

  currentBudgetInMIS: BudgetRowSchema,

  percentCompleteOnCosts: z.object({
    revenueFee: z
      .number()
      .nullable()
      .refine(
        (val) =>
          val === null ||
          (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
        {
          message: "Revenue/Fee completion must be between 0 and 100",
        }
      )
      .transform((val) => (val === null ? null : Number(val))),

    cost: z
      .number()
      .nullable()
      .refine(
        (val) =>
          val === null ||
          (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
        {
          message: "Cost completion must be between 0 and 100",
        }
      )
      .transform((val) => (val === null ? null : Number(val))),
  }),
});

const manpowerSchema = z.object({
  workAssignment: z.string().nullable(),
  assignee: z.string().nullable(),
  planned: z.number().nullable(),
  consumed: z.number().nullable(),
  balance: z.number().nullable(),
  nextMonthPlanning: z.number().nullable(),
  manpowerComments: z.string().nullable(),
});

const manpowerPlanningSchema = z.object({
  manpower: z.array(manpowerSchema),
  manpowerTotal: z.object({
    plannedTotal: z.number().nullable(),
    consumedTotal: z.number().nullable(),
    balanceTotal: z.number().nullable(),
    nextMonthPlanningTotal: z.number().nullable(),
  }),
});

const deliverableSchema = z.object({
  milestone: z.string().nullable(),
  dueDateContract: z.string().nullable(),
  dueDatePlanned: z.string().nullable(),
  achievedDate: z.string().nullable(),
  paymentDue: z.number().nullable(),
  invoiceDate: z.string().nullable(),
  paymentReceivedDate: z.string().nullable(),
  deliverableComments: z.string().nullable(),
});

const progressDeliverableSchema = z.object({
  deliverables: z.array(deliverableSchema),
  totalPaymentDue: z.number().nullable()
})

const changeOrderSchema = z.object({
  contractTotal: z.number().nullable(),
  cost: z.number().nullable(),
  fee: z.number().nullable(),
  summaryDetails: z.string().nullable(),
  status: z.enum(["Proposed", "Submitted", "Approved"]).nullable(),
});


const programmeScheduleSchema = z.object({
  programmeDescription: z.string().nullable()
})

const earlyWarningsSchema = z.object({
  warningsDescription: z.string().nullable()
})

const lastMonthActionSchema = z.object({
  actions: z.string().nullable(),
  date: z.string().nullable(),
  comments: z.string().nullable(),
});

const currentMonthActionSchema = z.object({
  actions: z.string().nullable(),
  date: z.string().nullable(),
  comments: z.string().nullable(),
  priority: z.enum(["H", "M", "L"]).nullable(),
});

export const MonthlyProgressSchema = z.object({
  financialAndContractDetails: financialAndContractSchema,
  actualCost: actualCostSchema,
  ctcAndEac: ctcAndEacSchema,
  schedule: scheduleSchema,
  budgetTable: BudgetTableSchema,
  manpowerPlanning: manpowerPlanningSchema,
  progressDeliverable: progressDeliverableSchema,
  changeOrder: z.array(changeOrderSchema),
  programmeSchedule: z.array(programmeScheduleSchema),
  earlyWarnings: z.array(earlyWarningsSchema),
  lastMonthActions: z.array(lastMonthActionSchema),
  currentMonthActions: z.array(currentMonthActionSchema),
});

export type MonthlyProgressSchemaType = z.infer<typeof MonthlyProgressSchema>;
