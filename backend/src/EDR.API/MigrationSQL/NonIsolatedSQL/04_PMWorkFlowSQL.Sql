DECLARE @TenantId INT = 0;

IF NOT EXISTS (
    SELECT 1
    FROM PMWorkflowStatuses
    WHERE TenantId = @TenantId
)
BEGIN
INSERT INTO PMWorkflowStatuses (TenantId, Status)
VALUES
    (@TenantId, 'Initial'),
    (@TenantId, 'Sent for Review'),
    (@TenantId, 'Review Changes'),
    (@TenantId, 'Sent for Approval'),
    (@TenantId, 'Approval Changes'),
    (@TenantId, 'Approved');

PRINT 'PMWorkflowStatuses data inserted successfully for TenantId = ' 
          + CAST(@TenantId AS VARCHAR(10));
END
ELSE
BEGIN
    PRINT 'PMWorkflowStatuses already exists for TenantId = ' 
          + CAST(@TenantId AS VARCHAR(10)) + ', skipping insert';
END
