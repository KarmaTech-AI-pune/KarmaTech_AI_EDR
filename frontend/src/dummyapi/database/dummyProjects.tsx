import { Project } from "../../models"
import { ProjectStatus } from "../../types/index"

// Define a type for the raw project data that includes all possible field variations
type RawProject = {
  id: string;
  name: string;
  details?: string;
  clientName: string;
  projectManagerId?: string;
  projectMangerId?: string;
  office?: string;
  projectNo: string;
  typeOfJob?: string;
  seniorProjectManagerId?: string;
  seniorProjectMangerId?: string;
  sector?: string;
  region?: string;
  typeOfClient?: string;
  estimatedCost: number;
  feeType?: string;
  startDate?: string;
  endDate?: string;
  currency: string;
  budget?: number;
  priority?: string;
  regionalManagerId?: string;
  regionalManagerID?: string;
  letterOfAcceptance?: boolean;
  opportunityId?: number;
  opportunityTrackingId?: number;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  fundingStream?: string;
}

const projectsData: { [key: string]: RawProject } = {
  "1": {
    id: "1",
    name: "City Water Supply Upgrade",
    details: "City needs water supply upgrade",
    clientName: "Metropolis Municipality",
    projectManagerId: "usr1",
    office: "Mumbai",
    projectNo: "abc-123",
    typeOfJob: "Water Supply",
    seniorProjectManagerId: "usr1",
    sector: "Water",
    region: "West",
    typeOfClient: "Government",
    estimatedCost: 5000000,
    feeType: "Lumpsum",
    startDate: "2023-01-01",
    endDate: "2024-12-31",
    currency: "INR",
    regionalManagerId: "usr6",
    status: 1,
    priority: "Medium",
    budget: 5000000,
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    letterOfAcceptance: true,
    fundingStream: "Test",
    opportunityTrackingId: 12
  },
  "2": {
    id: "2",
    name: "Rural Sanitation Initiative",
    details: "Comprehensive sanitation upgrade for rural areas",
    clientName: "State Rural Development Dept",
    projectManagerId: "usr2",
    office: "Delhi",
    projectNo: "san-456",
    typeOfJob: "Sanitation Infrastructure",
    seniorProjectManagerId: "usr4",
    sector: "Sanitation",
    region: "North",
    typeOfClient: "Government",
    estimatedCost: 2000000,
    feeType: "Itemrate",
    startDate: "2023-03-15",
    endDate: "2025-03-14",
    currency: "INR",
    regionalManagerId: "usr7",
    status: 1,
    priority: "Medium",
    budget: 2000000,
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    letterOfAcceptance: true,
    fundingStream: "Test",
    opportunityTrackingId: 12
  },
  "3": {
    id: "3",
    name: "Industrial Park Drainage System",
    details: "Development of comprehensive drainage system for industrial park",
    clientName: "Industrial Development Corp",
    projectManagerId: "usr3",
    office: "Pune",
    projectNo: "ind-789",
    typeOfJob: "Industrial Infrastructure",
    seniorProjectManagerId: "usr5",
    sector: "Industrial",
    region: "West",
    typeOfClient: "Private",
    estimatedCost: 3500000,
    feeType: "Lumpsum",
    startDate: "2022-07-01",
    endDate: "2023-12-31",
    currency: "INR",
    regionalManagerId: "usr6",
    status: 1,
    priority: "Medium",
    budget: 3500000,
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    letterOfAcceptance: true,
    fundingStream: "Test",
    opportunityTrackingId: 12
  },
  "4": {
    id: "4",
    name: "Smart City Water Management",
    details: "Implementation of smart water management solutions",
    clientName: "Smart City Development Authority",
    projectManagerId: "usr2",
    office: "Bangalore",
    projectNo: "smt-101",
    typeOfJob: "Smart Infrastructure",
    seniorProjectManagerId: "usr4",
    sector: "Smart City",
    region: "South",
    typeOfClient: "Government",
    estimatedCost: 7500000,
    feeType: "Itemrate",
    startDate: "2023-11-01",
    endDate: "2025-10-31",
    currency: "INR",
    regionalManagerId: "usr7",
    status: 1,
    priority: "Medium",
    budget: 7500000,
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    letterOfAcceptance: true,
    fundingStream: "Test",
    opportunityTrackingId: 12
  },
  "5": {
    id: "5",
    name: "Coastal Zone Protection",
    details: "Coastal infrastructure protection and development",
    clientName: "Maritime Development Board",
    projectManagerId: "usr3",
    office: "Chennai",
    projectNo: "cst-202",
    typeOfJob: "Coastal Protection",
    seniorProjectManagerId: "usr5",
    sector: "Coastal",
    region: "South",
    typeOfClient: "Government",
    estimatedCost: 4500000,
    feeType: "Lumpsum",
    startDate: "2023-06-01",
    endDate: "2025-05-31",
    currency: "INR",
    regionalManagerId: "usr6",
    status: 1,
    priority: "Medium",
    budget: 4500000,
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    letterOfAcceptance: true,
    fundingStream: "Test",
    opportunityTrackingId: 12
  }
};

// Transform the raw project data into Project type
export const projects: Project[] = Object.values(projectsData).map(project => ({
  id: project.id,
  name: project.name,
  details: project.details || "",
  clientName: project.clientName,
  projectManagerId: project.projectManagerId || project.projectMangerId || "0",
  office: project.office || "",
  projectNo: project.projectNo,
  typeOfJob: project.typeOfJob || "",
  seniorProjectManagerId: project.seniorProjectManagerId || project.seniorProjectMangerId || "0",
  sector: project.sector || "",
  region: project.region || "",
  typeOfClient: project.typeOfClient || "",
  estimatedCost: project.estimatedCost,
  feeType: project.feeType || "",
  startDate: project.startDate || "",
  endDate: project.endDate || "",
  currency: project.currency,
  budget: project.budget || 0,
  priority: project.priority || "",
  regionalManagerId: project.regionalManagerId || project.regionalManagerID || "0",
  letterOfAcceptance: project.letterOfAcceptance || false,
  opportunityTrackingId: project.opportunityTrackingId || project.opportunityId || 0,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
  status: project.status,
  fundingStream: project.fundingStream || ""
}));

// Utility function to get a single project by ID
export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

// Utility function to filter projects by sector
export const getProjectsBySector = (sector: string): Project[] => {
  return projects.filter(project => project.sector === sector);
};

// Utility function to calculate total project value
export const calculateTotalProjectValue = (): number => {
  return projects.reduce((sum, project) => sum + project.estimatedProjectCost, 0);
};
