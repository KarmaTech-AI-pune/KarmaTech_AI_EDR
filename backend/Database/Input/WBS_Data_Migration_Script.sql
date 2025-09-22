DECLARE @CRLF NVARCHAR(2) = CHAR(13) + CHAR(10);
DECLARE @GeneratedSql NVARCHAR(MAX);
DECLARE @OutputSql NVARCHAR(MAX) = ''; -- Accumulate all generated SQL here

SET @OutputSql = @OutputSql + 'EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT ALL";' + @CRLF + @CRLF;

SET @OutputSql = @OutputSql + 'DECLARE @TargetTenantId INT;' + @CRLF;
SET @OutputSql = @OutputSql + 'SET @TargetTenantId = 2;' + @CRLF + @CRLF;

SET @GeneratedSql = '';
IF NOT EXISTS (SELECT TOP 1 1 FROM dbo.PMWorkflowStatuses)
BEGIN
    SET @GeneratedSql = @GeneratedSql + 'SET IDENTITY_INSERT dbo.PMWorkflowStatuses ON;' + @CRLF;
    SET @GeneratedSql = @GeneratedSql + 'INSERT INTO dbo.PMWorkflowStatuses (Id, Status, TenantId) VALUES' + @CRLF;
    SET @GeneratedSql = @GeneratedSql + '(1, ''Initial'', @TargetTenantId),' + @CRLF;
    SET @GeneratedSql = @GeneratedSql + '(2, ''Sent for Review'', @TargetTenantId),' + @CRLF;
    SET @GeneratedSql = @GeneratedSql + '(3, ''Review Changes'', @TargetTenantId),' + @CRLF;
    SET @GeneratedSql = @GeneratedSql + '(4, ''Sent for Approval'', @TargetTenantId),' + @CRLF;
    SET @GeneratedSql = @GeneratedSql + '(5, ''Approval Changes'', @TargetTenantId),' + @CRLF;
    SET @GeneratedSql = @GeneratedSql + '(6, ''Approved'', @TargetTenantId);' + @CRLF;
    SET @GeneratedSql = @GeneratedSql + 'SET IDENTITY_INSERT dbo.PMWorkflowStatuses OFF;' + @CRLF;
END
SET @OutputSql = @OutputSql + @GeneratedSql + @CRLF;

SET @GeneratedSql = '';
SET @GeneratedSql = @GeneratedSql + 'SET IDENTITY_INSERT dbo.Projects ON;' + @CRLF;

SELECT @GeneratedSql = @GeneratedSql + ISNULL(STRING_AGG(
    'INSERT INTO dbo.Projects (Id, TenantId, Name, ProjectNo, ClientName, TypeOfClient, ProjectManagerId, SeniorProjectManagerId, RegionalManagerId, Office, Region, TypeOfJob, Sector, FeeType, EstimatedProjectCost, EstimatedProjectFee, Percentage, Details, Priority, Currency, StartDate, EndDate, CapitalValue, Status, Progress, DurationInMonths, FundingStream, ContractType, OpportunityTrackingId, CreatedAt, CreatedBy, LastModifiedAt, LastModifiedBy, UpdatedAt, UpdatedBy, IsDeleted, LetterOfAcceptance) VALUES (' +
    CAST(p.Id AS NVARCHAR(MAX)) + ', ' +
    '@TargetTenantId' + ', N''' + REPLACE(p.Name, '''', '''''') + ''', ' +
    CAST(p.ProjectNo AS NVARCHAR(MAX)) + ', N''' + REPLACE(p.ClientName, '''', '''''') + ''', N''' + REPLACE(p.TypeOfClient, '''', '''''') + ''', ' +
    'NULL' + ', ' + -- ProjectManagerId set to NULL
    'NULL' + ', ' + -- SeniorProjectManagerId set to NULL
    'NULL' + ', N''' + REPLACE(p.Office, '''', '''''') + ''', N''' + REPLACE(p.Region, '''', '''''') + ''', N''' + REPLACE(p.TypeOfJob, '''', '''''') + ''', N''' + REPLACE(p.Sector, '''', '''''') + ''', N''' + REPLACE(p.FeeType, '''', '''''') + ''', ' +
    CAST(p.EstimatedProjectCost AS NVARCHAR(MAX)) + ', ' +
    CAST(p.EstimatedProjectFee AS NVARCHAR(MAX)) + ', ' +
    ISNULL(CAST(p.Percentage AS NVARCHAR(MAX)), 'NULL') + ', ' +
    ISNULL('N''' + REPLACE(p.Details, '''', '''''') + '''', 'NULL') + ', N''' + REPLACE(p.Priority, '''', '''''') + ''', N''' + REPLACE(p.Currency, '''', '''''') + ''', ' +
    ISNULL('''' + CONVERT(NVARCHAR(MAX), p.StartDate, 121) + '''', 'NULL') + ', ' +
    ISNULL('''' + CONVERT(NVARCHAR(MAX), p.EndDate, 121) + '''', 'NULL') + ', ' +
    ISNULL(CAST(p.CapitalValue AS NVARCHAR(MAX)), 'NULL') + ', ' +
    CAST(p.Status AS NVARCHAR(MAX)) + ', ' +
    CAST(p.Progress AS NVARCHAR(MAX)) + ', ' +
    ISNULL(CAST(p.DurationInMonths AS NVARCHAR(MAX)), 'NULL') + ', ' +
    ISNULL('N''' + REPLACE(p.FundingStream, '''', '''''') + '''', 'NULL') + ', ' +
    ISNULL('N''' + REPLACE(p.ContractType, '''', '''''') + '''', 'NULL') + ', ' +
    ISNULL(CAST(p.OpportunityTrackingId AS NVARCHAR(MAX)), 'NULL') + ', ''' + CONVERT(NVARCHAR(MAX), p.CreatedAt, 121) + ''', N''' + REPLACE(p.CreatedBy, '''', '''''') + ''', ' +
    ISNULL('''' + CONVERT(NVARCHAR(MAX), p.LastModifiedAt, 121) + '''', 'NULL') + ', ' +
    ISNULL('N''' + REPLACE(p.LastModifiedBy, '''', '''''') + '''', 'NULL') + ', ' +
    ISNULL('''' + CONVERT(NVARCHAR(MAX), p.UpdatedAt, 121) + '''', 'NULL') + ', ' +
    ISNULL('N''' + REPLACE(p.UpdatedBy, '''', '''''') + '''', 'NULL') + ', ' +
    CAST(CAST(p.IsDeleted AS INT) AS NVARCHAR(MAX)) + ', ' +
    CAST(CAST(p.LetterOfAcceptance AS INT) AS NVARCHAR(MAX)) + ');' + @CRLF, @CRLF) WITHIN GROUP (ORDER BY p.Id), '')
FROM dbo.Projects p;

SET @GeneratedSql = @GeneratedSql + 'SET IDENTITY_INSERT dbo.Projects OFF;' + @CRLF;
SET @OutputSql = @OutputSql + @GeneratedSql + @CRLF;

SET @GeneratedSql = '';
SET @GeneratedSql = @GeneratedSql + 'SET IDENTITY_INSERT dbo.WBSVersionHistories ON;' + @CRLF;

SELECT @GeneratedSql = @GeneratedSql + ISNULL(STRING_AGG(
    'INSERT INTO dbo.WBSVersionHistories (Id, TenantId, WorkBreakdownStructureId, Version, Comments, CreatedAt, CreatedBy, StatusId, IsActive, IsLatest, ApprovedAt, ApprovedBy) VALUES (' +
    CAST(wv.Id AS NVARCHAR(MAX)) + ', ' +
    '@TargetTenantId' + ', ' +
    CAST(wv.WorkBreakdownStructureId AS NVARCHAR(MAX)) + ', N''' + REPLACE(wv.Version, '''', '''''') + ''', ' +
    ISNULL('N''' + REPLACE(wv.Comments, '''', '''''') + '''', 'NULL') + ', ''' + CONVERT(NVARCHAR(MAX), wv.CreatedAt, 121) + ''', N''' + REPLACE(wv.CreatedBy, '''', '''''') + ''', ' +
    CAST(wv.StatusId AS NVARCHAR(MAX)) + ', ' +
    CAST(CAST(wv.IsActive AS INT) AS NVARCHAR(MAX)) + ', ' +
    CAST(CAST(wv.IsLatest AS INT) AS NVARCHAR(MAX)) + ', ' +
    ISNULL('''' + CONVERT(NVARCHAR(MAX), wv.ApprovedAt, 121) + '''', 'NULL') + ', ' +
    ISNULL('N''' + REPLACE(wv.ApprovedBy, '''', '''''') + '''', 'NULL') + ');' + @CRLF, @CRLF) WITHIN GROUP (ORDER BY wv.Id), '')
FROM dbo.WBSVersionHistories wv;

SET @GeneratedSql = @GeneratedSql + 'SET IDENTITY_INSERT dbo.WBSVersionHistories OFF;' + @CRLF;
SET @OutputSql = @OutputSql + @GeneratedSql + @CRLF;

SET @GeneratedSql = '';
SET @GeneratedSql = @GeneratedSql + 'SET IDENTITY_INSERT dbo.WorkBreakdownStructures ON;' + @CRLF;

SELECT @GeneratedSql = @GeneratedSql + ISNULL(STRING_AGG(
    'INSERT INTO dbo.WorkBreakdownStructures (Id, TenantId, ProjectId, Structure, CurrentVersion, IsActive, CreatedAt, CreatedBy, TaskType, LatestVersionHistoryId, ActiveVersionHistoryId) VALUES (' +
    CAST(wbs.Id AS NVARCHAR(MAX)) + ', ' +
    '@TargetTenantId' + ', ' +
    CAST(wbs.ProjectId AS NVARCHAR(MAX)) + ', ' +
    ISNULL('N''' + REPLACE(wbs.Structure, '''', '''''') + '''', 'NULL') + ', ' +
    ISNULL('N''' + REPLACE(wbs.CurrentVersion, '''', '''''') + '''', 'NULL') + ', ' +
    CAST(CAST(wbs.IsActive AS INT) AS NVARCHAR(MAX)) + ', ''' + CONVERT(NVARCHAR(MAX), wbs.CreatedAt, 121) + ''', ' +
    ISNULL('N''' + REPLACE(wbs.CreatedBy, '''', '''''') + '''', 'NULL') + ', ' +
    CAST(wbs.TaskType AS NVARCHAR(MAX)) + ', ' +
    ISNULL(CAST(wbs.LatestVersionHistoryId AS NVARCHAR(MAX)), 'NULL') + ', ' +
    ISNULL(CAST(wbs.ActiveVersionHistoryId AS NVARCHAR(MAX)), 'NULL') + ');' + @CRLF, @CRLF) WITHIN GROUP (ORDER BY wbs.Id), '')
FROM dbo.WorkBreakdownStructures wbs;

SET @GeneratedSql = @GeneratedSql + 'SET IDENTITY_INSERT dbo.WorkBreakdownStructures OFF;' + @CRLF;
SET @OutputSql = @OutputSql + @GeneratedSql + @CRLF;

SET @GeneratedSql = '';
SET @GeneratedSql = @GeneratedSql + 'SET IDENTITY_INSERT dbo.WBSTasks ON;' + @CRLF;

SELECT @GeneratedSql = @GeneratedSql + ISNULL(STRING_AGG(
    'INSERT INTO dbo.WBSTasks (Id, TenantId, WorkBreakdownStructureId, ParentId, Level, Title, Description, DisplayOrder, IsDeleted, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy, EstimatedBudget, StartDate, EndDate, TaskType) VALUES (' +
    CAST(wbst.Id AS NVARCHAR(MAX)) + ', ' +
    '@TargetTenantId' + ', ' +
    CAST(wbst.WorkBreakdownStructureId AS NVARCHAR(MAX)) + ', ' +
    ISNULL(CAST(wbst.ParentId AS NVARCHAR(MAX)), 'NULL') + ', ' +
    CAST(wbst.Level AS NVARCHAR(MAX)) + ', N''' + REPLACE(wbst.Title, '''', '''''') + ''', ' +
    ISNULL('N''' + REPLACE(wbst.Description, '''', '''''') + '''', 'NULL') + ', ' +
    CAST(wbst.DisplayOrder AS NVARCHAR(MAX)) + ', ' +
    CAST(CAST(wbst.IsDeleted AS INT) AS NVARCHAR(MAX)) + ', ''' + CONVERT(NVARCHAR(MAX), wbst.CreatedAt, 121) + ''', ' +
    ISNULL('N''' + REPLACE(wbst.CreatedBy, '''', '''''') + '''', 'NULL') + ', ' +
    ISNULL('''' + CONVERT(NVARCHAR(MAX), wbst.UpdatedAt, 121) + '''', 'NULL') + ', ' +
    ISNULL('N''' + REPLACE(wbst.UpdatedBy, '''', '''''') + '''', 'NULL') + ', ' +
    CAST(wbst.EstimatedBudget AS NVARCHAR(MAX)) + ', ' +
    ISNULL('''' + CONVERT(NVARCHAR(MAX), wbst.StartDate, 121) + '''', 'NULL') + ', ' +
    ISNULL('''' + CONVERT(NVARCHAR(MAX), wbst.EndDate, 121) + '''', 'NULL') + ', ' +
    CAST(wbst.TaskType AS NVARCHAR(MAX)) + ');' + @CRLF, @CRLF) WITHIN GROUP (ORDER BY wbst.Id), '')
FROM dbo.WBSTasks wbst;

SET @GeneratedSql = @GeneratedSql + 'SET IDENTITY_INSERT dbo.WBSTasks OFF;' + @CRLF;
SET @OutputSql = @OutputSql + @GeneratedSql + @CRLF;

SET @GeneratedSql = '';
SET @GeneratedSql = @GeneratedSql + 'SET IDENTITY_INSERT dbo.WBSTaskPlannedHours ON;' + @CRLF;

SELECT @GeneratedSql = @GeneratedSql + ISNULL(STRING_AGG(
    'INSERT INTO dbo.WBSTaskPlannedHours (Id, TenantId, WBSTaskPlannedHourHeaderId, WBSTaskId, Year, Month, PlannedHours, ActualHours, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy) VALUES (' +
    CAST(wbsh.Id AS NVARCHAR(MAX)) + ', ' +
    '@TargetTenantId' + ', ' +
    CAST(wbsh.WBSTaskPlannedHourHeaderId AS NVARCHAR(MAX)) + ', ' +
    CAST(wbsh.WBSTaskId AS NVARCHAR(MAX)) + ', N''' + REPLACE(wbsh.Year, '''', '''''') + ''', N''' + REPLACE(wbsh.Month, '''', '''''') + ''', ' +
    CAST(wbsh.PlannedHours AS NVARCHAR(MAX)) + ', ' +
    ISNULL(CAST(wbsh.ActualHours AS NVARCHAR(MAX)), 'NULL') + ', ''' + CONVERT(NVARCHAR(MAX), wbsh.CreatedAt, 121) + ''', ' +
    ISNULL('N''' + REPLACE(wbsh.CreatedBy, '''', '''''') + '''', 'NULL') + ', ' +
    ISNULL('''' + CONVERT(NVARCHAR(MAX), wbsh.UpdatedAt, 121) + '''', 'NULL') + ', ' +
    ISNULL('N''' + REPLACE(wbsh.UpdatedBy, '''', '''''') + '''', 'NULL') + ');' + @CRLF, @CRLF) WITHIN GROUP (ORDER BY wbsh.Id), '')
FROM dbo.WBSTaskPlannedHours wbsh;

SET @GeneratedSql = @GeneratedSql + 'SET IDENTITY_INSERT dbo.WBSTaskPlannedHours OFF;' + @CRLF;
SET @OutputSql = @OutputSql + @GeneratedSql + @CRLF;

SET @OutputSql = @OutputSql + 'EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL";' + @CRLF + @CRLF;

SELECT @OutputSql; -- Select the accumulated SQL to avoid truncation
