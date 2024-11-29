enum TaskStatus {
    NotStarted = 'NotStarted',
    InProgress = 'InProgress',
    Completed = 'Completed',
    Delayed = 'Delayed',
    OnHold = 'OnHold'
}

// Flat WBS Tasks table with foreign key relationships
export const wbsTasks = [
  // Level 1 Tasks
  {
    id: 1,
    projectId: 1,
    parentTaskId: null,
    taskLevelId: 1,
    taskCode: "1.0",
    name: "Inception Report",
    description: "Initial project inception phase",
    plannedStartDate: new Date("2024-01-01"),
    plannedEndDate: new Date("2024-02-28"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 100000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 2,
    projectId: 1,
    parentTaskId: null,
    taskLevelId: 1,
    taskCode: "2.0",
    name: "Feasibility Report",
    description: "Project feasibility assessment",
    plannedStartDate: new Date("2024-03-01"),
    plannedEndDate: new Date("2024-04-30"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 150000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 3,
    projectId: 1,
    parentTaskId: null,
    taskLevelId: 1,
    taskCode: "3.0",
    name: "Draft Detailed Project Report",
    description: "Initial detailed project planning",
    plannedStartDate: new Date("2024-05-01"),
    plannedEndDate: new Date("2024-06-30"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 200000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 4,
    projectId: 1,
    parentTaskId: null,
    taskLevelId: 1,
    taskCode: "4.0",
    name: "Detailed Project Report",
    description: "Final detailed project documentation",
    plannedStartDate: new Date("2024-07-01"),
    plannedEndDate: new Date("2024-08-31"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 180000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 5,
    projectId: 1,
    parentTaskId: null,
    taskLevelId: 1,
    taskCode: "5.0",
    name: "Tendering Documents",
    description: "Preparation of tender documentation",
    plannedStartDate: new Date("2024-09-01"),
    plannedEndDate: new Date("2024-10-31"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 120000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 6,
    projectId: 1,
    parentTaskId: null,
    taskLevelId: 1,
    taskCode: "6.0",
    name: "Construction Supervision",
    description: "Oversight of construction phase",
    plannedStartDate: new Date("2024-11-01"),
    plannedEndDate: new Date("2025-12-31"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 300000,
    actualCost: 0,
    progress: 0
  },

  // Level 2 Tasks under Inception Report
  {
    id: 7,
    projectId: 1,
    parentTaskId: 1,
    taskLevelId: 2,
    taskCode: "1.1",
    name: "Surveys",
    description: "Initial surveys and assessments",
    plannedStartDate: new Date("2024-01-01"),
    plannedEndDate: new Date("2024-01-31"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 40000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 8,
    projectId: 1,
    parentTaskId: 1,
    taskLevelId: 2,
    taskCode: "1.2",
    name: "Design",
    description: "Initial design work",
    plannedStartDate: new Date("2024-02-01"),
    plannedEndDate: new Date("2024-02-28"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 60000,
    actualCost: 0,
    progress: 0
  },

  // Level 3 Tasks under Surveys
  {
    id: 9,
    projectId: 1,
    parentTaskId: 7,
    taskLevelId: 3,
    taskCode: "1.1.1",
    name: "Topographical Survey",
    description: "Detailed site topography assessment",
    plannedStartDate: new Date("2024-01-01"),
    plannedEndDate: new Date("2024-01-10"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 8000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 10,
    projectId: 1,
    parentTaskId: 7,
    taskLevelId: 3,
    taskCode: "1.1.2",
    name: "Soil Investigation",
    description: "Soil analysis and testing",
    plannedStartDate: new Date("2024-01-11"),
    plannedEndDate: new Date("2024-01-15"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 7000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 11,
    projectId: 1,
    parentTaskId: 7,
    taskLevelId: 3,
    taskCode: "1.1.3",
    name: "Social Impact Assessment",
    description: "Evaluation of social impacts",
    plannedStartDate: new Date("2024-01-16"),
    plannedEndDate: new Date("2024-01-20"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 8000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 12,
    projectId: 1,
    parentTaskId: 7,
    taskLevelId: 3,
    taskCode: "1.1.4",
    name: "Environmental Assessment",
    description: "Environmental impact study",
    plannedStartDate: new Date("2024-01-21"),
    plannedEndDate: new Date("2024-01-25"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 9000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 13,
    projectId: 1,
    parentTaskId: 7,
    taskLevelId: 3,
    taskCode: "1.1.5",
    name: "Flow Measurement",
    description: "Water flow analysis",
    plannedStartDate: new Date("2024-01-26"),
    plannedEndDate: new Date("2024-01-28"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 4000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 14,
    projectId: 1,
    parentTaskId: 7,
    taskLevelId: 3,
    taskCode: "1.1.6",
    name: "Water Quality Measurement",
    description: "Water quality analysis",
    plannedStartDate: new Date("2024-01-29"),
    plannedEndDate: new Date("2024-01-31"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 4000,
    actualCost: 0,
    progress: 0
  },

  // Level 3 Tasks under Design
  {
    id: 15,
    projectId: 1,
    parentTaskId: 8,
    taskLevelId: 3,
    taskCode: "1.2.1",
    name: "Process Design",
    description: "Process flow and system design",
    plannedStartDate: new Date("2024-02-01"),
    plannedEndDate: new Date("2024-02-07"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 12000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 16,
    projectId: 1,
    parentTaskId: 8,
    taskLevelId: 3,
    taskCode: "1.2.2",
    name: "Mechanical Design",
    description: "Mechanical systems design",
    plannedStartDate: new Date("2024-02-08"),
    plannedEndDate: new Date("2024-02-14"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 12000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 17,
    projectId: 1,
    parentTaskId: 8,
    taskLevelId: 3,
    taskCode: "1.2.3",
    name: "Structural Design",
    description: "Structural engineering design",
    plannedStartDate: new Date("2024-02-15"),
    plannedEndDate: new Date("2024-02-21"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 14000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 18,
    projectId: 1,
    parentTaskId: 8,
    taskLevelId: 3,
    taskCode: "1.2.4",
    name: "Electrical Design",
    description: "Electrical systems design",
    plannedStartDate: new Date("2024-02-22"),
    plannedEndDate: new Date("2024-02-25"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 11000,
    actualCost: 0,
    progress: 0
  },
  {
    id: 19,
    projectId: 1,
    parentTaskId: 8,
    taskLevelId: 3,
    taskCode: "1.2.5",
    name: "ICA Design",
    description: "Instrumentation, Control and Automation design",
    plannedStartDate: new Date("2024-02-26"),
    plannedEndDate: new Date("2024-02-28"),
    actualStartDate: null,
    actualEndDate: null,
    budgetedCost: 11000,
    actualCost: 0,
    progress: 0
  }
];

// Task Progress table with foreign key to WBS Tasks
export const taskProgress = [
  {
    id: 1,
    wbsTaskId: 1,
    year: 2024,
    month: 1,
    progress: 0,
    status: TaskStatus.NotStarted,
    comments: "Scheduled to start"
  }
];

// ODC Costs table with foreign key to WBS Tasks
export const odcCosts = [
  {
    id: 1,
    wbsTaskId: 9,
    description: "Survey Equipment Rental",
    amount: 2000,
    date: new Date("2024-01-01"),
    category: "Equipment",
    comments: "Topographical survey equipment"
  },
  {
    id: 2,
    wbsTaskId: 10,
    description: "Soil Testing Lab Fees",
    amount: 1500,
    date: new Date("2024-01-11"),
    category: "Testing",
    comments: "External lab testing fees"
  }
];

// Resource Allocation table with foreign keys to WBS Tasks and Employees
export const resourceAllocations = [
  {
    id: 1,
    wbsTaskId: 9,
    employeeId: 1,
    year: 2024,
    month: 1,
    plannedHours: 40,
    actualHours: 0,
    rate: 175
  },
  {
    id: 2,
    wbsTaskId: 15,
    employeeId: 2,
    year: 2024,
    month: 2,
    plannedHours: 40,
    actualHours: 0,
    rate: 125
  }
];
