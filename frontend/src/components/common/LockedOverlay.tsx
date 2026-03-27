import { Box, Paper, Typography } from '@mui/material';
import React, { ReactNode } from 'react'
import LockIcon from '@mui/icons-material/Lock';

interface LockedOverlayProps {
  children?: ReactNode;
//   message?: string;
}

const LockedOverlay: React.FC<LockedOverlayProps> = ({ children }) => {
  return (
    <Box 
      position="relative" 
      width="100%" 
      height="100%" 
      minHeight="400px" // Ensure there's some height if children are empty
      overflow="hidden"
    >
      {/* Background Content (Children) */}
      <Box sx={{ width: '100%', height: '100%', filter: 'blur(2px)', opacity: 0.7 }}>
        {children}
      </Box>

      {/* Overlay Layer */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        justifyContent="center"
        alignItems="center"
        zIndex={10}
        sx={{
          backgroundColor: "rgba(255,255,255,0.4)",
          backdropFilter: "blur(4px)",
        }}
      >
        <Paper
          elevation={12}
          sx={{
            textAlign: "center",
            p: 5,
            maxWidth: 400,
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            background: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #1976d2 30%, #64b5f6 90%)",
              borderRadius: "50%",
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              boxShadow: 2,
            }}
          >
            <LockIcon sx={{ fontSize: 36, color: "#fff" }} />
          </Box>
          <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
            Feature Locked
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            This feature is not available for your current subscription plan.
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Please upgrade to a higher plan to unlock.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default LockedOverlay
