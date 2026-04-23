-- 1. SET THE NEW TENANT ID HERE
DECLARE @TenantId INT = 0; -- Replace with your actual Tenant ID
      

-- 2. Insert ScoringCriteria
INSERT INTO ScoringCriteria (Label, ByWhom, ByDate, Comments, Score, ShowComments, TenantId)
VALUES
    ('marketingPlan', '', '', '', 0, 0, @TenantId),
    ('clientRelationship', '', '', '', 0, 0, @TenantId),
    ('projectKnowledge', '', '', '', 0, 0, @TenantId),
    ('technicalEligibility', '', '', '', 0, 0, @TenantId),
    ('financialEligibility', '', '', '', 0, 0, @TenantId),
    ('keyStaffAvailability', '', '', '', 0, 0, @TenantId),
    ('projectCompetition', '', '', '', 0, 0, @TenantId),
    ('competitionPosition', '', '', '', 0, 0, @TenantId),
    ('futureWorkPotential', '', '', '', 0, 0, @TenantId),
    ('projectProfitability', '', '', '', 0, 0,@TenantId),
    ('projectSchedule', '', '', '', 0, 0, @TenantId),
    ('bidTimeAndCosts', '', '', '', 0, 0, @TenantId);

-- 3. Insert ScoreRange
INSERT INTO ScoreRange (value, label, range, TenantId)
VALUES
    (10, '10 - Excellent', 'high', @TenantId),
    (9, '9 - Excellent', 'high', @TenantId),
    (8, '8 - Excellent', 'high', @TenantId),
    (7, '7 - Good', 'medium', @TenantId),
    (6, '6 - Good', 'medium', @TenantId),
    (5, '5 - Good', 'medium', @TenantId),
    (4, '4 - Poor', 'low', @TenantId),
    (3, '3 - Poor', 'low', @TenantId),
    (2, '2 - Poor', 'low', @TenantId),
    (1, '1 - Poor', 'low', @TenantId);

-- 4. Insert ScoringDescription and ScoringDescriptionSummarry
-- We use a mapping table to link the Summaries to the correct Description IDs
DECLARE @DescMapping TABLE (OldLabel NVARCHAR(100), NewId INT);

INSERT INTO ScoringDescription (Label, TenantId)
    OUTPUT inserted.Label, inserted.Id INTO @DescMapping
VALUES
    ('marketingPlan', @TenantId),
    ('clientRelationship', @TenantId),
    ('projectKnowledge', @TenantId),
    ('technicalEligibility', @TenantId),
    ('financialEligibility', @TenantId),
    ('keyStaffAvailability', @TenantId),
    ('projectCompetition', @TenantId),
    ('competitionPosition', @TenantId),
    ('futureWorkPotential', @TenantId),
    ('projectProfitability', @TenantId),
    ('projectSchedule', @TenantId),
    ('bidTimeAndCosts', @TenantId);

INSERT INTO ScoringDescriptionSummarry (ScoringDescriptionID, High, Medium, Low, TenantId)
SELECT m.NewId, s.High, s.Medium, s.Low, @TenantId
FROM (
         VALUES
             ('marketingPlan', 'Fits well with marketing strategy', 'Fits somewhat into the marketing strategy', 'Does not fit with marketing strategy'),
             ('clientRelationship', 'Excellent relationships, no past problem projects', 'Fair/good relationships, some project problems', 'Strained relationship(s), problem project(s), selectability questionable'),
             ('projectKnowledge', 'Strategic project, excellent knowledge of project development', 'Known about project, but some knowledge of project development', 'Knew nothing about project prior to receipt of RFQ/RFP'),
             ('technicalEligibility', 'Meets all criteria on its own', 'Need of JV or some support to meet the criteria', 'Does not meet qualification criteria'),
             ('financialEligibility', 'Meets all criteria on its own', 'Need of JV or some support to meet the criteria', 'Does not meet qualification criteria'),
             ('keyStaffAvailability', 'All competent key staff available', 'Most competent key staff available but some outsourcing required', 'Major outsourcing required'),
             ('projectCompetition', 'EDR has inside track, and competition is manageable', 'EDR faces formidable competition, and have limited intelligence on it', 'Project appears to be wired for competition'),
             ('competitionPosition', 'EDR qualifications are technically superior', 'Qualifications are equivalent to competition, or we may have a slight edge', 'EDR qualifications are lower to the competition'),
             ('futureWorkPotential', 'Project will lead to future work', 'Possible future work', 'One-time project, no future work'),
             ('projectProfitability', 'Good profit potential', 'Competitive pricing, Moderate potential profit', 'Risky and may lead to little/no profit'),
             ('projectSchedule', 'More than adequate, project will not adversely impact other projects', 'Adequate, other projects may be adversely impacted', 'Not adequate, other projects will be adversely impacted'),
             ('bidTimeAndCosts', 'Favorable', 'Reasonable', 'Constrained')
     ) AS s(Label, High, Medium, Low)
         JOIN @DescMapping m ON s.Label = m.OldLabel;

-- 5. Insert MeasurementUnits (Corrected table name and audit fields)
INSERT INTO MeasurementUnits (Name, FormType, TenantId, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
VALUES
    ('Nos', 1, @TenantId, GETUTCDATE(), GETUTCDATE(), 'System', 'System'),
    ('LS', 1, @TenantId, GETUTCDATE(), GETUTCDATE(), 'System', 'System'),
    ('Km', 1, @TenantId, GETUTCDATE(), GETUTCDATE(), 'System', 'System'),
    ('Day', 0, @TenantId, GETUTCDATE(), GETUTCDATE(), 'System', 'System'),
    ('Month', 0, @TenantId, GETUTCDATE(), GETUTCDATE(), 'System', 'System'),
    ('Year', 0, @TenantId, GETUTCDATE(), GETUTCDATE(), 'System', 'System');

PRINT 'Seed data inserted successfully for TenantId ' + CAST(@TenantId AS VARCHAR);