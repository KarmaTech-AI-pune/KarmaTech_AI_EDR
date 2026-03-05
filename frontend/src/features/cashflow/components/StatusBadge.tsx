/**
 * StatusBadge Component (Dumb Component)
 * Pure presentational component for displaying status badges
 */

import React from 'react';
import { StatusBadgeProps } from '../types';
import { STATUS_CONFIG } from '../utils';

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Completed;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      {config.label}
    </span>
  );
};
