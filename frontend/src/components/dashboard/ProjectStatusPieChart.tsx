import { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button 
} from '@mui/material';

interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface SelectedStatus {
  status: string;
  count: number;
  projects: Project[];
}

interface StatusCounts {
  [key: string]: number;
}

// Function to fetch project data - replace with actual API call in production
const fetchProjectData = async (): Promise<Project[]> => {
  try {
    return [
      { id: 1, name: "City Water Supply Upgrade", status: "In Progress", progress: 65 },
      { id: 2, name: "Rural Sanitation Initiative", status: "Planning", progress: 25 },
      { id: 3, name: "Industrial Park Drainage System", status: "Completed", progress: 100 },
      { id: 4, name: "Smart City Water Management", status: "Planning", progress: 15 },
      { id: 5, name: "Coastal Zone Protection", status: "In Progress", progress: 45 },
      { id: 6, name: "Urban Flood Management", status: "In Progress", progress: 55 },
      { id: 7, name: "Metropolitan Water Distribution", status: "On Hold", progress: 30 },
      { id: 8, name: "Rural Water Conservation", status: "Completed", progress: 100 },
      { id: 9, name: "Stormwater Management System", status: "In Progress", progress: 70 },
      { id: 10, name: "Municipal Wastewater Treatment", status: "Planning", progress: 10 }
    ];
  } catch (error) {
    console.error('Error fetching project data:', error);
    return [];
  }
};

const ProjectStatusPieChart = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<SelectedStatus>({
    status: '',
    count: 0,
    projects: []
  });
  
  const [rawProjects, setRawProjects] = useState<Project[]>([]);
  
  // Define colors for different status categories
  const COLORS: { [key: string]: string } = {
    'Planning': '#8884d8',     // Purple
    'In Progress': '#82ca9d',  // Green
    'Completed': '#ffc658',    // Yellow
    'On Hold': '#ff8042'       // Orange
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const projects = await fetchProjectData();
      setRawProjects(projects);
      
      // Count projects by status
      const statusCounts: StatusCounts = {};
      projects.forEach(project => {
        if (statusCounts[project.status]) {
          statusCounts[project.status]++;
        } else {
          statusCounts[project.status] = 1;
        }
      });
      
      // Convert to array format required by PieChart
      const processedData: ChartData[] = Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
      }));
      
      setChartData(processedData);
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // Handle click on pie slice
  const handlePieClick = (data: ChartData) => {
    const status = data.name;
    const matchingProjects = rawProjects.filter(project => project.status === status);
    
    setSelectedStatus({
      status: status,
      count: matchingProjects.length,
      projects: matchingProjects
    });
    
    setDialogOpen(true);
  };
  
  const handleClose = () => {
    setDialogOpen(false);
  };
  
  const handleViewProjects = () => {
    setDialogOpen(false);
  };

  if (loading) {
    return <Typography>Loading chart data...</Typography>;
  }

  return (
    <Card sx={{ height: 'auto', boxShadow: 'none' }}>
      <CardContent>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                onClick={handlePieClick}
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name] || `#${Math.floor(Math.random()*16777215).toString(16)}`} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} projects`, name]} 
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        
        <Dialog
          open={dialogOpen}
          onClose={handleClose}
          aria-labelledby="project-dialog-title"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="project-dialog-title">
            Projects with Status: {selectedStatus.status}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              There are <strong>{selectedStatus.count} projects</strong> with status "{selectedStatus.status}".
            </Typography>
            
            {selectedStatus.projects.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Project List:
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {selectedStatus.projects.map((project) => (
                      <Typography component="li" key={project.id} variant="body2" gutterBottom>
                        {project.name} - Progress: {project.progress}%
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
            <Button onClick={handleViewProjects} color="primary" variant="contained">
              View All Projects
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProjectStatusPieChart;
