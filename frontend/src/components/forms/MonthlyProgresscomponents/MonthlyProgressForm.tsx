import React, {
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Paper,
  Typography,
  Container,
} from "@mui/material";
import { FormWrapper } from "../FormWrapper";
import { FormProvider, useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MonthlyProgressSchema,
  MonthlyProgressSchemaType,
} from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { MonthlyProgressAPI } from "../../../services/monthlyProgressApi";
import { useProject } from "../../../context/ProjectContext";
import {
  FinancialDetailsTab,
  ContractAndCostsTab,
  CostToCompleteAndEAC,
  ScheduleTab,
  ManpowerPlanningTab,
  BudgetRevenueTab,
  ProgressReviewDeliverables,
  ChangeOrdersTab,
  ProgrammeScheduleTab,
  EarlyWarningsTab,
  LastMonthActionsTab,
  CurrentMonthActionsTab,
} from "./index";
import {
  getCurrentMonthYear,
} from "../../../utils/MonthlyProgress/monthlyProgressUtils";
import { FormControlsProvider } from "../../../hooks/MontlyProgress/useForm";
import FormHeader from "./FormHeader";
import FormFooter from "./FormFooter";
import RenderComponent from "./RenderComponent";
import NotificationSnackbar from "../../widgets/NotificationSnackbar"; // Import NotificationSnackbar


export type tab = {
  id: string | number;
  label: string;
  component: React.JSX.Element;
  inputs: (keyof MonthlyProgressSchemaType)[];
};

const tabs = [
  {
    id: "1",
    label: "Financial Details",
    component: <FinancialDetailsTab />,
    inputs: ["financialDetails"],
  },
  {
    id: "2",
    label: "Contract & Costs",
    component: <ContractAndCostsTab />,
    inputs: ["contractAndCost"],
  },
  {
    id: "3",
    label: "CTC & EAC",
    component: <CostToCompleteAndEAC/>,
    inputs: ["ctcAndEac"]
  },
  {
    id: "4",
    label: "Schedule",
    component: <ScheduleTab />,
    inputs: ["schedule"],
  },
  {
    id: "5",
    label: "Progress Review Deliverables",
    component: <ProgressReviewDeliverables />,
    inputs: ["progressDeliverable"],
  },
  {
    id: "6",
    label: "Budget Revenue",
    component: <BudgetRevenueTab/>,
    inputs: [
     "budgetTable"
    ],
  },
  {
    id: "7",
    label: "Manpower Planning",
    component: <ManpowerPlanningTab />,
    inputs: ["manpowerPlanning"],
  },
  {
    id: "8",
    label: "Change Orders",
    component: <ChangeOrdersTab />,
    inputs: ["changeOrder"],
  },
  {
    id: "9",
    label: "Programme Schedule",
    component: <ProgrammeScheduleTab />,
    inputs: ["programmeSchedule"],
  },
  {
    id: "10",
    label: "Early Warnings",
    component: <EarlyWarningsTab />,
    inputs: ["earlyWarnings"],
  },
  {
    id: "11",
    label: "Last Month Actions",
    component: <LastMonthActionsTab />,
    inputs: ["lastMonthActions"],
  },
  {
    id: "12",
    label: "Current Month Actions",
    component: <CurrentMonthActionsTab />,
    inputs: ["currentMonthActions"],
  },
] satisfies tab[];


// Main component
export const MonthlyProgressForm: React.FC = () => {
  const form = useForm<MonthlyProgressSchemaType>({
    resolver: zodResolver(MonthlyProgressSchema),
    defaultValues: {
      financialDetails: {
        net: 0,
        serviceTax: 0,
        feeTotal: 0,
        budgetOdcs: 0,
        budgetStaff: 0,
        BudgetSubTotal: 0,
      },
      contractAndCost: {
        contractType: "lumpsum", // Default to lumpsum
        percentage: 0,
        actualOdcs: 0,
        actualStaff: 0,
        actualSubtotal: 0,
      },
      budgetTable: {
        originalBudget: {
          revenueFee: 0,
          cost: 0,
          profitPercentage: 0
        },
        currentBudgetInMIS: {
          revenueFee: 0,
          cost: 0,
          profitPercentage: 0
        },
        percentCompleteOnCosts: {
          revenueFee: 0,
          cost: 0
        }
      },
      ctcAndEac: {
      ctcODC: 0,
      ctcStaff: 0,
      ctcSubtotal: 0,
      actualctcODC: 0,
      actualCtcStaff: 0,
      actualCtcSubtotal: 0,
      totalEAC: 0,
      grossProfitPercentage: 0,
      },
      schedule: {
        dateOfIssueWOLOI: new Date(),
      completionDateAsPerContract: new Date(),
      completionDateAsPerExtension: new Date(),
      expectedCompletionDate: new Date(),
      },
      manpowerPlanning: {
        manpower: [],
        manpowerTotal: {
          plannedTotal: 0,
          consumedTotal: 0,
          balanceTotal: 0,
          nextMonthPlanningTotal: 0,
        }
      },
      progressDeliverable: {
        deliverables: [],
        totalPaymentDue: 0,
      },
      changeOrder: [],
      programmeSchedule: [],
      earlyWarnings: [],
      lastMonthActions: [],
      currentMonthActions: [],
    },
    mode: "all",
  });

  const { projectId } = useProject();

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error', // Explicitly type severity
  });

  const handleCloseSnackbar = () => {
    setSnackbarState({ ...snackbarState, open: false });
  };

  // Use ref to prevent re-creating the date string on every render
  const currentMonthYear = useRef(getCurrentMonthYear()).current;

  const onSubmit: SubmitHandler<MonthlyProgressSchemaType> = async (data) => {

    if (!projectId) {
      setSnackbarState({
        open: true,
        message: "Project ID is not available. Cannot submit form.",
        severity: 'error',
      });
      return;
    }

    try {
      // You might want to show a loading indicator here
      await MonthlyProgressAPI.submitMonthlyProgress(projectId, data);
      setSnackbarState({
        open: true,
        message: "Review saved successfully!",
        severity: 'success',
      });
    } catch (error: any) {
      console.error("Submission error:", error);
      setSnackbarState({
        open: true,
        message: error.message || 'An unexpected error occurred during submission.',
        severity: 'error',
      });
    } finally {
      // Hide loading indicator here if implemented
    }
  };

  const containerStyles = useMemo(
    () => ({
      width: "100%",
      maxHeight: "calc(100vh - 200px)",
      overflowY: "auto",
      overflowX: "hidden",
      pr: 1,
      pb: 4,
    }),
    []
  );

  return (
    <FormWrapper>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={containerStyles}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                color: "#1976d2",
                fontWeight: 500,
                mb: 3,
              }}
            >
              PMD7. Monthly Progress Review - {currentMonthYear}
            </Typography>

            <Box>
              <FormControlsProvider tabs={tabs}>
                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Box
                      sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
                    >
                      <FormHeader tabs={tabs} />
                    </Box>

                    <RenderComponent tabs={tabs} />

                    <FormFooter tabs={tabs} />
                  </form>
                </FormProvider>
              </FormControlsProvider>
            </Box>
          </Paper>

          <NotificationSnackbar
            open={snackbarState.open}
            message={snackbarState.message}
            severity={snackbarState.severity}
            onClose={handleCloseSnackbar}
          />
        </Box>
      </Container>
    </FormWrapper>
  );
};
