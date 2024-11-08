import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { ProjectStatus } from '../../types';

interface ProjectFilterProps {
  onFilterChange: (status: ProjectStatus | '') => void;
  currentFilter: ProjectStatus | '';
}

export const ProjectFilter: React.FC<ProjectFilterProps> = ({ onFilterChange, currentFilter }) => {
  const handleChange = (event: SelectChangeEvent<ProjectStatus | ''>) => {
    const selectedValue = event.target.value;
    onFilterChange(selectedValue as ProjectStatus | '');
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
        <MenuItem value={ProjectStatus.Opportunity}>Opportunity</MenuItem>
        <MenuItem value={ProjectStatus['Decision Pending']}>Decision Pending</MenuItem>
        <MenuItem value={ProjectStatus.Cancelled}>Cancelled</MenuItem>
        <MenuItem value={ProjectStatus['Bid Submitted']}>Bid Submitted</MenuItem>
        <MenuItem value={ProjectStatus['Bid Rejected']}>Bid Rejected</MenuItem>
        <MenuItem value={ProjectStatus['Bid Accepted']}>Bid Accepted</MenuItem>
        <MenuItem value={ProjectStatus['In Progress']}>In Progress</MenuItem>
        <MenuItem value={ProjectStatus.Completed}>Completed</MenuItem>
      </Select>
    </FormControl>
  );
};
