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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
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
  ActualCost,
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
import { getAggregatedMonthlyProgressData, getMonthlyProgressData } from "../../../services/monthlyProgressDataService";
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
    label: "Financial Details & Contract",
    component: <FinancialDetailsTab />,
    inputs: ["financialAndContractDetails"],
  },
  {
    id: "2",
    label: "Actual Cost",
    component: <ActualCost />,
    inputs: ["actualCost"],
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
  const { projectId } = useProject();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const form = useForm<MonthlyProgressSchemaType>({
    resolver: zodResolver(MonthlyProgressSchema),
    defaultValues: {},
    mode: "all",
  });

  React.useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getMonthlyProgressData(projectId, year, month);
        form.reset(data);
      } catch (err) {
        setError("Failed to fetch form data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, year, month, form]);

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
      const payload = { ...data, year, month };
      // You might want to show a loading indicator here
      await MonthlyProgressAPI.submitMonthlyProgress(projectId, payload);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
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

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl>
                <InputLabel>Year</InputLabel>
                <Select value={year} onChange={(e) => setYear(e.target.value as number)} label="Year">
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Month</InputLabel>
                <Select value={month} onChange={(e) => setMonth(e.target.value as number)} label="Month">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <MenuItem key={m} value={m}>
                      {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

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
  );
};
