import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Sample project status data
const data = [
  { name: 'Planning', value: 3 },
  { name: 'In Progress', value: 4 },
  { name: 'Completed', value: 2 },
  { name: 'On Hold', value: 1 },
];

// Sample projects data
const projectsData = [
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

const ProjectStatusPieChart = () => {
  const [dialogInfo, setDialogInfo] = useState(null);
  
  // Colors for different status categories
  const COLORS = {
    'Planning': '#8884d8',      // Purple
    'In Progress': '#82ca9d',   // Green
    'Completed': '#ffc658',     // Yellow
    'On Hold': '#ff8042',       // Orange
  };
  
  // Handle click on pie slice
  const handlePieClick = (entry) => {
    const status = entry.name;
    const matchingProjects = projectsData.filter(project => project.status === status);
    
    setDialogInfo({
      status: status,
      count: matchingProjects.length,
      projects: matchingProjects
    });
  };
  
  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Project Status Distribution</h2>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              onClick={(_, index) => handlePieClick(data[index])}
              cursor="pointer"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name]} 
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} projects`]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Show dialog when pie slice is clicked */}
      {dialogInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">
              Projects with Status: {dialogInfo.status}
            </h3>
            <p className="mb-4">
              There are <strong>{dialogInfo.count} projects</strong> with status "{dialogInfo.status}".
            </p>
            
            {dialogInfo.projects.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold mb-1">Projects:</h4>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="pl-5 list-disc">
                    {dialogInfo.projects.map(project => (
                      <li key={project.id} className="text-sm mb-1">
                        {project.name} - Progress: {project.progress}%
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end gap-2">
              <button 
                className="px-4 py-2 bg-gray-200 rounded-md"
                onClick={() => setDialogInfo(null)}
              >
                Close
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={() => {
                  alert(`In production, this would redirect to a filtered list of ${dialogInfo.count} projects with status: ${dialogInfo.status}`);
                  setDialogInfo(null);
                }}
              >
                View All Projects
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusPieChart;