import React from "react";
import { useFormControls } from "../../../hooks/MontlyProgress/useForm";
import { tab } from "./MonthlyProgressForm";
import { useFormContext } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Box, Button } from "@mui/material";

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

  // Handle Next button click with proper validation
  const handleNextClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    
    try {
      // Validate current tab before moving to next
      const isValid = await trigger(tabs[currentPageIndex].inputs);
      if (isValid) {
        handleNext();
      } else {
        console.log('Validation failed for current tab');
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  // Handle Back button click
  const handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    handleBack();
  };

  if (isFinalPage) {
    return (
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
        <Button
          type="button" 
          variant="outlined"
          onClick={handleBackClick}
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

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
      <Button
        type="button" 
        variant="outlined"
        onClick={handleBackClick}
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
        type="button" // Explicitly set as button type - THIS IS THE KEY FIX
        variant="contained"
        onClick={handleNextClick}
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
  );
};

export default FormFooter;