IF NOT EXISTS (SELECT TOP 1 1 FROM PMWorkflowStatuses)
BEGIN
    DECLARE @TenantId INT = 1; -- Default TenantId
	DECLARE @TenantIdParam INT = NULL; -- Optional TenantId parameter

    -- Optional TenantId parameter
	IF @TenantIdParam IS NOT NULL
	BEGIN
		SET @TenantId = @TenantIdParam;
	END

    SET IDENTITY_INSERT PMWorkflowStatuses ON;
    INSERT INTO PMWorkflowStatuses (Id, Status, TenantId)
    VALUES
    (1, 'Initial', @TenantId),
    (2, 'Sent for Review', @TenantId),
    (3, 'Review Changes', @TenantId),
    (4, 'Sent for Approval', @TenantId),
    (5, 'Approval Changes', @TenantId),
    (6, 'Approved', @TenantId);
    SET IDENTITY_INSERT PMWorkflowStatuses OFF;
    PRINT 'PMWorkflowStatuses data inserted successfully';
END
ELSE
BEGIN
    PRINT 'PMWorkflowStatuses data already exists, skipping insert';
END
