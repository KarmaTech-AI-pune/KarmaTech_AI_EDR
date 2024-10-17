import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';

export const ReportsList = () => {
  const reports = [
    { id: 1, name: 'Monthly Progress Report', date: '2023-05-01' },
    { id: 2, name: 'Resource Utilization Report', date: '2023-05-15' },
    { id: 3, name: 'Financial Summary', date: '2023-05-30' },
  ];

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Reports</Typography>
      <List>
        {reports.map((report) => (
          <ListItem key={report.id}>
            <ListItemText primary={report.name} secondary={`Generated on: ${report.date}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};