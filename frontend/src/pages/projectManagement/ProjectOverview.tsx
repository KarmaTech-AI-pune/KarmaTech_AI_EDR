import React from 'react';
import { Typography, Box, Grid, Card, CardContent } from '@mui/material';
import { useProjectDetailsContext } from './ProjectDetails';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ mr: 1, color: 'primary.main' }}>{icon}</Box>
                <Typography variant="h6" component="div">
                    {title}
                </Typography>
            </Box>
            {children}
        </CardContent>
    </Card>
);
  
  const InfoItem: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1">
        {value || 'Not specified'}
      </Typography>
    </Box>
  );

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const getManagerName = (managerId: string, managerNames: { [key: string]: string }) => {
    if (!managerId) return 'Not assigned';
    return managerNames[managerId] || 'Loading...';
  };

const ProjectOverview: React.FC = () => {
    const { project, managerNames } = useProjectDetailsContext();
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Basic Project Info */}
        <Grid item xs={12} md={6}>
          <InfoCard title="Project Information" icon={<HomeIcon />}>
            <InfoItem label="Project Number" value={project.projectNo} />
            <InfoItem label="Type of Job" value={project.typeOfJob} />
            <InfoItem label="Sector" value={project.sector} />
            <InfoItem label="Priority" value={project.priority} />
          </InfoCard>
        </Grid>

        {/* Client Info */}
        <Grid item xs={12} md={6}>
          <InfoCard title="Client Information" icon={<BusinessIcon />}>
            <InfoItem label="Client Name" value={project.clientName} />
            <InfoItem label="Type of Client" value={project.typeOfClient} />
            <InfoItem label="Region" value={project.region} />
            <InfoItem label="Office" value={project.office} />
          </InfoCard>
        </Grid>

        {/* Management Info */}
        <Grid item xs={12} md={4}>
          <InfoCard title="Management" icon={<PersonIcon />}>
            <InfoItem
              label="Project Manager"
              value={getManagerName(project.projectManagerId, managerNames)}
            />
            <InfoItem
              label="Senior Project Manager"
              value={getManagerName(project.seniorProjectManagerId, managerNames)}
            />
            <InfoItem
              label="Regional Manager"
              value={getManagerName(project.regionalManagerId, managerNames)}
            />
          </InfoCard>
        </Grid>

        {/* Financial Info */}
        <Grid item xs={12} md={4}>
          <InfoCard title="Financial Details" icon={<AttachMoneyIcon />}>
            <InfoItem
              label="Estimated Project Cost"
              value={formatCurrency(project.estimatedProjectCost, project.currency)}
            />
            <InfoItem
              label="Estimated Project Fee"
              value={formatCurrency(project.estimatedProjectFee, project.currency)}
            />
            <InfoItem label="Fee Type" value={project.feeType} />
          </InfoCard>
        </Grid>

        {/* Timeline Info */}
        <Grid item xs={12} md={4}>
          <InfoCard title="Timeline" icon={<CalendarTodayIcon />}>
            <InfoItem label="Start Date" value={formatDate(project.startDate)} />
            <InfoItem label="End Date" value={formatDate(project.endDate)} />
          </InfoCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectOverview;
