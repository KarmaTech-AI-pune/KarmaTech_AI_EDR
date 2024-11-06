import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export const ProjectFilter = () => {
  return (
    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Filter</InputLabel>
      <Select
        label="Filter"
        defaultValue=""
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="in-progress">In Progress</MenuItem>
        <MenuItem value="planning">Planning</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
        <MenuItem value="on-hold">On Hold</MenuItem>
      </Select>
    </FormControl>
  );
};