DO $$
DECLARE
v_tenant_id INT := {{TENANT_ID}};
BEGIN

-- -------------------------------------------------------
-- 2. ScoringCriteria
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM "ScoringCriteria" WHERE "TenantId" = v_tenant_id LIMIT 1) THEN

    INSERT INTO "ScoringCriteria" ("Label", "ByWhom", "ByDate", "Comments", "Score", "ShowComments", "TenantId")
    VALUES
        ('marketingPlan',        '', '', '', 0, FALSE, v_tenant_id),
        ('clientRelationship',   '', '', '', 0, FALSE, v_tenant_id),
        ('projectKnowledge',     '', '', '', 0, FALSE, v_tenant_id),
        ('technicalEligibility', '', '', '', 0, FALSE, v_tenant_id),
        ('financialEligibility', '', '', '', 0, FALSE, v_tenant_id),
        ('keyStaffAvailability', '', '', '', 0, FALSE, v_tenant_id),
        ('projectCompetition',   '', '', '', 0, FALSE, v_tenant_id),
        ('competitionPosition',  '', '', '', 0, FALSE, v_tenant_id),
        ('futureWorkPotential',  '', '', '', 0, FALSE, v_tenant_id),
        ('projectProfitability', '', '', '', 0, FALSE, v_tenant_id),
        ('projectSchedule',      '', '', '', 0, FALSE, v_tenant_id),
        ('bidTimeAndCosts',      '', '', '', 0, FALSE, v_tenant_id);

    RAISE NOTICE 'ScoringCriteria data inserted successfully';
ELSE
    RAISE NOTICE 'ScoringCriteria data already exists, skipping insert';
END IF;


-- -------------------------------------------------------
-- 3. ScoreRange
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM "ScoreRange" WHERE "TenantId" = v_tenant_id LIMIT 1) THEN

    INSERT INTO "ScoreRange" ("value", "label", "range", "TenantId")
    VALUES
        (10, '10 - Excellent', 'high',   v_tenant_id),
        (9,  '9 - Excellent',  'high',   v_tenant_id),
        (8,  '8 - Excellent',  'high',   v_tenant_id),
        (7,  '7 - Good',       'medium', v_tenant_id),
        (6,  '6 - Good',       'medium', v_tenant_id),
        (5,  '5 - Good',       'medium', v_tenant_id),
        (4,  '4 - Poor',       'low',    v_tenant_id),
        (3,  '3 - Poor',       'low',    v_tenant_id),
        (2,  '2 - Poor',       'low',    v_tenant_id),
        (1,  '1 - Poor',       'low',    v_tenant_id);

    RAISE NOTICE 'ScoreRange data inserted successfully';
ELSE
    RAISE NOTICE 'ScoreRange data already exists, skipping insert';
END IF;


-- -------------------------------------------------------
-- 4. ScoringDescription + ScoringDescriptionSummarry
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM "ScoringDescription" WHERE "TenantId" = v_tenant_id LIMIT 1) THEN

    CREATE TEMP TABLE desc_mapping (old_label VARCHAR(100), new_id INT) ON COMMIT DROP;

WITH inserted AS (
INSERT INTO "ScoringDescription" ("Label", "TenantId")
VALUES
    ('marketingPlan',        v_tenant_id),
    ('clientRelationship',   v_tenant_id),
    ('projectKnowledge',     v_tenant_id),
    ('technicalEligibility', v_tenant_id),
    ('financialEligibility', v_tenant_id),
    ('keyStaffAvailability', v_tenant_id),
    ('projectCompetition',   v_tenant_id),
    ('competitionPosition',  v_tenant_id),
    ('futureWorkPotential',  v_tenant_id),
    ('projectProfitability', v_tenant_id),
    ('projectSchedule',      v_tenant_id),
    ('bidTimeAndCosts',      v_tenant_id)
    RETURNING "Label", "Id"
    )
INSERT INTO desc_mapping (old_label, new_id)
SELECT "Label", "Id" FROM inserted;

INSERT INTO "ScoringDescriptionSummarry" ("ScoringDescriptionID", "High", "Medium", "Low", "TenantId")
SELECT m.new_id, s.high, s.medium, s.low, v_tenant_id
FROM (
         VALUES
             ('marketingPlan',        'Fits well with marketing strategy',                                     'Fits somewhat into the marketing strategy',                              'Does not fit with marketing strategy'),
             ('clientRelationship',   'Excellent relationships, no past problem projects',                     'Fair/good relationships, some project problems',                         'Strained relationship(s), problem project(s), selectability questionable'),
             ('projectKnowledge',     'Strategic project, excellent knowledge of project development',         'Known about project, but some knowledge of project development',          'Knew nothing about project prior to receipt of RFQ/RFP'),
             ('technicalEligibility', 'Meets all criteria on its own',                                        'Need of JV or some support to meet the criteria',                        'Does not meet qualification criteria'),
             ('financialEligibility', 'Meets all criteria on its own',                                        'Need of JV or some support to meet the criteria',                        'Does not meet qualification criteria'),
             ('keyStaffAvailability', 'All competent key staff available',                                    'Most competent key staff available but some outsourcing required',        'Major outsourcing required'),
             ('projectCompetition',   'EDR has inside track, and competition is manageable',                  'EDR faces formidable competition, and have limited intelligence on it',  'Project appears to be wired for competition'),
             ('competitionPosition',  'EDR qualifications are technically superior',                          'Qualifications are equivalent to competition, or we may have a slight edge', 'EDR qualifications are lower to the competition'),
             ('futureWorkPotential',  'Project will lead to future work',                                     'Possible future work',                                                   'One-time project, no future work'),
             ('projectProfitability', 'Good profit potential',                                                'Competitive pricing, Moderate potential profit',                         'Risky and may lead to little/no profit'),
             ('projectSchedule',      'More than adequate, project will not adversely impact other projects', 'Adequate, other projects may be adversely impacted',                     'Not adequate, other projects will be adversely impacted'),
             ('bidTimeAndCosts',      'Favorable',                                                            'Reasonable',                                                             'Constrained')
     ) AS s(label, high, medium, low)
         JOIN desc_mapping m ON s.label = m.old_label;

RAISE NOTICE 'ScoringDescription + ScoringDescriptionSummarry data inserted successfully';
ELSE
    RAISE NOTICE 'ScoringDescription data already exists, skipping insert';
END IF;


-- -------------------------------------------------------
-- 5. MeasurementUnits
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM "MeasurementUnits" WHERE "TenantId" = v_tenant_id LIMIT 1) THEN

    INSERT INTO "MeasurementUnits" ("Name", "FormType", "TenantId", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy")
    VALUES
        ('Nos',   1, v_tenant_id, NOW(), NOW(), 'System', 'System'),
        ('LS',    1, v_tenant_id, NOW(), NOW(), 'System', 'System'),
        ('Km',    1, v_tenant_id, NOW(), NOW(), 'System', 'System'),
        ('Day',   0, v_tenant_id, NOW(), NOW(), 'System', 'System'),
        ('Month', 0, v_tenant_id, NOW(), NOW(), 'System', 'System'),
        ('Year',  0, v_tenant_id, NOW(), NOW(), 'System', 'System');

    RAISE NOTICE 'MeasurementUnits data inserted successfully';
ELSE
    RAISE NOTICE 'MeasurementUnits data already exists, skipping insert';
END IF;

RAISE NOTICE 'Seed complete for TenantId %', v_tenant_id;

END $$;