import React from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface ExpandCollapseToggleProps {
  hasExpandedItems: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Toggle button component for expanding/collapsing all hierarchical WBS items
 * Provides accessibility features and visual feedback for bulk operations
 */
const ExpandCollapseToggle: React.FC<ExpandCollapseToggleProps> = ({
  hasExpandedItems,
  onExpandAll,
  onCollapseAll,
  isLoading = false,
  disabled = false
}) => {
  const theme = useTheme();

  const handleClick = () => {
    if (hasExpandedItems) {
      onCollapseAll();
    } else {
      onExpandAll();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Support Enter and Space keys for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const buttonText = hasExpandedItems ? 'Collapse All' : 'Expand All';
  const buttonIcon = hasExpandedItems ? <ExpandLessIcon /> : <ExpandMoreIcon />;
  const ariaLabel = hasExpandedItems 
    ? 'Collapse all WBS hierarchy items' 
    : 'Expand all WBS hierarchy items';

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || isLoading}
        startIcon={isLoading ? <CircularProgress size={16} /> : buttonIcon}
        aria-label={ariaLabel}
        aria-pressed={hasExpandedItems}
        role="button"
        tabIndex={0}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          fontWeight: 500,
          minWidth: 140,
          height: 36,
          color: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderColor: theme.palette.primary.main,
          },
          '&:focus': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
          '&:disabled': {
            opacity: 0.6,
            cursor: 'not-allowed',
          },
          // Ensure sufficient color contrast for accessibility
          '@media (prefers-contrast: high)': {
            borderWidth: 2,
            fontWeight: 600,
          }
        }}
      >
        {buttonText}
      </Button>
    </Box>
  );
};

export default ExpandCollapseToggle;