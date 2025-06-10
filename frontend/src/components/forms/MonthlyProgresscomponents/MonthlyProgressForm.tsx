import React, {
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Paper,
  Typography,
  Container,
  Alert,
  Snackbar,
} from "@mui/material";
import { FormWrapper } from "../FormWrapper";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MonthlyProgressSchema,
  MonthlyProgressSchemaType,
} from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import {
  FinancialDetailsTab,
  ContractAndCostsTab,
  CostToCompleteAndEAC,
  ScheduleTab,
  ManpowerPlanningTab,
  BudgetRevenueTab,
  ProgressReviewDeliverables,
  ChangeOrdersTab,
  LastMonthActionsTab,
  CurrentMonthActionsTab,
} from "./index";
import {
  getCurrentMonthYear,
  formatCurrency,
} from "../../../utils/MonthlyProgress/monthlyProgressUtils";
import { FormControlsProvider } from "../../../hooks/MontlyProgress/useForm";
import FormHeader from "./FormHeader";
import FormFooter from "./FormFooter";
import RenderComponent from "./RenderComponent";


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
    inputs: [
      "ctcODC",
      "ctcStaff",
      "ctcSubtotal",
      "totalEAC",
      "grossProfitPercentage",
    ]
  },
  {
    id: "4",
    label: "Schedule",
    component: <ScheduleTab />,
    inputs: [
      "dateOfIssueWOLOI",
      "completionDateAsPerContract",
      "completionDateAsPerExtension",
      "expectedCompletionDate",
      "completeOnCosts"
    ],
  },
  {
    id: "5",
    label: "Budget Revenue",
    component: <BudgetRevenueTab/>,
    inputs: [
     "budgetTable"
    ],
  },
  {
    id: "6",
    label: "Manpower Planning",
    component: <ManpowerPlanningTab />,
    inputs: ["manpowerPlanning", "manpowerTotal"],
  },
  {
    id: "7",
    label: "Progress Review Deliverables",
    component: <ProgressReviewDeliverables />,
    inputs: ["progressDeliverable"],
  },
  {
    id: "8",
    label: "Change Orders",
    component: <ChangeOrdersTab />,
    inputs: ["changeOrder"],
  },
  {
    id: "9",
    label: "Last Month Actions",
    component: <LastMonthActionsTab />,
    inputs: ["lastMonthActions"],
  },
  {
    id: "10",
    label: "Current Month Actions",
    component: <CurrentMonthActionsTab />,
    inputs: ["currentMonthActions"],
  },
] satisfies tab[];

const SAVE_DELAY = 1000;
const SNACKBAR_DURATION = 3000;

// Main component
export const MonthlyProgressForm: React.FC = () => {
  const form = useForm<MonthlyProgressSchemaType>({
    resolver: zodResolver(MonthlyProgressSchema),
    defaultValues: {
      financialDetails: {
        net: null,
        serviceTax: null,
        feeTotal: null,
        budgetOdcs: null,
        budgetStaff: null,
        BudgetSubTotal: null,
      },
      contractAndCost: {
        contractType: "lumpsum", // Default to lumpsum
        percentage: null,
        actualOdcs: null,
        actualStaff: null,
        actualSubtotal: null,
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
          cost: 0,
          profitPercentage: 0
        }
      },
      ctcODC: null,
      ctcStaff: null,
      ctcSubtotal: null,
      totalEAC: null,
      grossProfitPercentage: null,
      dateOfIssueWOLOI: new Date(),
      completionDateAsPerContract: new Date(),
      completionDateAsPerExtension: new Date(),
      expectedCompletionDate: new Date(),
      completeOnCosts: null,
      manpowerPlanning: [],
      manpowerTotal: 0,
      changeOrder: [],
      lastMonthActions: [],
      currentMonthActions: [],
      progressDeliverable: [],
    },
    mode: "all",
  });


  // Use ref to prevent re-creating the date string on every render
  const currentMonthYear = useRef(getCurrentMonthYear()).current;



  const onSubmit = (data: MonthlyProgressSchemaType) => {
    console.log(data);
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

          <Snackbar
            // open={showSuccess}
            autoHideDuration={SNACKBAR_DURATION}
            // onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              severity="success"
              variant="filled"
              sx={{ backgroundColor: "#1976d2" }}
            >
              Review saved successfully!
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </FormWrapper>
  );
};
