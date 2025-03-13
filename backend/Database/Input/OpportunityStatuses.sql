SET IDENTITY_INSERT OpportunityStatuses ON;
INSERT INTO OpportunityStatuses (Id, Status)
VALUES
(1, 'Initial'),
(2, 'Sent for Review'),
(3, 'Review Changes'),
(4, 'Sent for Approval'),
(5, 'Approval Changes'),
(6, 'Approved');
SET IDENTITY_INSERT OpportunityStatuses OFF;

SET IDENTITY_INSERT ScoringCriteria ON;
INSERT INTO [dbo].[ScoringCriteria]
           ([Id],[Label]
           ,[ByWhom]
           ,[ByDate]
           ,[Comments]
           ,[Score]
           ,[ShowComments])
     VALUES
           (1,'marketingPlan', '', '', '', 0, 0),
           (2,'clientRelationship', '', '', '', 0, 0),
           (3,'projectKnowledge', '', '', '', 0, 0),
           (4,'technicalEligibility', '', '', '', 0, 0),
           (5,'financialEligibility', '', '', '', 0, 0),
           (6,'keyStaffAvailability', '', '', '', 0, 0),
           (7,'projectCompetition', '', '', '', 0, 0),
           (8,'competitionPosition', '', '', '', 0, 0),
           (9,'futureWorkPotential', '', '', '', 0, 0),
           (10,'projectProfitability', '', '', '', 0, 0),
           (11,'projectSchedule', '', '', '', 0, 0),
           (12,'bidTimeAndCosts', '', '', '', 0, 0)
SET IDENTITY_INSERT ScoringCriteria OFF;

SET IDENTITY_INSERT ScoreRange ON;
INSERT INTO ScoreRange([Id],[Value],[Label],[Range])
     VALUES(1,10, '10 - Excellent', 'high'),
           (2,9, '9 - Excellent', 'high'),
           (3,8, '8 - Excellent', 'high'),
           (4, 7, '7 - od', 'medium'),
           (5, 6, '6 - od', 'medium'),
           (6, 5, '5 - od', 'medium'),
           (7, 4, '4 - Poor', 'low'),
           (8, 3, '3 - Poor', 'low'),
           (9, 2, '2 - Poor', 'low'),
           (10,1, '1 - Poor', 'low')
SET IDENTITY_INSERT ScoreRange OFF;

SET IDENTITY_INSERT ScoringDescription ON;

INSERT INTO ScoringDescription
           (Id,label)
     VALUES
           (1, 'marketingPlan'),
(2, 'clientRelationship'),
(3, 'projectKnowledge'),
(4, 'technicalEligibility'),
(5, 'financialEligibility'),
(6, 'keyStaffAvailability'),
(7, 'projectCompetition'),
(8, 'competitionPosition'),
(9, 'futureWorkPotential'),
(10, 'projectProfitability'),
(11, 'projectSchedule'),
(12, 'bidTimeAndCosts');
SET IDENTITY_INSERT ScoringDescription OFF;


SET IDENTITY_INSERT ScoringDescriptionSummarry ON;
INSERT INTO ScoringDescriptionSummarry
           ([Id],ScoringDescriptionID
           ,High
           ,Medium
           ,Low)
     VALUES
           (1,1, 'Fits well with marketing strategy', 'Fits somewhat into the marketing strategy', 'Does not fit with marketing strategy'),
           (2,2, 'Excellent relationships, no past problem projects', 'Fair/good relationships, some project problems', 'Strained relationship(s), problem project(s), selectability questionable'),
           (3,3, 'Strategic project, excellent knowledge of project development', 'Known about project, but some knowledge of project development', 'Knew nothing about project prior to receipt of RFQ/RFP'),
           (4,4, 'Meets all criteria on its own', 'Need of JV or some support to meet the criteria', 'Does not meet qualification criteria'),
           (5,5, 'Meets all criteria on its own', 'Need of JV or some support to meet the criteria', 'Does not meet qualification criteria'),
           (6,6, 'All competent key staff available', 'Most competent key staff available but some outsourcing required', 'Major outsourcing required'),
           (7,7, 'NJS has inside track, and competition is manageable', 'NJS faces formidable competition, and have limited intelligence on it', 'Project appears to be wired for competition'),
           (8,8, 'NJS qualifications are technically superior', 'Qualifications are equivalent to competition, or we may have a slight edge', 'NJS qualifications are lower to the competition'),
           (9,9, 'Project will lead to future work', 'Possible future work', 'One-time project, no future work'),
           (10,10, 'Good profit potential', 'Competitive pricing, Moderate potential profit', 'Risky and may lead to little/no profit'),
           (11,11, 'More than adequate, project will not adversely impact other projects', 'Adequate, other projects may be adversely impacted', 'Not adequate, other projects will be adversely impacted'),
           (12,12, 'Favorable', 'Reasonable', 'Constrained');

SET IDENTITY_INSERT ScoringDescriptionSummarry OFF;





















