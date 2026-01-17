-- Drop existing index if exists
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'RoleNameIndex' AND object_id = OBJECT_ID('dbo.AspNetRoles'))
    DROP INDEX RoleNameIndex ON dbo.AspNetRoles;

-- Create new tenant-scoped unique index if not exist
IF NOT EXISTS(SELECT * FROM sys.indexes WHERE name='IX_RoleName_Tenant'  AND object_id = OBJECT_ID('dbo.AspNetRoles'))
 BEGIN
  CREATE UNIQUE INDEX IX_RoleName_Tenant
  ON dbo.AspNetRoles (NormalizedName, TenantId);
END