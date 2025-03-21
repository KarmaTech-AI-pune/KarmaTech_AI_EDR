import React, { useState, useEffect } from 'react';

interface OpportunityData {
  id: number;
  name: string;
  state: 'BDM' | 'RM' | 'RD';
  form: 'OpportunityTracking' | 'GoNoGo' | 'BidPreparation';
}

interface ChartData {
  name: string;
  BDM?: number;
  RM?: number;
  RD?: number;
}
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
import { Card, CardContent, Typography, Box } from '@mui/material';

// This function will fetch opportunity data from your API
const fetchOpportunityData = async (): Promise<OpportunityData[]> => {
  try {
    // For demo, returning mock data that matches your requirements
    return [
      { 
        id: 1, 
        name: "City Water Supply Upgrade", 
        state: "RD" as const, // Regional Director
        form: "OpportunityTracking" as const
      },
      { 
        id: 2, 
        name: "Rural Sanitation Initiative", 
        state: "RM" as const, // Regional Manager
        form: "OpportunityTracking" as const
      },
      { 
        id: 3, 
        name: "Industrial Park Drainage System", 
        state: "BDM" as const, // Business Development Manager
        form: "OpportunityTracking" as const
      },
      { 
        id: 4, 
        name: "Urban Flood Management", 
        state: "BDM" as const, // Business Development Manager
        form: "OpportunityTracking" as const
      },
      { 
        id: 5, 
        name: "Smart City Water Management", 
        state: "BDM" as const, // Business Development Manager
        form: "OpportunityTracking" as const
      },
      { 
        id: 6, 
        name: "Coastal Zone Protection", 
        state: "RM" as const, // Regional Manager
        form: "GoNoGo" as const
      },
      { 
        id: 7, 
        name: "Highway Drainage System", 
        state: "RM" as const, // Regional Manager
        form: "GoNoGo" as const
      },
      { 
        id: 8, 
        name: "Municipal Water Treatment", 
        state: "BDM" as const, // Business Development Manager
        form: "GoNoGo" as const
      },
      { 
        id: 9, 
        name: "River Rejuvenation Project", 
        state: "RD" as const, // Regional Director
        form: "GoNoGo" as const
      },
      { 
        id: 10, 
        name: "Metropolitan Sewage Upgrade", 
        state: "RD" as const, // Regional Director
        form: "BidPreparation" as const
      },
      { 
        id: 11, 
        name: "Rural Water Supply", 
        state: "RM" as const, // Regional Manager
        form: "BidPreparation" as const
      },
      { 
        id: 12, 
        name: "Urban Waste Management", 
        state: "BDM" as const, // Business Development Manager
        form: "BidPreparation" as const
      },
      { 
        id: 13, 
        name: "Stormwater Management", 
        state: "BDM" as const, // Business Development Manager
        form: "BidPreparation" as const
      },
      { 
        id: 14, 
        name: "Lake Conservation", 
        state: "BDM" as const, // Business Development Manager
        form: "BidPreparation" as const
      },
    ];
  } catch (error) {
    console.error('Error fetching opportunity data:', error);
    return [];
  }
};

// This component transforms raw data into the format needed by the chart
const OpportunityStackedBarChart = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const opportunities: OpportunityData[] = await fetchOpportunityData();
      
      // Process data for the stacked bar chart
      const formTypes: OpportunityData['form'][] = ['OpportunityTracking', 'GoNoGo', 'BidPreparation'];
      const stateTypes: OpportunityData['state'][] = ['BDM', 'RM', 'RD'];
      
      const processedData = formTypes.map(formType => {
        // Create an entry for each form type
        const formData: ChartData = {
          name: formType === 'OpportunityTracking' ? 'Opportunity Tracking' : 
                formType === 'GoNoGo' ? 'Go/No Go' : 'Bid Preparation',
        };
        
        // Count opportunities for each state
        stateTypes.forEach(state => {
          formData[state] = opportunities.filter(
            opp => opp.form === formType && opp.state === state
          ).length;
        });
        
        return formData;
      });
      
      setChartData(processedData);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return <Typography>Loading chart data...</Typography>;
  }

  return (
    <Card sx={{ marginBottom: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Status of Opportunities
        </Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  return [`${value} opportunities`, `${name} state`];
                }}
              />
              <Legend />
              <Bar dataKey="BDM" stackId="a" fill="#8884d8" name="Business Development Manager" />
              <Bar dataKey="RM" stackId="a" fill="#82ca9d" name="Regional Manager" />
              <Bar dataKey="RD" stackId="a" fill="#ffc658" name="Regional Director" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OpportunityStackedBarChart;
