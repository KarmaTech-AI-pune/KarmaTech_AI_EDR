import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';

export const NotificationCenter = () => {
  const notifications = [
    { id: 1, message: 'New project assigned', date: '2023-05-01' },
    { id: 2, message: 'Task deadline approaching', date: '2023-05-15' },
    { id: 3, message: 'Resource allocation updated', date: '2023-05-30' },
  ];

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Notifications</Typography>
      <List>
        {notifications.map((notification) => (
          <ListItem key={notification.id}>
            <ListItemText primary={notification.message} secondary={`Received on: ${notification.date}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};