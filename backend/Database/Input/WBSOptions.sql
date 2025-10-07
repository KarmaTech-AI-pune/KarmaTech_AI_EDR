-- WBSOptions.sql
-- Script to populate the WBSOptions table with predefined options for WBS levels

-- Check if WBSOptions table has data
IF EXISTS (SELECT TOP 1 1 FROM WBSOptions)
BEGIN
    PRINT 'WBSOptions table already has data, skipping insert';
END
ELSE
BEGIN
    PRINT 'WBSOptions table is empty, inserting data...';

    -- Insert Level 1 options for Manpower Form
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('inception_report', 'Inception Report', 1, NULL, 0),
    ('feasibility_report', 'Feasibility Report', 1, NULL, 0),
    ('draft_detailed_project_report', 'Draft Detailed Project Report', 1, NULL, 0),
    ('detailed_project_report', 'Detailed Project Report', 1, NULL, 0),
    ('tendering_documents', 'Tendering Documents', 1, NULL, 0),
    ('construction_supervision', 'Construction Supervision', 1, NULL, 0);

    -- Insert Level 2 options for Manpower Form with JSON array for ParentValue
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('surveys', 'Surveys', 2, '["inception_report", "feasibility_report", "draft_detailed_project_report", "detailed_project_report", "tendering_documents", "construction_supervision"]', 0),
    ('design', 'Design', 2, '["inception_report", "feasibility_report", "draft_detailed_project_report", "detailed_project_report", "tendering_documents", "construction_supervision"]', 0),
    ('cost_estimation', 'Cost Estimation', 2, '["inception_report", "feasibility_report", "draft_detailed_project_report", "detailed_project_report", "tendering_documents", "construction_supervision"]', 0);

    -- Insert Level 3 options for 'surveys'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('topographical_survey', 'Topographical Survey', 3, 'surveys', 0),
    ('soil_investigation', 'Soil Investigation', 3, 'surveys', 0),
    ('social_impact_assessment', 'Social Impact Assessment', 3, 'surveys', 0),
    ('environmental_assessment', 'Environmental Assessment', 3, 'surveys', 0),
    ('flow_measurement', 'Flow Measurement', 3, 'surveys', 0),
    ('water_quality_measurement', 'Water Quality Measurement', 3, 'surveys', 0);

    -- Insert Level 3 options for 'design'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('process_design', 'Process Design', 3, 'design', 0),
    ('mechanical_design', 'Mechanical Design', 3, 'design', 0),
    ('structural_design', 'Structural Design', 3, 'design', 0),
    ('electrical_design', 'Electrical Design', 3, 'design', 0),
    ('ica_design', 'ICA Design', 3, 'design', 0);

    -- Insert Level 3 options for 'cost_estimation'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('cost_estimation', 'Cost Estimation', 3, 'cost_estimation', 0);

    -- Insert Level 1 options for ODC Form
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('general_odcs', 'General ODCS', 1, NULL, 1),
    ('odcs_feasibility_report', 'ODCs Feasibility Report', 1, NULL, 1),
    ('odcs_draft_dpr', 'ODCS Draft DPR', 1, NULL, 1);

    -- Insert Level 2 options for ODC Form Level 1 'General ODCS'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('travel', 'Travel', 2, 'general_odcs', 1),
    ('subsistence', 'Subsistence', 2, 'general_odcs', 1),
    ('local_conveyance', 'Local conveyance', 2, 'general_odcs', 1),
    ('communications', 'Communications', 2, 'general_odcs', 1),
    ('office', 'office', 2, 'general_odcs', 1),
    ('stationery_and_printing', 'Stationery and printing', 2, 'general_odcs', 1);

    -- Insert Level 3 options for ODC Form Level 2 'Travel'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('travel_1', 'Travel 1', 3, 'travel', 1),
    ('travel_2', 'Travel 2', 3, 'travel', 1),
    ('travel_3', 'Travel 3', 3, 'travel', 1),
    ('travel_4', 'Travel 4', 3, 'travel', 1);

    -- Insert Level 3 options for ODC Form Level 2 'Subsistence'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('s1', 'S1', 3, 'subsistence', 1),
    ('s2', 'S2', 3, 'subsistence', 1),
    ('s3', 'S3', 3, 'subsistence', 1);

    -- Insert Level 3 options for ODC Form Level 2 'Local conveyance'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('car_1', 'Car 1', 3, 'local_conveyance', 1);

    -- Insert Level 3 options for ODC Form Level 2 'Communications'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('cell_phones', 'Cell Phones', 3, 'communications', 1),
    ('internet', 'Internet', 3, 'communications', 1);

    -- Insert Level 3 options for ODC Form Level 2 'office'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('office_1', 'Office 1', 3, 'office', 1);

    -- Insert Level 3 options for ODC Form Level 2 'Stationery and printing'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('printing', 'Printing', 3, 'stationery_and_printing', 1),
    ('photocopy', 'Photocopy', 3, 'stationery_and_printing', 1);

    -- Insert Level 2 options for ODC Form Level 1 'ODCs Feasibility Report'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('topographical_surveys', 'Topographical Surveys', 2, 'odcs_feasibility_report', 1);

    -- Insert Level 3 options for ODC Form Level 2 'Topographical Surveys'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('alignment_survey', 'Alignment Survey', 3, 'topographical_surveys', 1),
    ('plan_table_survey', 'Plan table survey', 3, 'topographical_surveys', 1);

    -- Insert Level 2 options for ODC Form Level 1 'ODCS Draft DPR'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('geotechnical_surveys', 'Geotechnical Surveys', 2, 'odcs_draft_dpr', 1),
    ('water_quality_survey', 'Water Quality Survey', 2, 'odcs_draft_dpr', 1),
    ('flow_measurement', 'Flow Measurement', 2, 'odcs_draft_dpr', 1);

    -- Insert Level 3 options for ODC Form Level 2 'Geotechnical Surveys'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('part_1', 'Part 1', 3, 'geotechnical_surveys', 1),
    ('part_2', 'Part 2', 3, 'geotechnical_surveys', 1),
    ('part_3', 'Part 3', 3, 'geotechnical_surveys', 1),
    ('part_4', 'Part 4', 3, 'geotechnical_surveys', 1);

    -- Insert Level 3 options for ODC Form Level 2 'Water Quality Survey'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('wq1', 'WQ1', 3, 'water_quality_survey', 1);

    -- Insert Level 3 options for ODC Form Level 2 'Flow Measurement'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType)
    VALUES
    ('fm1', 'Fm1', 3, 'flow_measurement', 1);

    PRINT 'WBSOptions data inserted successfully';
    -- Verify the data was inserted
    SELECT * FROM WBSOptions ORDER BY FormType, Level, Value;
END
