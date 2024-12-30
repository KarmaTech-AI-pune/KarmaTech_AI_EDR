
CREATE TABLE OpportunityHistories ( 
Id INT PRIMARY KEY IDENTITY,
OpportunityId INT, StatusId INT, 
[Action] NVARCHAR(100), 
Comments NVARCHAR(255), 
ActionDate DATETIME DEFAULT GETDATE(), 
ActionBy NVARCHAR(450), 
FOREIGN KEY (OpportunityId) REFERENCES OpportunityTrackings(Id), 
FOREIGN KEY (StatusId) REFERENCES OpportunityStatuses(Id), 
FOREIGN KEY (ActionBy) REFERENCES AspNetUsers(Id) );