// WBS Task Type Definition
export interface WBSTask {
    id: number;
    project_id: number; //links to ID in dummyProjects
    parent_id: number | null; //links to a WBSTask parent
    level: number;
    level1_type?: string;
    level2_type?: string;
    level3_type?: string;
    title: string;
    odc: number;
    created_at: Date;
    updated_at: Date;
    resource_allocations?: WBSTaskResourceAllocation[];
}

// WBS Task Resource Allocation Type Definition
export interface WBSTaskResourceAllocation {
    id: number;
    wbs_task_id: number;
    role_id: number; 
    employee_id: number;
    cost_rate: number;
    total_hours: number;
    total_cost: number;
    created_at: Date;
    updated_at: Date;
    monthly_hours?: MonthlyHour[];
    employee?: any;
}

export interface MonthlyHour {
  id: number;
  resource_allocation_id: number;
  year: number;
  month: number;
  planned_hours: number;
  actual_hours?: number;
  created_at : Date;
  updated_at : Date
}

// Empty WBS Tasks array with the new schema
export const wbsTasks: WBSTask[] = [];

// Empty Resource Allocations array with the new type
export const resourceAllocations: WBSTaskResourceAllocation[] = [];

export const monthlyHours: MonthlyHour[] = [];

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
