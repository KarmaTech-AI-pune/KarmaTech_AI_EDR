SET IDENTITY_INSERT OpportunityStatuses ON;
INSERT INTO OpportunityStatuses (Id, Status)
VALUES
(1, 'Initial'),
(2, 'Sent for Review'),
(3, 'Review Changes'),
(4, 'Sent for Approval'),
(5, 'Approval Changes'),
(6, 'Approved');