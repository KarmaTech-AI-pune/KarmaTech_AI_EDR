import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent 
} from '@mui/material';
import { ProjectStatus } from '../../types/index';

export interface ProjectFilterProps {
  onFilterChange: (status: ProjectStatus | '') => void;
  currentFilter: ProjectStatus | '';
  statuses?: ProjectStatus[];
}

export const ProjectFilter: React.FC<ProjectFilterProps> = ({ 
  onFilterChange, 
  currentFilter, 
  statuses 
}) => {
  const handleChange = (event: SelectChangeEvent<ProjectStatus | ''>) => {
    const selectedValue = event.target.value;
    onFilterChange(selectedValue as ProjectStatus | '');
  };

  // Use provided statuses or default to all statuses
  const statusesToRender = statuses || Object.values(ProjectStatus).filter(
    status => typeof status === 'number'
  );

  // Mapping to convert enum values to readable strings
  const statusLabels: Record<ProjectStatus, string> = {
    [ProjectStatus.Opportunity]: 'Opportunity',
    [ProjectStatus.DecisionPending]: 'Decision Pending',
    [ProjectStatus.Cancelled]: 'Cancelled',
    [ProjectStatus.BidSubmitted]: 'Bid Submitted',
    [ProjectStatus.BidRejected]: 'Bid Rejected',
    [ProjectStatus.BidAccepted]: 'Bid Accepted',
    [ProjectStatus.InProgress]: 'In Progress',
    [ProjectStatus.Completed]: 'Completed'
  };

  return (
    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Status</InputLabel>
      <Select
        label="Status"
        value={currentFilter}
        onChange={handleChange}
      >
        <MenuItem value="">All</MenuItem>
        {statusesToRender.map(status => (
          <MenuItem key={status} value={status}>
            {statusLabels[status as ProjectStatus]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
