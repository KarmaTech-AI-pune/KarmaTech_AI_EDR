DECLARE @TenantId INT=0;

IF NOT EXISTS (
   SELECT 1 FROM 
   OpportunityStatuses 
   WHERE TenantId= @TenantId
   )
BEGIN    
INSERT INTO OpportunityStatuses (TenantId,Status)
VALUES
    ( @TenantId,'Initial'),
    ( @TenantId,'Sent for Review'),
    ( @TenantId,'Review Changes'),
    ( @TenantId,'Sent for Approval'),
    ( @TenantId,'Approval Changes'),
    ( @TenantId,'Approved');
    PRINT 'OpportunityStatuses data inserted successfully';
END
ELSE
BEGIN
    PRINT 'OpportunityStatuses data already exists, skipping insert';
END