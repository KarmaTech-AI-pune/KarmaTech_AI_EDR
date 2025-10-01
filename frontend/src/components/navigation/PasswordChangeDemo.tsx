import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import PasswordChangeDropdown from './PasswordChangeDropdown';

/**
 * Demo component to showcase the Password Change Dropdown functionality
 * This can be used for testing or demonstration purposes
 */
export const PasswordChangeDemo: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleShowDropdown = () => {
    setShowDropdown(true);
  };

  const handleCloseDropdown = () => {
    setShowDropdown(false);
  };

  return (
    <Box sx={{ p: 4, position: 'relative' }}>
      <Paper elevation={2} sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom align="center">
          Password Change Dropdown Demo
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Click the button below to see the password change dropdown in action
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <Button
            variant="contained"
            onClick={handleShowDropdown}
            disabled={showDropdown}
          >
            {showDropdown ? 'Dropdown is Open' : 'Show Password Change'}
          </Button>

          {showDropdown && (
            <PasswordChangeDropdown onClose={handleCloseDropdown} />
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2, display: 'block' }}>
          This dropdown will appear when you click "Change Password" in the avatar menu
        </Typography>
      </Paper>
    </Box>
  );
};

export default PasswordChangeDemo;
