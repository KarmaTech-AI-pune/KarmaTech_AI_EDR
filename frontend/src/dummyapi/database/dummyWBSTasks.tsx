enum TaskStatus {
    NotStarted = 'NotStarted',
    InProgress = 'InProgress',
    Completed = 'Completed',
    Delayed = 'Delayed',
    OnHold = 'OnHold'
  }
// Flat WBS Tasks table with foreign key relationships
export const wbsTasks = [
  {
    id: 1,
    projectId: 1,
    parentTaskId: null,
    taskLevelId: 1,
    taskCode: "1.0",
    name: "Project Planning",
    description: "Initial project planning phase",
    plannedStartDate: new Date("2024-01-01"),
    plannedEndDate: new Date("2024-01-15"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 50000,
    actualCost: 48000,
    progress: 100
  },
  {
    id: 2,
    projectId: 1,
    parentTaskId: 1,
    taskLevelId: 2,
    taskCode: "1.1",
    name: "Requirements Gathering",
    description: "Collect and document project requirements",
    plannedStartDate: new Date("2024-01-01"),
    plannedEndDate: new Date("2024-01-07"),
    actualStartDate: new Date("2024-01-01"),
    actualEndDate: new Date("2024-01-06"),
    budgetedCost: 20000,
    actualCost: 19000,
    progress: 100
  },
  {
    id: 3,
    projectId: 1,
    parentTaskId: 1,
    taskLevelId: 2,
    taskCode: "1.2",
    name: "Resource Planning",
    description: "Plan resource allocation",
    plannedStartDate: new Date("2024-01-08"),
    plannedEndDate: new Date("2024-01-15"),
    actualStartDate: new Date("2024-01-08"),
    actualEndDate: new Date("2024-01-15"),
    budgetedCost: 30000,
    actualCost: 29000,
    progress: 100
  },
  {
    id: 4,
    projectId: 1,
    parentTaskId: null,
    taskLevelId: 1,
    taskCode: "2.0",
    name: "Development",
    description: "Main development phase",
    plannedStartDate: new Date("2024-01-16"),
    plannedEndDate: new Date("2024-03-15"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 200000,
    actualCost: 150000,
    progress: 60
  },
  {
    id: 5,
    projectId: 1,
    parentTaskId: 4,
    taskLevelId: 2,
    taskCode: "2.1",
    name: "Frontend Development",
    description: "Develop user interface",
    plannedStartDate: new Date("2024-01-16"),
    plannedEndDate: new Date("2024-02-15"),
    actualStartDate: new Date("2024-01-16"),
    actualEndDate: null,
    budgetedCost: 100000,
    actualCost: 80000,
    progress: 70
  },
  {
    id: 6,
    projectId: 1,
    parentTaskId: 4,
    taskLevelId: 2,
    taskCode: "2.2",
    name: "Backend Development",
    description: "Develop server-side functionality",
    plannedStartDate: new Date("2024-02-16"),
    plannedEndDate: new Date("2024-03-15"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 100000,
    actualCost: 70000,
    progress: 50
  }
];

// Task Progress table with foreign key to WBS Tasks
export const taskProgress = [
  {
    id: 1,
    wbsTaskId: 1,
    year: 2024,
    month: 1,
    progress: 100,
    status: TaskStatus.Completed,
    comments: "Completed on schedule"
  },
  {
    id: 2,
    wbsTaskId: 2,
    year: 2024,
    month: 1,
    progress: 100,
    status: TaskStatus.Completed,
    comments: "Completed ahead of schedule"
  },
  {
    id: 3,
    wbsTaskId: 5,
    year: 2024,
    month: 1,
    progress: 70,
    status: TaskStatus.InProgress,
    comments: "On track"
  },
  {
    id: 4,
    wbsTaskId: 6,
    year: 2024,
    month: 1,
    progress: 50,
    status: TaskStatus.InProgress,
    comments: "Started implementation"
  }
];

// ODC Costs table with foreign key to WBS Tasks
export const odcCosts = [
  {
    id: 1,
    wbsTaskId: 1,
    description: "Software Licenses",
    amount: 5000,
    date: new Date("2024-01-03"),
    category: "Licenses",
    comments: "Annual software licenses"
  },
  {
    id: 2,
    wbsTaskId: 5,
    description: "Cloud Infrastructure",
    amount: 3000,
    date: new Date("2024-01-20"),
    category: "Infrastructure",
    comments: "Monthly cloud services"
  }
];

// Resource Allocation table with foreign keys to WBS Tasks and Employees
export const resourceAllocations = [
  {
    id: 1,
    wbsTaskId: 1,
    employeeId: 1,
    year: 2024,
    month: 1,
    plannedHours: 80,
    actualHours: 75,
    rate: 100
  },
  {
    id: 2,
    wbsTaskId: 5,
    employeeId: 2,
    year: 2024,
    month: 1,
    plannedHours: 160,
    actualHours: 150,
    rate: 85
  },
  {
    id: 3,
    wbsTaskId: 6,
    employeeId: 3,
    year: 2024,
    month: 1,
    plannedHours: 160,
    actualHours: 140,
    rate: 90
  }
];
