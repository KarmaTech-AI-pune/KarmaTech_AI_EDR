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
