import { Typography, Paper, Grid } from '@mui/material';

export const ResourceManagement = () => {
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Resource Management</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle1">Total Resources: 50</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1">Available: 30</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1">Assigned: 20</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1">Utilization: 40%</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};