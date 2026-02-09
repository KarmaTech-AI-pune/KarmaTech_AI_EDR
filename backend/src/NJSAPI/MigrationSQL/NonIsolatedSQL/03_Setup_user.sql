-- ----------------------------------------------------
-- PostgreSQL: User / Role / Permission setup
-- ----------------------------------------------------

-- Required once
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP INDEX IF EXISTS "RoleNameIndex";
--DROP INDEX IF EXISTS "uq_AspNetRoles_Name_TenantId";

BEGIN;

DO $$
DECLARE
v_tenant_id        INT := {{TENANT_ID}};              -- Target tenant
    v_email            TEXT := '{{USER_EMAIL}}';
    v_role_name        TEXT := '{{ROLE_NAME}}';
    v_permission_name  TEXT := '{{PERMISSION_NAME}}';

    v_user_id          TEXT;
    v_role_id          TEXT;
    v_permission_id    INT;
BEGIN
    -------------------------------------------------------------------
    -- 1) Check if User exists → update or insert
    -------------------------------------------------------------------
SELECT "Id"
INTO v_user_id
FROM "AspNetUsers"
WHERE "Email" = v_email;

IF v_user_id IS NOT NULL THEN
UPDATE "AspNetUsers"
SET "TenantId"  = v_tenant_id,
    "IsActive"  = TRUE,
    "LastLogin" = NOW() AT TIME ZONE 'UTC'
WHERE "Id" = v_user_id;

RAISE NOTICE 'Existing user found. TenantId updated.';
ELSE
        INSERT INTO "AspNetUsers" (
            "Id", "Name", "Avatar", "CreatedAt", "LastLogin", "StandardRate",
            "IsConsultant", "IsActive", "TenantId", "UserName", "NormalizedUserName",
            "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash",
            "SecurityStamp", "ConcurrencyStamp", "PhoneNumber", "PhoneNumberConfirmed",
            "TwoFactorEnabled", "LockoutEnd", "LockoutEnabled", "AccessFailedCount"
        )
SELECT
    gen_random_uuid(),
    "Name", "Avatar", NOW() AT TIME ZONE 'UTC', "LastLogin", "StandardRate",
    "IsConsultant", TRUE, v_tenant_id, "UserName", "NormalizedUserName",
    "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash",
    "SecurityStamp", "ConcurrencyStamp", "PhoneNumber", "PhoneNumberConfirmed",
    "TwoFactorEnabled", "LockoutEnd", "LockoutEnabled", "AccessFailedCount"
FROM "AspNetUsers"
WHERE "Email" = v_email
    LIMIT 1;

SELECT "Id" INTO v_user_id
FROM "AspNetUsers"
WHERE "Email" = v_email;

RAISE NOTICE 'New user inserted for TenantId %', v_tenant_id;
END IF;

    -------------------------------------------------------------------
    -- 2) Insert Roles if not exists (tenant-scoped)
    -------------------------------------------------------------------
SELECT "Id"
INTO v_role_id
FROM "AspNetRoles"
WHERE "Name" = v_role_name
  AND "TenantId" = v_tenant_id;

IF v_role_id IS NULL THEN
        INSERT INTO "AspNetRoles"
        ("Id","Name","NormalizedName","Description","MinRate","IsResourceRole","TenantId")
        VALUES
        (gen_random_uuid(), v_role_name, UPPER(v_role_name), 'Tenant role', 1, FALSE, v_tenant_id),
        (gen_random_uuid(), 'Project Manager', 'PROJECT MANAGER', 'Project Manager role', 120, TRUE, v_tenant_id),
        (gen_random_uuid(), 'Senior Project Manager', 'SENIOR PROJECT MANAGER', 'Senior Project Manager role', 100, TRUE, v_tenant_id),
        (gen_random_uuid(), 'Regional Manager', 'REGIONAL MANAGER', 'Regional Manager is Bid form reviewer role', 0, TRUE, v_tenant_id),
        (gen_random_uuid(), 'Business Development Manager', 'BUSINESS DEVELOPMENT MANAGER', 'Bid manager role', 0, TRUE, v_tenant_id),
        (gen_random_uuid(), 'Subject Matter Expert', 'SUBJECT MATTER EXPERT', 'Subject Matter Expert role', 80, TRUE, v_tenant_id),
        (gen_random_uuid(), 'Regional Director', 'REGIONAL DIRECTOR', 'Approval Manager for BD form', 0, TRUE, v_tenant_id),
        (gen_random_uuid(), 'Reviewer', 'REVIEWER', 'Review the check-review form', 0, FALSE, v_tenant_id),
        (gen_random_uuid(), 'Checker', 'CHECKER', 'Check the check-review form', 0, FALSE, v_tenant_id);

SELECT "Id"
INTO v_role_id
FROM "AspNetRoles"
WHERE "Name" = v_role_name
  AND "TenantId" = v_tenant_id;
END IF;

    -------------------------------------------------------------------
    -- 3) Link User → Role
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1
        FROM "AspNetUserRoles"
        WHERE "UserId" = v_user_id
          AND "RoleId" = v_role_id
    ) THEN
        INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
        VALUES (v_user_id, v_role_id);
END IF;

    -------------------------------------------------------------------
    -- 4) Insert Permission if not exists
    -------------------------------------------------------------------
SELECT "Id"
INTO v_permission_id
FROM "Permissions"
WHERE "Name" = v_permission_name;

IF v_permission_id IS NULL THEN
        INSERT INTO "Permissions" ("Name", "Description")
        VALUES (v_permission_name, 'Tenant specific permission');

SELECT "Id"
INTO v_permission_id
FROM "Permissions"
WHERE "Name" = v_permission_name;
END IF;

    -------------------------------------------------------------------
    -- 5) Link Role → Permission
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1
        FROM "RolePermissions"
        WHERE "RoleId" = v_role_id
          AND "PermissionId" = v_permission_id
    ) THEN
        INSERT INTO "RolePermissions"
        ("RoleId","PermissionId","TenantId","CreatedAt","CreatedBy")
        VALUES (
            v_role_id,
            v_permission_id,
            v_tenant_id,
            NOW() AT TIME ZONE 'UTC',
            v_email
        );
END IF;

    RAISE NOTICE 'User/Role/Permission setup completed for TenantId %', v_tenant_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END $$;

COMMIT;
