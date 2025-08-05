import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useOutletContext } from 'react-router-dom';
import { OpportunityTracking } from '../../models';
import { HistoryWidget } from '../../components/widgets/HistoryWidget';

interface InfoCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children }) => (
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

type ContextType = {
  opportunity: OpportunityTracking;
  histories: any[]; 
};

export const BOverview: React.FC = () => {
  const { opportunity, histories } = useOutletContext<ContextType>();

  const formatCurrency = (amount: number | undefined, currency: string) => {
    if (amount === undefined) return 'Not specified';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return 'Not specified';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <InfoCard title="Opportunity Information" icon={<HomeIcon />}>
            <InfoItem label="Work Name" value={opportunity.workName} />
            <InfoItem label="Client" value={opportunity.client} />
            <InfoItem label="Client Sector" value={opportunity.clientSector} />
            <InfoItem label="Operation" value={opportunity.operation} />
            <InfoItem label="Status" value={opportunity.status} />
          </InfoCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <InfoCard title="Project Details" icon={<BusinessIcon />}>
            <InfoItem label="Stage" value={opportunity.stage} />
            <InfoItem label="Strategic Ranking" value={opportunity.strategicRanking} />
            <InfoItem label="Contract Type" value={opportunity.contractType} />
            <InfoItem label="Funding Stream" value={opportunity.fundingStream} />
          </InfoCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <InfoCard title="Financial Details" icon={<AttachMoneyIcon />}>
            <InfoItem
              label="Capital Value"
              value={formatCurrency(opportunity.capitalValue, opportunity.currency || 'USD')}
            />
            <Chip
              label={opportunity.currency || 'USD'}
              size="small"
              color="primary"
              sx={{ mt: 1 }}
            />
          </InfoCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <InfoCard title="Timeline" icon={<CalendarTodayIcon />}>
            <InfoItem label="Likely Start Date" value={formatDate(opportunity.likelyStartDate)} />
            <InfoItem label="Duration (months)" value={opportunity.durationOfProject} />
          </InfoCard>
        </Grid>

        <Grid item xs={12}>
          <HistoryWidget
            histories={histories}
            title={`History - ${opportunity.workName}`}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BOverview;
