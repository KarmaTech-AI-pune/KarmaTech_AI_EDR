
import React, { useState, useEffect } from 'react';
import BargraphPopup, { BargraphData as PopupBargraphData } from '../common/BargraphPopup';


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

interface PopupState {
  open: boolean;
  formType: string;
  stateType: string;
  opportunities: PopupBargraphData[];
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
    // For demo, returning mock data that matches the screenshots
    return [
      // Opportunity Tracking - BDM (3)
      { 
        id: 1, 
        name: "City Water Supply Upgrade", 
        state: "BDM" as const,
        form: "OpportunityTracking" as const
      },
      { 
        id: 2, 
        name: "Rural Sanitation Initiative", 
        state: "BDM" as const,
        form: "OpportunityTracking" as const
      },
      { 
        id: 3, 
        name: "Urban Drainage System", 
        state: "BDM" as const,
        form: "OpportunityTracking" as const
      },
      
      // Opportunity Tracking - RM (1)
      { 
        id: 4, 
        name: "Coastal Zone Protection", 
        state: "RM" as const,
        form: "OpportunityTracking" as const
      },
      
      // Opportunity Tracking - RD (1)
      { 
        id: 5, 
        name: "Highway Drainage System", 
        state: "RD" as const,
        form: "OpportunityTracking" as const
      },
      
      // Go/No Go - BDM (1)
      { 
        id: 6, 
        name: "Municipal Water Treatment", 
        state: "BDM" as const,
        form: "GoNoGo" as const
      },
      
      // Go/No Go - RM (2)
      { 
        id: 7, 
        name: "River Rejuvenation Project", 
        state: "RM" as const,
        form: "GoNoGo" as const
      },
      { 
        id: 8, 
        name: "Urban Waste Management", 
        state: "RM" as const,
        form: "GoNoGo" as const
      },
      
      // Go/No Go - RD (1)
      { 
        id: 9, 
        name: "Metropolitan Sewage Upgrade", 
        state: "RD" as const,
        form: "GoNoGo" as const
      },
      
      // Bid Preparation - BDM (3)
      { 
        id: 10, 
        name: "Rural Water Supply", 
        state: "BDM" as const,
        form: "BidPreparation" as const
      },
      { 
        id: 11, 
        name: "Stormwater Management", 
        state: "BDM" as const,
        form: "BidPreparation" as const
      },
      { 
        id: 12, 
        name: "Lake Conservation", 
        state: "BDM" as const,
        form: "BidPreparation" as const
      },
      
      // Bid Preparation - RM (1)
      { 
        id: 13, 
        name: "Urban Flood Management", 
        state: "RM" as const,
        form: "BidPreparation" as const
      },
      
      // Bid Preparation - RD (1)
      { 
        id: 14, 
        name: "Smart City Water Management", 
        state: "RD" as const,
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
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [popupState, setPopupState] = useState<PopupState>({
    open: false,
    formType: '',
    stateType: '',
    opportunities: []
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const fetchedOpportunities: OpportunityData[] = await fetchOpportunityData();
      setOpportunities(fetchedOpportunities);
      
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
          formData[state] = fetchedOpportunities.filter(
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

  // Handle click on a bar segment
  const handleBarClick = (formType: string, stateType: string) => {
    // Convert form type display name back to the enum value
    const formTypeEnum = 
      formType === 'Opportunity Tracking' ? 'OpportunityTracking' :
      formType === 'Go/No Go' ? 'GoNoGo' : 'BidPreparation';
    
    // Filter opportunities that match the clicked segment
    const filteredOpportunities = opportunities.filter(
      opp => opp.form === formTypeEnum && opp.state === stateType
    );

    // Open the popup with the filtered opportunities
    setPopupState({
      open: true,
      formType,
      stateType,
      opportunities: filteredOpportunities
    });
  };

  // Handle closing the popup
  const handleClosePopup = () => {
    setPopupState({
      ...popupState,
      open: false
    });
  };

  // Handle view details button click
  const handleViewDetails = () => {
    // This would navigate to a detailed view in the future
    console.log('View details for:', popupState.formType, popupState.stateType);
    handleClosePopup();
  };

  if (loading) {
    return <Typography>Loading chart data...</Typography>;
  }

  return (
    <>
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
                <Bar 
                  dataKey="BDM" 
                  stackId="a" 
                  fill="#8884d8" 
                  name="Business Development Manager" 
                  onClick={(data) => handleBarClick(data.name, 'BDM')}
                  style={{ cursor: 'pointer' }}
                />
                <Bar 
                  dataKey="RM" 
                  stackId="a" 
                  fill="#82ca9d" 
                  name="Regional Manager" 
                  onClick={(data) => handleBarClick(data.name, 'RM')}
                  style={{ cursor: 'pointer' }}
                />
                <Bar 
                  dataKey="RD" 
                  stackId="a" 
                  fill="#ffc658" 
                  name="Regional Director" 
                  onClick={(data) => handleBarClick(data.name, 'RD')}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Use the reusable BargraphPopup component */}
      <BargraphPopup
        open={popupState.open}
        title={`${popupState.formType} - ${popupState.stateType} State`}
        categoryName={popupState.formType}
        stateName={popupState.stateType}
        opportunities={popupState.opportunities}
        onClose={handleClosePopup}
        onViewDetails={handleViewDetails}
      />
    </>
  );
};

export default OpportunityStackedBarChart;
