import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { PendingApproval } from "../../data/types/dashboard";
import { IMPACT_COLORS } from "../../utils/constants";
import ActionButton from "../shared/ActionButton";

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  onEscalate: (id: number) => void;
  onRemind: (id: number) => void;
}

const PendingApprovals: React.FC<PendingApprovalsProps> = ({
  approvals,
  onEscalate,
  onRemind,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            mb: isMobile ? 2 : 3,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 1 : 0,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="semibold"
            sx={{
              fontSize: isMobile ? "1.1rem" : "1.25rem",
              lineHeight: isMobile ? 1.3 : 1.2,
            }}
          >
            Pending Approvals
          </Typography>
          <Chip
            label={`${approvals.length} Pending`}
            size={isMobile ? "medium" : "small"}
            sx={{
              backgroundColor: "#f8e1c0ff",
              color: theme.palette.warning.dark,
              fontWeight: "medium",
              fontSize: isMobile ? "0.75rem" : "0.8125rem",
              alignSelf: isMobile ? "flex-start" : "auto",
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 1.5 : 2,
          }}
        >
          {approvals.map((approval, index) => {
            const impactStyle = IMPACT_COLORS[approval.impact];
            return (
              <Card
                key={`${approval.id}-${index}`}
                variant="outlined"
                sx={{
                  p: isMobile ? 1.5 : 2,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    flexDirection: isMobile ? "column" : "row",
                    gap: isMobile ? 1 : 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="medium"
                      sx={{ fontSize: isMobile ? "0.9rem" : "1rem", mb: 0.5 }}
                    >
                      {approval.formName} - {approval.project}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: isMobile ? "0.8rem" : "0.875rem", mb: 1 }}
                    >
                      Manager: {approval.manager}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: isMobile ? 1 : 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: isMobile ? "0.7rem" : "0.75rem" }}
                      >
                        {approval.days} days overdue
                      </Typography>
                      <Chip
                        label={`${approval.impact} Impact`}
                        size="small"
                        sx={{
                          backgroundColor: impactStyle.backgroundColor,
                          color: impactStyle.color,
                          fontWeight: "medium",
                          fontSize: isMobile ? "0.7rem" : "0.75rem",
                          "& .MuiChip-label": {
                            padding: "6px 8px", // Add custom padding to label
                          },
                        }}
                      />
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "row" : "column",
                      gap: isMobile ? 1 : 1.5,
                      width: isMobile ? "100%" : "auto",
                      justifyContent: isMobile ? "flex-end" : "auto",
                    }}
                  >
                    <ActionButton
                      variant="primary"
                      size={isMobile ? "small" : "small"}
                      onClick={() => onEscalate(approval.id)}
                      sx={{ py: isMobile ? 0.5 : 0.5, px: isMobile ? 1 : 1.5 }}
                    >
                      Escalate
                    </ActionButton>
                    <ActionButton
                      variant="secondary"
                      size={isMobile ? "small" : "small"}
                      onClick={() => onRemind(approval.id)}
                      sx={{ py: isMobile ? 0.5 : 0.5, px: isMobile ? 1 : 1.5 }}
                    >
                      Remind
                    </ActionButton>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PendingApprovals;
