import { Project, ProjectStatus } from "../../types/index"

const projectsData = {
  "1":{
    "id": 1,
    "name": "City Water Supply Upgrade",
    "clientName": "Metropolis Municipality",
    "clientSector": "Government",
    "sector": "Water",
    "estimatedCost": 5000000,
    "startDate": "2023-01-01",
    "endDate": "2024-12-31",
    "status": 6,
    "progress": 65,
    "contractType": "EPC",
    "currency": "INR",
    "createdAt": "2022-12-01",
    "createdBy": "System"
  },
  "2":{
    "id": 2,
    "name": "Rural Sanitation Initiative",
    "clientName": "State Rural Development Dept",
    "clientSector": "Government", 
    "sector": "Sanitation",
    "estimatedCost": 2000000,
    "startDate": "2023-03-15",
    "endDate": "2025-03-14",
    "status": 0,
    "progress": 25,
    "contractType": "Design-Build",
    "currency": "INR",
    "createdAt": "2023-02-15",
    "createdBy": "System"
  },
  "3":{
    "id": 3,
    "name": "Industrial Park Drainage System",
    "clientName": "Industrial Development Corp",
    "clientSector": "Private",
    "sector": "Industrial",
    "estimatedCost": 3500000,
    "startDate": "2022-07-01",
    "endDate": "2023-12-31",
    "status": 0,
    "progress": 100,
    "contractType": "Turnkey",
    "currency": "INR",
    "createdAt": "2022-06-01",
    "createdBy": "System"
  },
  "4":{
    "id": 4,
    "name": "Smart City Water Management",
    "clientName": "Smart City Development Authority",
    "clientSector": "Government",
    "sector": "Smart City",
    "estimatedCost": 7500000,
    "status": "DecisionPending",
    "progress": 0,
    "contractType": "EPC",
    "currency": "INR",
    "createdAt": "2023-11-01",
    "createdBy": "System"
  },
  "5":{
    "id": 5,
    "name": "Coastal Zone Protection",
    "clientName": "Maritime Development Board",
    "clientSector": "Government",
    "sector": "Coastal",
    "estimatedCost": 4500000,
    "startDate": "2023-06-01",
    "endDate": "2025-05-31",
    "status": 2,
    "progress": 45,
    "contractType": "Design-Build",
    "currency": "INR",
    "createdAt": "2023-05-01",
    "createdBy": "System"
  },
  "6":{
    "id" : 6,
    "name" : "Urban Flood Management",
    "clientName" : "City Municipal Corporation",
    "clientSector" : "Government",
    "sector" : "Urban Infrastructure",
    "estimatedCost" : 3200000,
    "status" : 1,
    "progress" : 0,
    "startDate": "2023-06-01",
    "endDate": "2025-05-31",
    "contractType" : "EPC",
    "currency" : "INR",
    "createdAt" : "2023-11-15",
    "createdBy" : "System"
},
"7": {
    "id" : 7,
    "name" : "Pune City Water Supply Upgrade",
    "clientName" : "Municipality",
    "clientSector" : "Government",
    "sector" : "Water",
    "estimatedCost" : 600000,
    "startDate" :"2023-01-01",
    "endDate" : "2024-12-31",
    "status" : 6,
    "progress" : 65,
    "contractType" : "EPC",
    "currency" : "INR",
    "createdAt" : "2023-01-01",
    "createdBy" : "System"
},
"8" :{
    "id" : 8,
    "name" : "Rural Initiative",
    "clientName" : "Maharashtra Rural Development Dept",
    "clientSector" : "Government",
    "sector" : "Sanitation",
    "estimatedCost" : 2000000,
    "startDate" : "2023-03-15",
    "endDate" : "2025-03-14",
    "status" : 1,
    "progress" : 25,
    "contractType" : "Design-Build",
    "currency" : "INR",
    "createdAt" :"2023-01-01",
    "createdBy" : "System"
},
"9" :{
    "id" : 9,
    "name" : "Industrial Park System",
    "clientName" : "Industrial Development Corp",
    "clientSector" : "Private",
    "sector" : "Industrial",
    "estimatedCost" : 3500000,
    "startDate" : "2023-03-15",
    "endDate" : "2025-03-14",
    "status" : 3,
    "progress" : 100,
    "contractType" : "Turnkey",
    "currency" : "INR",
    "createdAt" : "2023-01-01",
    "createdBy" : "System"
},
"10" :{
    "id" : 10,
    "name" : "City Water Management 2",
    "clientName" : "Smart City Development Authority",
    "clientSector" : "Government",
    "sector" : "Smart City",
    "estimatedCost" : 7500000,
    "status" : 4,
    "progress" : 0,
    "contractType" : "EPC",
    "currency" : "INR",
    "createdAt" :"2023-01-01",
    "createdBy" : "System"
},
"11" :{
    "id" : 11,
    "name" : "Coastal Protection 2",
    "clientName" : "Maritime Development Board",
    "clientSector" : "Government",
    "sector" : "Coastal",
    "estimatedCost" : 4500000,
    "startDate": "2023-06-01",
    "endDate": "2025-05-31",
    "status" : 5,
    "progress" : 45,
    "contractType" : "Design-Build",
    "currency" : "INR",
    "createdAt" : "2023-05-01",
    "createdBy" : "System"
},
"12" :{
    "id" : 12,
    "name" : "Urban Management",
    "clientName" : "City Municipal Corporation",
    "clientSector" : "Government",
    "sector" : "Urban Infrastructure",
    "estimatedCost" : 3200000,
    "status" : 6,
    "progress" : 0,
    "contractType" : "EPC",
    "currency" : "INR",
    "createdAt" : "2023-05-01",
    "createdBy" : "System"
},
"13" :{
    "id" : 13,
    "name" : "Urban Management 23",
    "clientName" : "City Municipal Corporation",
    "clientSector" : "Government",
    "sector" : "Urban Infrastructure",
    "estimatedCost" : 3900000,
    "status" : 7,
    "progress" : 0,
    "contractType" : "EPC",
    "currency" : "INR",
    "createdAt" : "2023-11-15",
    "createdBy" : "System"
},
"14" :{
    "id" : 14,
    "name" : "Mega Industrial Park",
    "clientName" : "State Industrial Development Corp",
    "clientSector" : "Government",
    "sector" : "Industrial",
    "estimatedCost" : 12500000,
    "status" : 1,
    "progress" : 0,
    "contractType" : "EPC",
    "currency" : "INR",
    "createdAt" : "2023-12-01",
    "createdBy" : "System"
},
"15" :{
    "id" : 15,
    "name" : "Expressway Stormwater Drainage",
    "clientName" : "National Highway Authority",
    "clientSector" : "Government",
    "sector" : "Transportation",
    "estimatedCost" : 7800000,
    "status" : 1,
    "progress" : 0,
    "contractType" : "Design-Build",
    "currency" : "INR",
    "createdAt" : "2023-12-05",
    "createdBy" : "System"
}
} as const;

// Transform the JSON object into an array of Project type
export const projects: Project[] = Object.values(projectsData).map(project => ({
  ...project,
  status: project.status as ProjectStatus,
}));

// Utility function to get a single project by ID
export const getProjectById = (id: number): Project | undefined => {
  return projects.find(project => project.id === id);
};

// Utility function to filter projects by status
export const getProjectsByStatus = (status: ProjectStatus): Project[] => {
  return projects.filter(project => project.status === status);
};

// Utility function to filter projects by sector
export const getProjectsBySector = (sector: string): Project[] => {
  return projects.filter(project => project.sector === sector);
};

// Utility function to get projects in progress (status = 6)
export const getProjectsInProgress = (): Project[] => {
  return getProjectsByStatus(ProjectStatus["In Progress"]);
};

// Utility function to get completed projects (status = 7)
export const getCompletedProjects = (): Project[] => {
  return getProjectsByStatus(ProjectStatus.Completed);
};

// Utility function to get projects awaiting decision (status = 1)
export const getProjectsAwaitingDecision = (): Project[] => {
  return getProjectsByStatus(ProjectStatus["Decision Pending"]);
};

// Utility function to calculate total project value by status
export const calculateTotalProjectValue = (status?: ProjectStatus): number => {
  const projectsToSum = status !== undefined 
    ? getProjectsByStatus(status) 
    : projects;
  
  return projectsToSum.reduce((sum, project) => sum + project.estimatedCost, 0);
};
