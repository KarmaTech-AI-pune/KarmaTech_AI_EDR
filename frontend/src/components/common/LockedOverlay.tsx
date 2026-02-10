import { Box, Paper, Typography } from '@mui/material';
import React, { ReactNode } from 'react'
import LockIcon from '@mui/icons-material/Lock';

interface LockedOverlayProps {
  children?: ReactNode;
//   message?: string;
}

const LockedOverlay: React.FC<LockedOverlayProps> = ({children}) => {
  return (
   <Box position="relative" zIndex={1000} width={'100wh'} height={"100vh"}>
      {/* Render children content if provided */}
      {children}

      {/* Overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundColor: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(2px)",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            textAlign: "center",
            p: 4,
            minWidth: 340,
            borderRadius: 3,
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
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
              boxShadow: 1,
            }}
          >
            <LockIcon sx={{ fontSize: 36, color: "#fff" }} />
          </Box>
          <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
            Feature Locked
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            This feature is not available for your current subscription.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please upgrade your plan to unlock this feature.
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}

export default LockedOverlay
