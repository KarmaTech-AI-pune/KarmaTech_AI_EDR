import { List, ListItem, ListItemText, Typography, Box } from '@mui/material';

export const ReportsList = () => {
  const reports = [
    { id: 1, name: 'Monthly Progress Report', date: '2023-05-01' },
    { id: 2, name: 'Resource Utilization Report', date: '2023-05-15' },
    { id: 3, name: 'Financial Summary', date: '2023-05-30' },
  ];

  return (
    <Box 
      sx={{ 
        p: 2,
        bgcolor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          fontWeight: 500,
          color: '#1a237e',
          mb: 2
        }}
      >
        Reports
      </Typography>
      <List sx={{ p: 0 }}>
        {reports.map((report) => (
          <ListItem 
            key={report.id}
            sx={{
              px: 0,
              '&:not(:last-child)': {
                borderBottom: '1px solid #f0f0f0'
              }
            }}
          >
            <ListItemText 
              primary={
                <Typography variant="subtitle1" sx={{ color: '#424242' }}>
                  {report.name}
                </Typography>
              }
              secondary={
                <Typography variant="body2" sx={{ color: '#757575' }}>
                  Generated on: {report.date}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
