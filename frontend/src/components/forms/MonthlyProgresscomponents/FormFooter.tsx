import React from "react";
import { useFormControls } from "../../../hooks/MontlyProgress/useForm";
import { tab } from "./MonthlyProgressForm";
import { useFormContext } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Box, Button, CircularProgress } from "@mui/material";

const FormFooter = ({ tabs }: { tabs: tab[] }) => {
  const {
    handleBack,
    handleNext,
    isFinalPage,
    currentPageIndex,
    hasNextPage,
    hasPreviousPage,
  } = useFormControls();
  const { trigger } = useFormContext<MonthlyProgressSchemaType>();

  if (isFinalPage) {
    return (
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
        
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={!hasPreviousPage}
          sx={{
            borderColor: "#1976d2",
            color: "#1976d2",
            "&:hover": {
              borderColor: "#1565c0",
              backgroundColor: "rgba(25, 118, 210, 0.04)",
            },
          }}
        >
            Back
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          Save
        </Button>
      </Box>
    );
  }

  return(
    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
      <Button
        variant="outlined"
        onClick={handleBack}
        disabled={!hasPreviousPage}
        sx={{
          borderColor: "#1976d2",
          color: "#1976d2",
          "&:hover": {
            borderColor: "#1565c0",
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
      >
        Back
      </Button>
      <Button
        variant="contained"
        onClick={
            async () => {
              await trigger(tabs[currentPageIndex + 1].inputs);
              handleNext();
            }
          }
        // onClick={handleNext}
        disabled={!hasNextPage}
        sx={{
          backgroundColor: "#1976d2",
          "&:hover": {
            backgroundColor: "#1565c0",
          },
        }}
      >
        Next
      </Button>
    </Box>
  )
};

export default FormFooter;
