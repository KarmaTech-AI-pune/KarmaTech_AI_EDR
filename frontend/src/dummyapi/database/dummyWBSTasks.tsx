// WBS Task Type Definition
export interface WBSTask {
    id: number;
    project_id: number; //links to ID in dummyProjects
    parent_id: number | null; //links to a WBSTask parent
    level: number;
    title: string;
    created_at: Date;
    updated_at: Date;
    resource_allocation?: number;
}

// WBS Task Resource Allocation Type Definition
export interface WBSTaskResourceAllocation {
    id: number;
    wbs_task_id: number;
    role_id: number; 
    employee_id: number;
    cost_rate: number;
    odc: number;
    total_hours?: number;
    total_cost?: number;
    created_at: Date;
    updated_at: Date;
    employee?: any;
}

export interface MonthlyHour {
  id: number;
  task_id: number;
  year: number;
  month: number;
  planned_hours: number;
  actual_hours?: number;
  created_at : Date;
  updated_at : Date
}

// Empty WBS Tasks array with the new schema
export const wbsTasks: WBSTask[] = [{
  "id": 1733290000944,
  "project_id" : 3,
  "parent_id" : null,
  "level": 1,
  "title": "inception_report",
  "created_at" : new Date(2024,12,1),
  "updated_at" : new Date(2024,12,1),
  
},
{
  "id": 1733290002101,
  "project_id" : 3,
  "parent_id" : 1733290000944,
  "level": 2,
  "title": "surveys",
  "created_at" : new Date(2024,12,1),
  "updated_at" : new Date(2024,12,1),
  
},
{
  "id": 1733290002938,
  "project_id" : 3,
  "parent_id" : 1733290002101,
  "level": 3,
  "title": "topographical_survey",
  "created_at" : new Date(2024,12,1),
  "updated_at" : new Date(2024,12,1),
  "resource_allocation" : 1
},
{
  "id": 1733290004019,
  "project_id" : 3,
  "parent_id" : 1733290002101,
  "level": 3,
  "title":  "soil_investigation",
  "created_at" : new Date(2024,12,1),
  "updated_at" : new Date(2024,12,1),
  "resource_allocation" : 2
},
{
  "id": 1733290005202,
  "project_id" : 3,
  "parent_id" : 1733290000944,
  "level": 2,
  "title": "design",
  "created_at" : new Date(2024,12,1),
  "updated_at" : new Date(2024,12,1),
},
{
  "id": 1733290040673,
  "project_id" : 3,
  "parent_id" : 1733290005202,
  "level": 3,
  "title":  "process_design",
  "created_at" : new Date(2024,12,1),
  "updated_at" : new Date(2024,12,1),
  "resource_allocation" : 3
},
];

// Empty Resource Allocations array with the new type
export const resourceAllocations: WBSTaskResourceAllocation[] = [
  {
    id: 1,
    wbs_task_id: 1733290002938,
    role_id: 2, 
    employee_id: 2,
    cost_rate: 150,
    "odc" : 0,
    "total_hours": 20,
    "total_cost": 3000,
    "created_at" : new Date(2024,12,1),
    "updated_at" : new Date(2024,12,1),
},
{
  id: 2,
  wbs_task_id: 1733290004019,
  role_id: 7, 
  employee_id: 7,
  cost_rate: 100,
  "odc" : 300,
  "total_hours": 12,
  "total_cost": 2100,
  "created_at" : new Date(2024,12,1),
  "updated_at" : new Date(2024,12,1),
},
{
  id: 3,
  wbs_task_id: 1733290040673,
  role_id: 3, 
  employee_id: 3,
  cost_rate: 100,
  "odc" : 0,
  "total_hours": 22,
  "total_cost": 2200,
  "created_at" : new Date(2024,12,1),
  "updated_at" : new Date(2024,12,1),
},
];

export const monthlyHours: MonthlyHour[] = [
  {
    id: 1,
    task_id: 1733290002938,
    year: 22,
    month: 10,
    planned_hours: 20,
    "created_at" : new Date(2024,12,1),
    "updated_at" : new Date(2024,12,1),
  },
  {
    id: 2,
    task_id: 1733290004019,
    year: 22,
    month: 6,
    planned_hours: 12,
    "created_at" : new Date(2024,12,1),
    "updated_at" : new Date(2024,12,1),
  },
  {
    id: 3,
    task_id: 1733290040673,
    year: 22,
    month: 8,
    planned_hours: 10,
    "created_at" : new Date(2024,12,1),
    "updated_at" : new Date(2024,12,1),
  },
  {
    id: 4,
    task_id: 1733290040673,
    year: 22,
    month: 10,
    planned_hours: 12,
    "created_at" : new Date(2024,12,1),
    "updated_at" : new Date(2024,12,1),
  },
];

export const wbsOptions = {
  level1: [
    { value: 'inception_report', label: 'Inception Report' },
    { value: 'feasibility_report', label: 'Feasibility Report' },
    { value: 'draft_detailed_project_report', label: 'Draft Detailed Project Report' },
    { value: 'detailed_project_report', label: 'Detailed Project Report' },
    { value: 'tendering_documents', label: 'Tendering Documents' },
    { value: 'construction_supervision', label: 'Construction Supervision' }
  ],
  level2: [
    { value: 'surveys', label: 'Surveys' },
    { value: 'design', label: 'Design' },
    { value: 'cost_estimation', label: 'Cost Estimation' }
  ],
  level3: {
    surveys: [
      { value: 'topographical_survey', label: 'Topographical Survey' },
      { value: 'soil_investigation', label: 'Soil Investigation' },
      { value: 'social_impact_assessment', label: 'Social Impact Assessment' },
      { value: 'environmental_assessment', label: 'Environmental Assessment' },
      { value: 'flow_measurement', label: 'Flow Measurement' },
      { value: 'water_quality_measurement', label: 'Water Quality Measurement' }
    ],
    design: [
      { value: 'process_design', label: 'Process Design' },
      { value: 'mechanical_design', label: 'Mechanical Design' },
      { value: 'structural_design', label: 'Structural Design' },
      { value: 'electrical_design', label: 'Electrical Design' },
      { value: 'ica_design', label: 'ICA Design' }
    ],
    cost_estimation : [
      {value: 'cost_estimation', label: 'Cost Estimation'}
    ]
  }
};

export const getWBSOptions = () => {
  return wbsOptions;
};

export const getLevel1Options = () => {
  return wbsOptions.level1;
};

export const getLevel2Options = () => {
  return wbsOptions.level2;
};

export const getLevel3Options = (level2Value: string) => {
  return wbsOptions.level3[level2Value as keyof typeof wbsOptions.level3] || [];
};

