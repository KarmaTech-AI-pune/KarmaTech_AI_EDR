import { ListItem, ListItemText, Box, LinearProgress, Typography } from '@mui/material';
import { ProjectItemProps } from '../types';


export const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
  return (
    <ListItem sx={{ bgcolor: '#e0e0e0', mb: 1, borderRadius: 1 }}>
      <ListItemText 
        primary={project.name}
        secondary={`Status: ${project.status}`}
      />
      <Box sx={{ width: '30%', mr: 1 }}>
        <Typography variant="body2" color="text.secondary">Progress</Typography>
        <LinearProgress variant="determinate" value={project.progress} />
      </Box>
      <Typography variant="body2">{`${project.progress}%`}</Typography>
    </ListItem>
  );
};