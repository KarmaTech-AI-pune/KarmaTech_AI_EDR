import { useState, useEffect } from 'react';
import {Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

// Dummy data
const dummyProjects = [
  { id: 1, name: 'Project Alpha', status: 'In Progress' },
  { id: 2, name: 'Project Beta', status: 'Planning' },
  { id: 3, name: 'Project Gamma', status: 'Completed' },
];

export const ProjectList = () => {
  const [projects, setProjects] = useState(dummyProjects);

  useEffect(() => {
    // Simulating data fetching
    const fetchProjects = async () => {
      try {
        // Replace this with actual API call when backend is ready
        // const response = await fetch('/api/projects');
        // const data = await response.json();
        // setProjects(data);
        
        // For now, we'll just use the dummy data
        setProjects(dummyProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Projects</Typography>
      <List>
        {projects.map(project => (
          <ListItem key={project.id}>
            <ListItemText 
              primary={project.name}
              secondary={`Status: ${project.status}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};