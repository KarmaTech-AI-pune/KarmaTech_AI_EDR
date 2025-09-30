import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ActionButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'primary',
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();

  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          }
        };
      case 'secondary':
        return {
          backgroundColor: theme.palette.grey[100],
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.grey[200],
          }
        };
      case 'danger':
        return {
          backgroundColor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.error.dark,
          }
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.palette.primary.main,
          border: `1px solid ${theme.palette.primary.main}`,
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }
        };
      default:
        return {};
    }
  };

  return (
    <Button
      {...props}
      sx={{
        textTransform: 'none',
        borderRadius: 2,
        fontWeight: 500,
        ...getButtonStyles(),
        ...sx
      }}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
