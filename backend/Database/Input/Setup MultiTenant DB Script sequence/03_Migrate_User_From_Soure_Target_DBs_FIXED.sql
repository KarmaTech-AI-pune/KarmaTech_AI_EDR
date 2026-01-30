------- Please select traget DATABASE prior run this SQL script---- 


DECLARE @SourceDb SYSNAME = 'KarmaTechAISAAS_EdrAdmin';     --Set SourceDb
DECLARE @TargetDb SYSNAME = 'KarmaTechAISAAS_EdrAdmin-tenant2'; -- SET TargetDb
DECLARE @TenantId INT = 5;-- Comfirm for SourceDb
DECLARE @Email NVARCHAR(256) = 'tenant2_User1@test.com';-- Comfirm for SourceDb (Select * from AspnetUsers )
DECLARE @RoleName NVARCHAR(256) = 'TenantAdmin';
DECLARE @PermissionName NVARCHAR(256) = 'Tenant_ADMIN';

DECLARE @sql NVARCHAR(MAX);

BEGIN TRANSACTION;

BEGIN TRY
    -------------------------------------------------------------------
    -- 1) Force Insert User (only if not exists in target)
    -------------------------------------------------------------------
    SET @sql = N'
    IF NOT EXISTS (SELECT 1 FROM [' + @TargetDb + '].dbo.AspNetUsers WHERE Email = @Email)
    BEGIN
        INSERT INTO [' + @TargetDb + '].dbo.AspNetUsers (
            Id, Name, Avatar, CreatedAt, LastLogin, StandardRate,
            IsConsultant, IsActive, TenantId, UserName, NormalizedUserName,
            Email, NormalizedEmail, EmailConfirmed, PasswordHash,
            SecurityStamp, ConcurrencyStamp, PhoneNumber, PhoneNumberConfirmed,
            TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount
        )
        SELECT 
            NEWID(),
            Name, Avatar, GETUTCDATE(), LastLogin, StandardRate,
            IsConsultant, IsActive, ' + CAST(@TenantId AS NVARCHAR(10)) + ', UserName, NormalizedUserName,
            Email, NormalizedEmail, EmailConfirmed, PasswordHash,
            SecurityStamp, ConcurrencyStamp, PhoneNumber, PhoneNumberConfirmed,
            TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount
        FROM [' + @SourceDb + '].dbo.AspNetUsers
        WHERE Email = @Email;
    END';

    EXEC sp_executesql @sql, N'@Email NVARCHAR(256)', @Email;

    -------------------------------------------------------------------
    -- 2) Force Insert Role (only if not exists in target)
    -------------------------------------------------------------------
    SET @sql = N'
    IF NOT EXISTS (SELECT 1 FROM [' + @TargetDb + '].dbo.AspNetRoles WHERE Name = @RoleName)
    BEGIN
        INSERT INTO [' + @TargetDb + '].dbo.AspNetRoles (
            Id, Name, NormalizedName, ConcurrencyStamp, Description, TenantId
        )
        SELECT 
            NEWID(),
            Name, NormalizedName, ConcurrencyStamp, Description, ' + CAST(@TenantId AS NVARCHAR(10)) + '
        FROM [' + @SourceDb + '].dbo.AspNetRoles
        WHERE Name = @RoleName;
    END';

    EXEC sp_executesql @sql, N'@RoleName NVARCHAR(256)', @RoleName;

    -------------------------------------------------------------------
    -- 3) Link User to Role (only if not already linked)
    -------------------------------------------------------------------
    SET @sql = N'
    IF NOT EXISTS (
        SELECT 1 FROM [' + @TargetDb + '].dbo.AspNetUserRoles ur
        INNER JOIN [' + @TargetDb + '].dbo.AspNetUsers u ON ur.UserId = u.Id
        INNER JOIN [' + @TargetDb + '].dbo.AspNetRoles r ON ur.RoleId = r.Id
        WHERE u.Email = @Email AND r.Name = @RoleName
    )
    BEGIN
        INSERT INTO [' + @TargetDb + '].dbo.AspNetUserRoles (UserId, RoleId)
        SELECT u.Id, r.Id
        FROM [' + @TargetDb + '].dbo.AspNetUsers u
        CROSS JOIN [' + @TargetDb + '].dbo.AspNetRoles r
        WHERE u.Email = @Email AND r.Name = @RoleName;
    END';

    EXEC sp_executesql @sql, N'@Email NVARCHAR(256), @RoleName NVARCHAR(256)', @Email, @RoleName;

    -------------------------------------------------------------------
    -- 4) Force Insert Permission (only if not exists in target)
    -------------------------------------------------------------------
    SET @sql = N'
    IF NOT EXISTS (SELECT 1 FROM [' + @TargetDb + '].dbo.Permissions WHERE Name = @PermissionName)
    BEGIN
        INSERT INTO [' + @TargetDb + '].dbo.Permissions (Name, Description)
        SELECT Name, Description
        FROM [' + @SourceDb + '].dbo.Permissions
        WHERE Name = @PermissionName;
    END';

    EXEC sp_executesql @sql, N'@PermissionName NVARCHAR(256)', @PermissionName;

    -------------------------------------------------------------------
    -- 5) Link Role to Permission (only if not already linked)
    -------------------------------------------------------------------
    SET @sql = N'
    IF NOT EXISTS (
        SELECT 1 
        FROM [' + @TargetDb + '].dbo.RolePermissions rp
        INNER JOIN [' + @TargetDb + '].dbo.AspNetRoles r ON rp.RoleId = r.Id
        INNER JOIN [' + @TargetDb + '].dbo.Permissions p ON rp.PermissionId = p.Id
        WHERE r.Name = @RoleName AND p.Name = @PermissionName
    )
    BEGIN
        INSERT INTO [' + @TargetDb + '].dbo.RolePermissions (
            RoleId, PermissionId, TenantId, CreatedAt, CreatedBy
        )
        SELECT r.Id, p.Id, ' + CAST(@TenantId AS NVARCHAR(10)) + ', GETUTCDATE(), @Email
        FROM [' + @TargetDb + '].dbo.AspNetRoles r
        CROSS JOIN [' + @TargetDb + '].dbo.Permissions p
        WHERE r.Name = @RoleName AND p.Name = @PermissionName;
    END';

    EXEC sp_executesql @sql, 
        N'@RoleName NVARCHAR(256), @PermissionName NVARCHAR(256), @Email NVARCHAR(256)',
        @RoleName, @PermissionName, @Email;

    COMMIT TRANSACTION;
    PRINT '✅ Force insert completed: User, Role, Permission linked (or skipped if already exists).';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '❌ Error occurred: ' + ERROR_MESSAGE();
END CATCH;


--Select * from Tenant

--Select * from TenantDatabases