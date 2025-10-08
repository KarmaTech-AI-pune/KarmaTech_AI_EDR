-- Drop existing index if exists
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'RoleNameIndex' AND object_id = OBJECT_ID('dbo.AspNetRoles'))
    DROP INDEX RoleNameIndex ON dbo.AspNetRoles;

-- Create new tenant-scoped unique index
CREATE UNIQUE INDEX IX_RoleName_Tenant
ON dbo.AspNetRoles (NormalizedName, TenantId);