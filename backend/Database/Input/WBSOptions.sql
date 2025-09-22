-- WBSOptions.sql
-- Script to populate the WBSOptions table with predefined options for WBS levels

DECLARE @TenantId INT = NULL; -- IMPORTANT: Update this with the desired TenantId (e.g., 1, 2, 3) before running the script. Set to NULL for default.

-- Check if WBSOptions table has data
IF EXISTS (SELECT TOP 1 1 FROM WBSOptions)
BEGIN
    PRINT 'WBSOptions table already has data, skipping insert';
END
ELSE
BEGIN
    PRINT 'WBSOptions table is empty, inserting data...';

    -- Insert Level 1 options for Manpower Form
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('inception_report', 'Inception Report', 1, NULL, 0, @TenantId),
    ('feasibility_report', 'Feasibility Report', 1, NULL, 0, @TenantId),
    ('draft_detailed_project_report', 'Draft Detailed Project Report', 1, NULL, 0, @TenantId),
    ('detailed_project_report', 'Detailed Project Report', 1, NULL, 0, @TenantId),
    ('tendering_documents', 'Tendering Documents', 1, NULL, 0, @TenantId),
    ('construction_supervision', 'Construction Supervision', 1, NULL, 0, @TenantId);

    -- Insert Level 2 options for Manpower Form
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('surveys', 'Surveys', 2, NULL, 0, @TenantId),
    ('design', 'Design', 2, NULL, 0, @TenantId),
    ('cost_estimation', 'Cost Estimation', 2, NULL, 0, @TenantId);

    -- Insert Level 3 options for 'surveys' in Manpower Form
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('topographical_survey', 'Topographical Survey', 3, 'surveys', 0, @TenantId),
    ('soil_investigation', 'Soil Investigation', 3, 'surveys', 0, @TenantId),
    ('social_impact_assessment', 'Social Impact Assessment', 3, 'surveys', 0, @TenantId),
    ('environmental_assessment', 'Environmental Assessment', 3, 'surveys', 0, @TenantId),
    ('flow_measurement', 'Flow Measurement', 3, 'surveys', 0, @TenantId),
    ('water_quality_measurement', 'Water Quality Measurement', 3, 'surveys', 0, @TenantId);

    -- Insert Level 3 options for 'design' in Manpower Form
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('process_design', 'Process Design', 3, 'design', 0, @TenantId),
    ('mechanical_design', 'Mechanical Design', 3, 'design', 0, @TenantId),
    ('structural_design', 'Structural Design', 3, 'design', 0, @TenantId),
    ('electrical_design', 'Electrical Design', 3, 'design', 0, @TenantId),
    ('ica_design', 'ICA Design', 3, 'design', 0, @TenantId);

    -- Insert Level 3 options for 'cost_estimation' in Manpower Form
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('cost_estimation', 'Cost Estimation', 3, 'cost_estimation', 0, @TenantId);

    -- Insert Level 1 options for ODC Form
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('general_odcs', 'General ODCS', 1, NULL, 1, @TenantId),
    ('odcs_feasibility_report', 'ODCs Feasibility Report', 1, NULL, 1, @TenantId),
    ('odcs_draft_dpr', 'ODCS Draft DPR', 1, NULL, 1, @TenantId);

    -- Insert Level 2 options for ODC Form Level 1 'General ODCS'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('travel', 'Travel', 2, 'general_odcs', 1, @TenantId),
    ('subsistence', 'Subsistence', 2, 'general_odcs', 1, @TenantId),
    ('local_conveyance', 'Local conveyance', 2, 'general_odcs', 1, @TenantId),
    ('communications', 'Communications', 2, 'general_odcs', 1, @TenantId),
    ('office', 'office', 2, 'general_odcs', 1, @TenantId),
    ('stationery_and_printing', 'Stationery and printing', 2, 'general_odcs', 1, @TenantId);

    -- Insert Level 3 options for ODC Form Level 2 'Travel'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('travel_1', 'Travel 1', 3, 'travel', 1, @TenantId),
    ('travel_2', 'Travel 2', 3, 'travel', 1, @TenantId),
    ('travel_3', 'Travel 3', 3, 'travel', 1, @TenantId),
    ('travel_4', 'Travel 4', 3, 'travel', 1, @TenantId);

    -- Insert Level 3 options for ODC Form Level 2 'Subsistence'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('s1', 'S1', 3, 'subsistence', 1, @TenantId),
    ('s2', 'S2', 3, 'subsistence', 1, @TenantId),
    ('s3', 'S3', 3, 'subsistence', 1, @TenantId);

    -- Insert Level 3 options for ODC Form Level 2 'Local conveyance'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('car_1', 'Car 1', 3, 'local_conveyance', 1, @TenantId);

    -- Insert Level 3 options for ODC Form Level 2 'Communications'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('cell_phones', 'Cell Phones', 3, 'communications', 1, @TenantId),
    ('internet', 'Internet', 3, 'communications', 1, @TenantId);

    -- Insert Level 3 options for ODC Form Level 2 'office'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('office_1', 'Office 1', 3, 'office', 1, @TenantId);

    -- Insert Level 3 options for ODC Form Level 2 'Stationery and printing'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('printing', 'Printing', 3, 'stationery_and_printing', 1, @TenantId),
    ('photocopy', 'Photocopy', 3, 'stationery_and_printing', 1, @TenantId);

    -- Insert Level 2 options for ODC Form Level 1 'ODCs Feasibility Report'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('topographical_surveys', 'Topographical Surveys', 2, 'odcs_feasibility_report', 1, @TenantId);

    -- Insert Level 3 options for ODC Form Level 2 'Topographical Surveys'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('alignment_survey', 'Alignment Survey', 3, 'topographical_surveys', 1, @TenantId),
    ('plan_table_survey', 'Plan table survey', 3, 'topographical_surveys', 1, @TenantId);

    -- Insert Level 2 options for ODC Form Level 1 'ODCS Draft DPR'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('geotechnical_surveys', 'Geotechnical Surveys', 2, 'odcs_draft_dpr', 1, @TenantId),
    ('water_quality_survey', 'Water Quality Survey', 2, 'odcs_draft_dpr', 1, @TenantId),
    ('flow_measurement', 'Flow Measurement', 2, 'odcs_draft_dpr', 1, @TenantId);

    -- Insert Level 3 options for ODC Form Level 2 'Geotechnical Surveys'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('part_1', 'Part 1', 3, 'geotechnical_surveys', 1, @TenantId),
    ('part_2', 'Part 2', 3, 'geotechnical_surveys', 1, @TenantId),
    ('part_3', 'Part 3', 3, 'geotechnical_surveys', 1, @TenantId),
    ('part_4', 'Part 4', 3, 'geotechnical_surveys', 1, @TenantId);

    -- Insert Level 3 options for ODC Form Level 2 'Water Quality Survey'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('wq1', 'WQ1', 3, 'water_quality_survey', 1, @TenantId);

    -- Insert Level 3 options for ODC Form Level 2 'Flow Measurement'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue, FormType, TenantId)
    VALUES
    ('fm1', 'Fm1', 3, 'flow_measurement', 1, @TenantId);

    PRINT 'WBSOptions data inserted successfully';
    -- Verify the data was inserted
    SELECT * FROM WBSOptions ORDER BY FormType, Level, Value;
END
