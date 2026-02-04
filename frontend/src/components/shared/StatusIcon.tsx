import React from 'react';
import { 
  Schedule, 
  Warning, 
  AttachMoney, 
  CheckCircle 
} from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';
import { Project } from '../../data/types/dashboard';
import { STATUS_COLORS } from '../../utils/constants';

interface StatusIconProps extends Omit<SvgIconProps, 'color'> {
  status: Project['status'];
}

const StatusIcon: React.FC<StatusIconProps> = ({ status, ...props }) => {
  const iconColor = STATUS_COLORS[status];

  const getIcon = () => {
    switch (status) {
      case 'falling_behind':
        return <Schedule {...props} sx={{ color: iconColor, ...props.sx }} />;
      case 'scope_issue':
        return <Warning {...props} sx={{ color: iconColor, ...props.sx }} />;
      case 'cost_overrun':
        return <AttachMoney {...props} sx={{ color: iconColor, ...props.sx }} />;
      default:
        return <CheckCircle {...props} sx={{ color: iconColor, ...props.sx }} />;
    }
  };

  return getIcon();
};

export default StatusIcon;
