import React from "react";
import { Box, Typography } from "@mui/material";

interface IssueDetailRowProps {
  label: string;
  children: React.ReactNode;
}

export const IssueDetailRow: React.FC<IssueDetailRowProps> = ({
  label,
  children,
}) => {
  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Label */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: "50%" }}
      >
        {label}
      </Typography>

      {/* Value */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 0.5,
          minWidth: "50%",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
