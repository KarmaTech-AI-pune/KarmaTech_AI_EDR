DECLARE @TenantId INT = 4; -- Target tenant
DECLARE @Email NVARCHAR(256) = 'tt@gmail.com';
DECLARE @RoleName NVARCHAR(256) = 'TenantAdmin';
DECLARE @PermissionName NVARCHAR(256) = 'Tenant_ADMIN';

DECLARE @UserId UNIQUEIDENTIFIER;
DECLARE @RoleId UNIQUEIDENTIFIER;
DECLARE @PermissionId int;

BEGIN TRANSACTION;

BEGIN TRY
    -------------------------------------------------------------------
    -- 1) Check if User exists, update TenantId or insert new
    -------------------------------------------------------------------
    SELECT @UserId = Id FROM dbo.AspNetUsers WHERE Email = @Email;

    IF @UserId IS NOT NULL
    BEGIN
        -- Update TenantId for existing user
        UPDATE dbo.AspNetUsers
        SET TenantId = @TenantId,
            IsActive = 1,
            LastLogin = GETUTCDATE()
        WHERE Id = @UserId;

        PRINT '✅ Existing user found. TenantId updated.';
    END
    ELSE
    BEGIN
        -- Insert new user
        INSERT INTO dbo.AspNetUsers (
            Id, Name, Avatar, CreatedAt, LastLogin, StandardRate,
            IsConsultant, IsActive, TenantId, UserName, NormalizedUserName,
            Email, NormalizedEmail, EmailConfirmed, PasswordHash,
            SecurityStamp, ConcurrencyStamp, PhoneNumber, PhoneNumberConfirmed,
            TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount
        )
        SELECT 
            NEWID(),
            Name, Avatar, GETUTCDATE(), LastLogin, StandardRate,
            IsConsultant, 1, @TenantId, UserName, NormalizedUserName,
            Email, NormalizedEmail, EmailConfirmed, PasswordHash,
            SecurityStamp, ConcurrencyStamp, PhoneNumber, PhoneNumberConfirmed,
            TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount
        FROM dbo.AspNetUsers
        WHERE Email = @Email; -- copy template user if needed

        SELECT @UserId = Id FROM dbo.AspNetUsers WHERE Email = @Email;
        PRINT '✅ New user inserted for TenantId ' + CAST(@TenantId AS NVARCHAR);
    END;

    -------------------------------------------------------------------
    -- 2) Insert Role if not exists (tenant-scoped)
    -------------------------------------------------------------------
    SELECT @RoleId = Id FROM dbo.AspNetRoles WHERE Name = @RoleName AND TenantId = @TenantId;

    IF @RoleId IS NULL
    BEGIN
        INSERT INTO dbo.AspNetRoles (Id, Name, NormalizedName, Description, MinRate,IsResourceRole, TenantId)
        VALUES 
        (NEWID(), @RoleName, UPPER(@RoleName), 'Tenant role', 1,0, @TenantId),
        (NEWID(), 'Project Manager', 'PROJECT MANAGER', 'Project Manager role', 120.00, 1, @TenantId),
        (NEWID(), 'Senior Project Manager', 'SENIOR PROJECT MANAGER', 'Senior Project Manager role', 100.00, 1, @TenantId),
        (NEWID(), 'Regional Manager', 'REGIONAL MANAGER', 'Regional Manager is Bid form reviewer role', 0.00, 1, @TenantId),
        (NEWID(), 'Business Development Manager', 'BUSINESS DEVELOPMENT MANAGER', 'Bid manager role', 0.00, 1, @TenantId),
        (NEWID(), 'Subject Matter Expert', 'SUBJECT MATTER EXPERT', 'Subject Matter Expert role', 80.00, 1, @TenantId),
        (NEWID(), 'Regional Director', 'REGIONAL DIRECTOR', 'Approval Manager for BD form', 0.00, 1, @TenantId),
        (NEWID(), 'Reviewer', 'REVIEWER', 'Review the check-review form', 0.00, 0, @TenantId),
        (NEWID(), 'Checker', 'CHECKER', 'Check the check-review form', 0.00, 0, @TenantId);
        

        SELECT @RoleId = Id FROM dbo.AspNetRoles WHERE Name = @RoleName AND TenantId = @TenantId;
    END;

    -------------------------------------------------------------------
    -- 3) Link User to Role if not already linked
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM dbo.AspNetUserRoles
        WHERE UserId = @UserId AND RoleId = @RoleId
    )
    BEGIN
        INSERT INTO dbo.AspNetUserRoles (UserId, RoleId)
        VALUES (@UserId, @RoleId);
    END;

    -------------------------------------------------------------------
    -- 4) Insert Permission if not exists
    -------------------------------------------------------------------
    SELECT @PermissionId = Id FROM dbo.Permissions WHERE Name = @PermissionName;

    IF @PermissionId IS NULL
    BEGIN
        INSERT INTO dbo.Permissions (Name, Description)
        VALUES (@PermissionName, 'Tenant specific permission');

        SELECT @PermissionId = Id FROM dbo.Permissions WHERE Name = @PermissionName;
    END;

    -------------------------------------------------------------------
    -- 5) Link Role to Permission if not already linked
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM dbo.RolePermissions
        WHERE RoleId = @RoleId AND PermissionId = @PermissionId
    )
    BEGIN
        INSERT INTO dbo.RolePermissions (RoleId, PermissionId, TenantId, CreatedAt, CreatedBy)
        VALUES (@RoleId, @PermissionId, @TenantId, GETUTCDATE(), @Email);
    END;

    COMMIT TRANSACTION;
    PRINT '✅ User/Role/Permission setup completed for TenantId=' + CAST(@TenantId AS NVARCHAR);

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '❌ Error: ' + ERROR_MESSAGE();
END CATCH;
