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

    -- Insert Level 1 options
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue)
    VALUES
    ('inception_report', 'Inception Report', 1, NULL),
    ('feasibility_report', 'Feasibility Report', 1, NULL),
    ('draft_detailed_project_report', 'Draft Detailed Project Report', 1, NULL),
    ('detailed_project_report', 'Detailed Project Report', 1, NULL),
    ('tendering_documents', 'Tendering Documents', 1, NULL),
    ('construction_supervision', 'Construction Supervision', 1, NULL);

    -- Insert Level 2 options
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue)
    VALUES
    ('surveys', 'Surveys', 2, NULL),
    ('design', 'Design', 2, NULL),
    ('cost_estimation', 'Cost Estimation', 2, NULL);

    -- Insert Level 3 options for 'surveys'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue)
    VALUES
    ('topographical_survey', 'Topographical Survey', 3, 'surveys'),
    ('soil_investigation', 'Soil Investigation', 3, 'surveys'),
    ('social_impact_assessment', 'Social Impact Assessment', 3, 'surveys'),
    ('environmental_assessment', 'Environmental Assessment', 3, 'surveys'),
    ('flow_measurement', 'Flow Measurement', 3, 'surveys'),
    ('water_quality_measurement', 'Water Quality Measurement', 3, 'surveys');

    -- Insert Level 3 options for 'design'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue)
    VALUES
    ('process_design', 'Process Design', 3, 'design'),
    ('mechanical_design', 'Mechanical Design', 3, 'design'),
    ('structural_design', 'Structural Design', 3, 'design'),
    ('electrical_design', 'Electrical Design', 3, 'design'),
    ('ica_design', 'ICA Design', 3, 'design');

    -- Insert Level 3 options for 'cost_estimation'
    INSERT INTO WBSOptions (Value, Label, Level, ParentValue)
    VALUES
    ('cost_estimation', 'Cost Estimation', 3, 'cost_estimation');

    PRINT 'WBSOptions data inserted successfully';
    -- Verify the data was inserted
    SELECT * FROM WBSOptions ORDER BY Level, Value;
END
