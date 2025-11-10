------- Please select traget DATABASE prior run this SQL script---- 
-------Explicitly we removed the ADMIN ROLE and it's permission for Tenant 
--*****************
--   For @TenantId Please make sure Tenant Id in main DATABASE 
--
Use [KarmaTechAISAAS_EdrAdmin-tenant2] --Set Target Database(Tenant DB)
DECLARE @TenantId INT = 5; -- Change this for different tenants

-- ==========================================
-- Insert Roles
-- ==========================================
INSERT INTO AspNetRoles (Id, Name, NormalizedName, Description, MinRate, IsResourceRole, TenantId) 
VALUES
(NEWID(), 'Project Manager', 'PROJECT MANAGER', 'Project Manager role', 120.00, 1, @TenantId),
(NEWID(), 'Senior Project Manager', 'SENIOR PROJECT MANAGER', 'Senior Project Manager role', 100.00, 1, @TenantId),
(NEWID(), 'Regional Manager', 'REGIONAL MANAGER', 'Regional Manager is Bid form reviewer role', 0.00, 1, @TenantId),
(NEWID(), 'Business Development Manager', 'BUSINESS DEVELOPMENT MANAGER', 'Bid manager role', 0.00, 1, @TenantId),
(NEWID(), 'Subject Matter Expert', 'SUBJECT MATTER EXPERT', 'Subject Matter Expert role', 80.00, 1, @TenantId),
(NEWID(), 'Regional Director', 'REGIONAL DIRECTOR', 'Approval Manager for BD form', 0.00, 1, @TenantId),
(NEWID(), 'Reviewer', 'REVIEWER', 'Review the check-review form', 0.00, 0, @TenantId),
(NEWID(), 'Checker', 'CHECKER', 'Check the check-review form', 0.00, 0, @TenantId),
(NEWID(), 'TenantAdmin', 'TENANTADMIN', 'Tenant Administrator role', 0.00, 0, @TenantId);

-- ==========================================
-- Insert Role Permissions (with TenantId)
-- ==========================================

-- Project Manager
INSERT INTO RolePermissions (RoleId, PermissionId, TenantId, CreatedAt, CreatedBy)
SELECT r.Id, p.Id, @TenantId, GETUTCDATE(), 'System'
FROM AspNetRoles r
JOIN Permissions p ON p.Name IN ('VIEW_PROJECT','CREATE_PROJECT','EDIT_PROJECT','DELETE_PROJECT','SUBMIT_PROJECT_FOR_REVIEW')
WHERE r.Name = 'Project Manager' AND r.TenantId = @TenantId;

-- Senior Project Manager
INSERT INTO RolePermissions (RoleId, PermissionId, TenantId, CreatedAt, CreatedBy)
SELECT r.Id, p.Id, @TenantId, GETUTCDATE(), 'System'
FROM AspNetRoles r
JOIN Permissions p ON p.Name IN ('VIEW_PROJECT','CREATE_PROJECT','EDIT_PROJECT','DELETE_PROJECT','REVIEW_PROJECT','SUBMIT_FOR_APPROVAL')
WHERE r.Name = 'Senior Project Manager' AND r.TenantId = @TenantId;

-- Regional Manager
INSERT INTO RolePermissions (RoleId, PermissionId, TenantId, CreatedAt, CreatedBy)
SELECT r.Id, p.Id, @TenantId, GETUTCDATE(), 'System'
FROM AspNetRoles r
JOIN Permissions p ON p.Name IN (
    'VIEW_PROJECT','CREATE_PROJECT','EDIT_PROJECT','DELETE_PROJECT','APPROVE_PROJECT',
    'CREATE_BUSINESS_DEVELOPMENT','EDIT_BUSINESS_DEVELOPMENT','DELETE_BUSINESS_DEVELOPMENT',
    'VIEW_BUSINESS_DEVELOPMENT','REVIEW_BUSINESS_DEVELOPMENT','SUBMIT_FOR_APPROVAL')
WHERE r.Name = 'Regional Manager' AND r.TenantId = @TenantId;

-- Business Development Manager
INSERT INTO RolePermissions (RoleId, PermissionId, TenantId, CreatedAt, CreatedBy)
SELECT r.Id, p.Id, @TenantId, GETUTCDATE(), 'System'
FROM AspNetRoles r
JOIN Permissions p ON p.Name IN (
    'CREATE_BUSINESS_DEVELOPMENT','EDIT_BUSINESS_DEVELOPMENT','DELETE_BUSINESS_DEVELOPMENT','VIEW_BUSINESS_DEVELOPMENT')
WHERE r.Name = 'Business Development Manager' AND r.TenantId = @TenantId;

-- Subject Matter Expert
INSERT INTO RolePermissions (RoleId, PermissionId, TenantId, CreatedAt, CreatedBy)
SELECT r.Id, p.Id, @TenantId, GETUTCDATE(), 'System'
FROM AspNetRoles r
JOIN Permissions p ON p.Name IN (
    'CREATE_BUSINESS_DEVELOPMENT','EDIT_BUSINESS_DEVELOPMENT','DELETE_BUSINESS_DEVELOPMENT','VIEW_BUSINESS_DEVELOPMENT')
WHERE r.Name = 'Subject Matter Expert' AND r.TenantId = @TenantId;

-- Regional Director
INSERT INTO RolePermissions (RoleId, PermissionId, TenantId, CreatedAt, CreatedBy)
SELECT r.Id, p.Id, @TenantId, GETUTCDATE(), 'System'
FROM AspNetRoles r
JOIN Permissions p ON p.Name IN (
    'VIEW_PROJECT','CREATE_PROJECT','EDIT_PROJECT','DELETE_PROJECT','APPROVE_PROJECT',
    'CREATE_BUSINESS_DEVELOPMENT','EDIT_BUSINESS_DEVELOPMENT','DELETE_BUSINESS_DEVELOPMENT',
    'VIEW_BUSINESS_DEVELOPMENT','APPROVE_BUSINESS_DEVELOPMENT')
WHERE r.Name = 'Regional Director' AND r.TenantId = @TenantId;

-- Reviewer
INSERT INTO RolePermissions (RoleId, PermissionId, TenantId, CreatedAt, CreatedBy)
SELECT r.Id, p.Id, @TenantId, GETUTCDATE(), 'System'
FROM AspNetRoles r
JOIN Permissions p ON p.Name = 'REVIEWER'
WHERE r.Name = 'Reviewer' AND r.TenantId = @TenantId;

-- Checker
INSERT INTO RolePermissions (RoleId, PermissionId, TenantId, CreatedAt, CreatedBy)
SELECT r.Id, p.Id, @TenantId, GETUTCDATE(), 'System'
FROM AspNetRoles r
JOIN Permissions p ON p.Name = 'CHECKER'
WHERE r.Name = 'Checker' AND r.TenantId = @TenantId;


-- TenantAdmin (all permissions)
INSERT INTO RolePermissions (RoleId, PermissionId, TenantId, CreatedAt, CreatedBy)
SELECT r.Id, p.Id, @TenantId, GETUTCDATE(), 'System'
FROM AspNetRoles r
CROSS JOIN Permissions p
WHERE r.Name = 'TenantAdmin' AND r.TenantId = @TenantId;