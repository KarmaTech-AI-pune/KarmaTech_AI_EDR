DECLARE @TenantId INT = 2;-- Comfirm for SourceDb
        
IF NOT EXISTS (SELECT TOP 1 1 FROM PMWorkflowStatuses)
BEGIN
    SET IDENTITY_INSERT PMWorkflowStatuses ON;
INSERT INTO PMWorkflowStatuses (Id, TenantId,Status)
VALUES
    (1, @TenantId,'Initial'),
    (2, @TenantId,'Sent for Review'),
    (3, @TenantId,'Review Changes'),
    (4, @TenantId,'Sent for Approval'),
    (5, @TenantId,'Approval Changes'),
    (6, @TenantId,'Approved');
SET IDENTITY_INSERT PMWorkflowStatuses OFF;
    PRINT 'PMWorkflowStatuses data inserted successfully';
END
ELSE
BEGIN
    PRINT 'PMWorkflowStatuses data already exists, skipping insert';
END