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
  ResponsiveContainer,
  Cell
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
      const { planned, actual, variance } = payload[0].payload;
      const currency = getCurrencySymbol(currencyCode);

      return (
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            p: 2,
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: 180
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, borderBottom: '1px solid #eee', pb: 0.5 }}>
            {label}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">Planned Revenue (Budget):</Typography>
              <Typography variant="caption" fontWeight="bold" sx={{ color: planned < 0 ? '#d32f2f' : '#16a34a' }}>
                {currency}{planned}K
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">Actual Revenue (Progress):</Typography>
              <Typography variant="caption" fontWeight="bold" sx={{ color: actual > 0 ? '#16a34a' : '#d32f2f' }}>
                {currency}{actual}K
              </Typography>
            </Box>

            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
              pt: 0.5,
              borderTop: '1px dashed #eee'
            }}>
              <Typography variant="caption" fontWeight="bold">Net Cash Flow:</Typography>
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{ color: variance >= 0 ? '#16a34a' : '#d32f2f' }}
              >
                {currency}{variance}K
              </Typography>
            </Box>
          </Box>
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
        |
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
                name="Planned Revenue (Budget)"
                radius={[2, 2, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.planned < 0 ? '#f44336' : '#90caf9'}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="actual"
                name="Actual Revenue (Progress)"
                radius={[2, 2, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.actual > 0 ? '#4caf50' : '#f44336'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CashflowChart;
