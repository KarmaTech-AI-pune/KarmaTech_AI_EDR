import { List, ListItem, ListItemText, Typography, Box } from '@mui/material';

export const NotificationCenter = () => {
  const notifications = [
    { id: 1, message: 'New project assigned', date: '2023-05-01' },
    { id: 2, message: 'Task deadline approaching', date: '2023-05-15' },
    { id: 3, message: 'Resource allocation updated', date: '2023-05-30' },
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
        Notifications
      </Typography>
      <List sx={{ p: 0 }}>
        {notifications.map((notification) => (
          <ListItem 
            key={notification.id}
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
                  {notification.message}
                </Typography>
              }
              secondary={
                <Typography variant="body2" sx={{ color: '#757575' }}>
                  Received on: {notification.date}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
