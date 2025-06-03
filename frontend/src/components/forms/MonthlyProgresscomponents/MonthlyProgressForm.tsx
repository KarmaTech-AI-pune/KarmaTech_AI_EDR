import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  Component,
} from "react";
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Typography,
  Container,
  Alert,
  Snackbar,
} from "@mui/material";
import { FormWrapper } from "../FormWrapper";
import { Form, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MonthlyProgressSchema,
  MonthlyProgressSchemaType,
} from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import {
  FinancialDetailsTab,
  ContractAndCostsTab,
  BudgetAndScheduleTab,
  ManpowerPlanningTab,
  ProgressReviewDeliverables,
  ChangeOrdersTab,
  ActionsTab,
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
    inputs: [
      "net",
      "serviceTax",
      "feeTotal",
      "odcs",
      "staff",
      "BudgetSubTotal",
    ],
  },
  {
    id: "2",
    label: "Contract & Costs",
    component: <ContractAndCostsTab />,
    inputs: [
      "lumpsum",
      "timeAndExpense",
      "percentage",
      "actualOdcs",
      "actualStaff",
      "actualSubtotal",
    ],
  },
  {
    id: "3",
    label: "Budget & Schedule",
    component: <BudgetAndScheduleTab />,
    inputs: [
      "dateOfIssueWOLOI",
      "completionDateAsPerContract",
      "completionDateAsPerExtension",
      "expectedCompletionDate",
      "completeOnCosts",
      "completeOnEV",
      "spi",
    ],
  },
  {
    id: "4",
    label: "Manpower Planning",
    component: <ManpowerPlanningTab />,
    inputs: ["manpowerPlanning", "manpowerTotal"],
  },
  {
    id: "5",
    label: "Progress Review Deliverables",
    component: <ProgressReviewDeliverables />,
    inputs: ["progressDeliverable"],
  },
  {
    id: "6",
    label: "Change Orders",
    component: <ChangeOrdersTab />,
    inputs: ["changeOrder"],
  },
  {
    id: "7",
    label: "Actions",
    component: <ActionsTab />,
    inputs: ["lastMonthActions", "currentMonthActions"],
  },
] satisfies tab[];

const SAVE_DELAY = 1000;
const SNACKBAR_DURATION = 3000;

// Main component
export const MonthlyProgressForm: React.FC = () => {
  const form = useForm<MonthlyProgressSchemaType>({
    resolver: zodResolver(MonthlyProgressSchema),
    defaultValues: {
      net: 0,
      serviceTax: 0,
      feeTotal: 0,
      odcs: 0,
      staff: 0,
      BudgetSubTotal: 0,
      lumpsum: false,
      timeAndExpense: false,
      percentage: 0,
      actualOdcs: 0,
      actualStaff: 0,
      actualSubtotal: 0,
      dateOfIssueWOLOI: new Date(),
      completionDateAsPerContract: new Date(),
      completionDateAsPerExtension: new Date(),
      expectedCompletionDate: new Date(),
      completeOnCosts: 0,
      completeOnEV: 0,
      spi: 0,
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
