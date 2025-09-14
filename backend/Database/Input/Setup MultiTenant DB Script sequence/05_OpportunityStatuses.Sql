DECLARE @TenantId INT = 2;-- Comfirm for SourceDb

IF NOT EXISTS (SELECT TOP 1 1 FROM OpportunityStatuses)
BEGIN
    SET IDENTITY_INSERT OpportunityStatuses ON;
INSERT INTO OpportunityStatuses (Id, TenantId,Status)
VALUES
    (1, @TenantId,'Initial'),
    (2, @TenantId,'Sent for Review'),
    (3, @TenantId,'Review Changes'),
    (4, @TenantId,'Sent for Approval'),
    (5, @TenantId,'Approval Changes'),
    (6, @TenantId,'Approved');
SET IDENTITY_INSERT OpportunityStatuses OFF;
    PRINT 'OpportunityStatuses data inserted successfully';
END
ELSE
BEGIN
    PRINT 'OpportunityStatuses data already exists, skipping insert';
END