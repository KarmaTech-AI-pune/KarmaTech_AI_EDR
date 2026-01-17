-- ----------------------------------------------------
-- Please select target DATABASE before running this SQL script
-- Explicitly we removed the ADMIN ROLE and its permission for Tenant
-- ----------------------------------------------------
-- For TenantId: Make sure TenantId exists in MAIN database
-- Target DB example:
-- \c "KarmaTechAISAAS_EdrAdmin-tenant2"
-- ----------------------------------------------------

-- ====================================================
-- Ensure UNIQUE constraint exists for Roles
-- ====================================================
CREATE UNIQUE INDEX IF NOT EXISTS "uq_AspNetRoles_Name_TenantId"
    ON "AspNetRoles" ("Name", "TenantId");

CREATE UNIQUE INDEX IF NOT EXISTS "uq_RolePermissions_Role_Permission_Tenant"
    ON "RolePermissions" ("RoleId", "PermissionId", "TenantId");

-- ====================================================
-- Insert Roles & Role Permissions
-- ====================================================
DO $$
DECLARE
v_tenant_id INT := 0;  
BEGIN

-- ====================================================
-- Insert Roles
-- ====================================================
INSERT INTO "AspNetRoles"
(
    "Id",
    "Name",
    "NormalizedName",
    "Description",
    "MinRate",
    "IsResourceRole",
    "TenantId"
)
VALUES
    (gen_random_uuid(), 'Project Manager', 'PROJECT MANAGER', 'Project Manager role', 120.00, TRUE,  v_tenant_id),
    (gen_random_uuid(), 'Senior Project Manager', 'SENIOR PROJECT MANAGER', 'Senior Project Manager role', 100.00, TRUE, v_tenant_id),
    (gen_random_uuid(), 'Regional Manager', 'REGIONAL MANAGER', 'Regional Manager is Bid form reviewer role', 0.00, TRUE, v_tenant_id),
    (gen_random_uuid(), 'Business Development Manager', 'BUSINESS DEVELOPMENT MANAGER', 'Bid manager role', 0.00, TRUE, v_tenant_id),
    (gen_random_uuid(), 'Subject Matter Expert', 'SUBJECT MATTER EXPERT', 'Subject Matter Expert role', 80.00, TRUE, v_tenant_id),
    (gen_random_uuid(), 'Regional Director', 'REGIONAL DIRECTOR', 'Approval Manager for BD form', 0.00, TRUE, v_tenant_id),
    (gen_random_uuid(), 'Reviewer', 'REVIEWER', 'Review the check-review form', 0.00, FALSE, v_tenant_id),
    (gen_random_uuid(), 'Checker', 'CHECKER', 'Check the check-review form', 0.00, FALSE, v_tenant_id),
    (gen_random_uuid(), 'TenantAdmin', 'TENANTADMIN', 'Tenant Administrator role', 0.00, FALSE, v_tenant_id)
    ON CONFLICT ("Name", "TenantId") DO NOTHING;

-- ====================================================
-- ROLE PERMISSIONS
-- ====================================================

-- Project Manager
INSERT INTO "RolePermissions"
(
    "RoleId",
    "PermissionId",
    "TenantId",
    "CreatedAt",
    "CreatedBy"
)
SELECT r."Id", p."Id", v_tenant_id, NOW() AT TIME ZONE 'UTC', 'System'
FROM "AspNetRoles" r
         JOIN "Permissions" p ON p."Name" IN
                                 ('VIEW_PROJECT', 'CREATE_PROJECT', 'EDIT_PROJECT', 'DELETE_PROJECT', 'SUBMIT_PROJECT_FOR_REVIEW')
WHERE r."Name" = 'Project Manager'
  AND r."TenantId" = v_tenant_id
    ON CONFLICT ("RoleId", "PermissionId", "TenantId") DO NOTHING;

-- Senior Project Manager
INSERT INTO "RolePermissions"
(
    "RoleId",
    "PermissionId",
    "TenantId",
    "CreatedAt",
    "CreatedBy"
)
SELECT r."Id", p."Id", v_tenant_id, NOW() AT TIME ZONE 'UTC', 'System'
FROM "AspNetRoles" r
         JOIN "Permissions" p ON p."Name" IN
                                 ('VIEW_PROJECT', 'CREATE_PROJECT', 'EDIT_PROJECT', 'DELETE_PROJECT', 'REVIEW_PROJECT', 'SUBMIT_FOR_APPROVAL')
WHERE r."Name" = 'Senior Project Manager'
  AND r."TenantId" = v_tenant_id
    ON CONFLICT ("RoleId", "PermissionId", "TenantId") DO NOTHING;

-- Regional Manager
INSERT INTO "RolePermissions"
(
    "RoleId",
    "PermissionId",
    "TenantId",
    "CreatedAt",
    "CreatedBy"
)
SELECT r."Id", p."Id", v_tenant_id, NOW() AT TIME ZONE 'UTC', 'System'
FROM "AspNetRoles" r
         JOIN "Permissions" p ON p."Name" IN
                                 (
                                  'VIEW_PROJECT', 'CREATE_PROJECT', 'EDIT_PROJECT', 'DELETE_PROJECT', 'APPROVE_PROJECT',
                                  'CREATE_BUSINESS_DEVELOPMENT', 'EDIT_BUSINESS_DEVELOPMENT', 'DELETE_BUSINESS_DEVELOPMENT',
                                  'VIEW_BUSINESS_DEVELOPMENT', 'REVIEW_BUSINESS_DEVELOPMENT', 'SUBMIT_FOR_APPROVAL'
                                     )
WHERE r."Name" = 'Regional Manager'
  AND r."TenantId" = v_tenant_id
    ON CONFLICT ("RoleId", "PermissionId", "TenantId") DO NOTHING;

-- Business Development Manager
INSERT INTO "RolePermissions"
(
    "RoleId",
    "PermissionId",
    "TenantId",
    "CreatedAt",
    "CreatedBy"
)
SELECT r."Id", p."Id", v_tenant_id, NOW() AT TIME ZONE 'UTC', 'System'
FROM "AspNetRoles" r
         JOIN "Permissions" p ON p."Name" IN
                                 ('CREATE_BUSINESS_DEVELOPMENT', 'EDIT_BUSINESS_DEVELOPMENT', 'DELETE_BUSINESS_DEVELOPMENT', 'VIEW_BUSINESS_DEVELOPMENT')
WHERE r."Name" = 'Business Development Manager'
  AND r."TenantId" = v_tenant_id
    ON CONFLICT ("RoleId", "PermissionId", "TenantId") DO NOTHING;

-- Subject Matter Expert
INSERT INTO "RolePermissions"
(
    "RoleId",
    "PermissionId",
    "TenantId",
    "CreatedAt",
    "CreatedBy"
)
SELECT r."Id", p."Id", v_tenant_id, NOW() AT TIME ZONE 'UTC', 'System'
FROM "AspNetRoles" r
         JOIN "Permissions" p ON p."Name" IN
                                 ('CREATE_BUSINESS_DEVELOPMENT', 'EDIT_BUSINESS_DEVELOPMENT', 'DELETE_BUSINESS_DEVELOPMENT', 'VIEW_BUSINESS_DEVELOPMENT')
WHERE r."Name" = 'Subject Matter Expert'
  AND r."TenantId" = v_tenant_id
    ON CONFLICT ("RoleId", "PermissionId", "TenantId") DO NOTHING;

-- Regional Director
INSERT INTO "RolePermissions"
(
    "RoleId",
    "PermissionId",
    "TenantId",
    "CreatedAt",
    "CreatedBy"
)
SELECT r."Id", p."Id", v_tenant_id, NOW() AT TIME ZONE 'UTC', 'System'
FROM "AspNetRoles" r
         JOIN "Permissions" p ON p."Name" IN
                                 (
                                  'VIEW_PROJECT', 'CREATE_PROJECT', 'EDIT_PROJECT', 'DELETE_PROJECT', 'APPROVE_PROJECT',
                                  'CREATE_BUSINESS_DEVELOPMENT', 'EDIT_BUSINESS_DEVELOPMENT', 'DELETE_BUSINESS_DEVELOPMENT',
                                  'VIEW_BUSINESS_DEVELOPMENT', 'APPROVE_BUSINESS_DEVELOPMENT'
                                     )
WHERE r."Name" = 'Regional Director'
  AND r."TenantId" = v_tenant_id
    ON CONFLICT ("RoleId", "PermissionId", "TenantId") DO NOTHING;

-- Reviewer
INSERT INTO "RolePermissions"
(
    "RoleId",
    "PermissionId",
    "TenantId",
    "CreatedAt",
    "CreatedBy"
)
SELECT r."Id", p."Id", v_tenant_id, NOW() AT TIME ZONE 'UTC', 'System'
FROM "AspNetRoles" r
         JOIN "Permissions" p ON p."Name" = 'REVIEWER'
WHERE r."Name" = 'Reviewer'
  AND r."TenantId" = v_tenant_id
    ON CONFLICT ("RoleId", "PermissionId", "TenantId") DO NOTHING;

-- Checker
INSERT INTO "RolePermissions"
(
    "RoleId",
    "PermissionId",
    "TenantId",
    "CreatedAt",
    "CreatedBy"
)
SELECT r."Id", p."Id", v_tenant_id, NOW() AT TIME ZONE 'UTC', 'System'
FROM "AspNetRoles" r
         JOIN "Permissions" p ON p."Name" = 'CHECKER'
WHERE r."Name" = 'Checker'
  AND r."TenantId" = v_tenant_id
    ON CONFLICT ("RoleId", "PermissionId", "TenantId") DO NOTHING;

-- TenantAdmin (ALL permissions)
INSERT INTO "RolePermissions"
(
    "RoleId",
    "PermissionId",
    "TenantId",
    "CreatedAt",
    "CreatedBy"
)
SELECT r."Id", p."Id", v_tenant_id, NOW() AT TIME ZONE 'UTC', 'System'
FROM "AspNetRoles" r
         CROSS JOIN "Permissions" p
WHERE r."Name" = 'TenantAdmin'
  AND r."TenantId" = v_tenant_id
    ON CONFLICT ("RoleId", "PermissionId", "TenantId") DO NOTHING;

END;
$$;
