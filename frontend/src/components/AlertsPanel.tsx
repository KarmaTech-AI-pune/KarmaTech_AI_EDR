import React, { useContext } from 'react'; // Import useContext
import { Box, Typography, Paper, Link as MuiLink } from '@mui/material'; // Import MuiLink for styling
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'; // Import an icon
import { projectManagementAppContext } from '../App'; // Import the context

export const AlertsPanel: React.FC = () => {
  const context = useContext(projectManagementAppContext); // Get context
  const setScreenState = context?.setScreenState; // Get setScreenState function

  // Updated placeholder data with new titles
  const alerts = [
    { id: 1, message: 'Water Treatment Plan: Pending review of Regional Manager' }, // Updated title
    { id: 2, message: 'ETP installation in Odisha: Pending approval of Regional Director' }, // Updated title
  ];

  const handleAlertClick = () => {
    if (setScreenState) {
      setScreenState("Business Development"); // Navigate to Business Development page
    } else {
      console.error("setScreenState function not found in context");
    }
  };

  return (
    <Paper 
      elevation={2} // Slightly reduced elevation
      sx={{ 
        p: 2, 
        backgroundColor: '#fffbe6', // Light yellow background
        color: '#5f4300', // Dark amber text color for contrast
        border: '1px solid #ffe58f', // Light amber border
        borderRadius: '8px' // Slightly rounded corners
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> {/* Flex container for icon and title */}
        <WarningAmberOutlinedIcon sx={{ mr: 1, color: '#ffa726' }} /> {/* Warning icon */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#5f4300' }}> {/* Title styling */}
          Alerts!
        </Typography>
      </Box>
      {alerts.length > 0 ? (
        alerts.map((alert) => {
          // Split the message into title and description
          const parts = alert.message.split(':');
          const title = parts[0];
          const description = parts.length > 1 ? `:${parts.slice(1).join(':')}` : ''; // Join back in case of multiple colons

          return (
            <MuiLink 
              key={alert.id} 
              component="button" // Render as a button for accessibility
              variant="body2" 
              onClick={handleAlertClick}
              sx={{ 
                display: 'block', // Ensure links are block elements
                mb: 1, 
                color: '#5f4300', // Ensure text color matches
                textAlign: 'left', // Align text left
                textDecoration: 'none', // Remove default underline
                cursor: 'pointer', // Pointer cursor on hover
                border: 'none', // Remove button border
                background: 'none', // Remove button background
                padding: 0, // Remove button padding
                font: 'inherit', // Inherit font styles
                '&:hover .alert-title': { // Target the title span on hover
                  textDecoration: 'underline', // Add underline to title on hover
                }
              }}
            >
              <span className="alert-title">{title}</span>{/* Wrap title in span with class */}
              <span>{description}</span> {/* Description part */}
            </MuiLink>
          );
        })
      ) : (
        <Typography variant="body2" sx={{ color: '#5f4300' }}> {/* Ensure text color matches */}
          No pending alerts.
        </Typography>
      )}
    </Paper>
  );
};
