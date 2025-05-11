IF NOT EXISTS (SELECT TOP 1 1 FROM PMWorkflowStatuses)
BEGIN
    SET IDENTITY_INSERT PMWorkflowStatuses ON;
    INSERT INTO PMWorkflowStatuses (Id, Status)
    VALUES
    (1, 'Initial'),
    (2, 'Sent for Review'),
    (3, 'Review Changes'),
    (4, 'Sent for Approval'),
    (5, 'Approval Changes'),
    (6, 'Approved');
    SET IDENTITY_INSERT PMWorkflowStatuses OFF;
    PRINT 'PMWorkflowStatuses data inserted successfully';
END
ELSE
BEGIN
    PRINT 'PMWorkflowStatuses data already exists, skipping insert';
END