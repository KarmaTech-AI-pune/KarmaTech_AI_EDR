import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CashflowData } from '../../data/types/dashboard';
import { getCurrencySymbol } from '../../utils/formatters';

interface CashflowChartProps {
  data: CashflowData[];
  currencyCode?: string;
}

const CashflowChart: React.FC<CashflowChartProps> = ({ data, currencyCode }) => {
  const [timeframe, setTimeframe] = React.useState('This Year');

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframe(event.target.value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 1,
            boxShadow: 2
          }}
        >
          <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography
              key={index}
              variant="caption"
              sx={{ 
                color: entry.color,
                display: 'block'
              }}
            >
              {entry.name}: {getCurrencySymbol(currencyCode)}{entry.value}K
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="semibold">
            Monthly Cashflow Analysis
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={timeframe}
              onChange={handleTimeframeChange}
              displayEmpty
            >
              <MenuItem value="This Year">This Year</MenuItem>
              <MenuItem value="Last Year">Last Year</MenuItem>
              <MenuItem value="Compare Years">Compare Years</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
                tickFormatter={(value) => `${getCurrencySymbol(currencyCode)}${value}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar 
                dataKey="planned" 
                name="Planned Revenue"
                fill="#1976d2" 
                opacity={0.7}
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="actual" 
                name="Actual Revenue"
                fill="#4caf50" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CashflowChart;
