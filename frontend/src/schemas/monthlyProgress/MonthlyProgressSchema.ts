import { z } from "zod";

const financialAndContractSchema = z.object({
  net: z.number().nullable(),
  serviceTax: z.number().min(0).max(100).nullable(),
  feeTotal: z.number().nullable(),
  budgetOdcs: z.number().nullable(),
  budgetStaff: z.number().nullable(),
  BudgetSubTotal: z.number().nullable(),
  contractType: z.enum(["lumpsum", "timeAndExpense","percentage"]),
});

const actualCostSchema = z.object({
  priorCumulativeOdc: z.number().nullable(),
  priorCumulativeStaff: z.number().nullable(),
  priorCumulativeTotal: z.number().nullable(),
  actualOdc: z.number().nullable(),
  actualStaff: z.number().nullable(),
  actualSubtotal: z.number().nullable(),
  totalCumulativeOdc: z.number().nullable(),
  totalCumulativeStaff: z.number().nullable(),
  totalCumulativeCost: z.number().nullable(),
});

const ctcAndEacSchema = z.object({
  ctcODC: z.number().nullable(),
  ctcStaff: z.number().nullable(),
  ctcSubtotal: z.number().nullable(),
  actualctcODC: z.number().nullable(),
  actualCtcStaff: z.number().nullable(),
  actualCtcSubtotal: z.number().nullable(),
  totalEAC: z.number().nullable(),
  grossProfitPercentage: z.number().nullable(),
});

const scheduleSchema = z.object({
  dateOfIssueWOLOI: z.date().nullable(),
  completionDateAsPerContract: z.date().nullable(),
  completionDateAsPerExtension: z.date().nullable(),
  expectedCompletionDate: z.date().nullable(),
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
  dueDateContract: z.date().nullable(),
  dueDatePlanned: z.date().nullable(),
  achievedDate: z.date().nullable(),
  paymentDue: z.number().nullable(),
  invoiceDate: z.date().nullable(),
  paymentReceivedDate: z.date().nullable(),
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

const lastMonthActionSchema = z.object({
  LMactions: z.string().nullable(),
  LMAdate: z.date().nullable(),
  LMAcomments: z.string().nullable(),
});

const currentMonthActionSchema = z.object({
  CMactions: z.string().nullable(),
  CMAdate: z.date().nullable(),
  CMAcomments: z.string().nullable(),
  CMApriority: z.enum(["H", "M", "L"]).nullable(),
});

const programmeScheduleSchema = z.object({
  ProgrammeDescription: z.string().nullable()
})

const earlyWarningsSchema = z.object({
  WarningsDescription: z.string().nullable()
})

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
