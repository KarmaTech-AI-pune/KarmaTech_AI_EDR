-- =============================================
-- Tenant User Migration Script
-- Replace placeholders via C# before executing
-- =============================================

-- 1️⃣ Enable foreign data wrapper
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- 2️⃣ Create server for source DB
DROP SERVER IF EXISTS src_server CASCADE;

CREATE SERVER src_server
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (
    host '{{SOURCE_HOST}}',
    port '{{SOURCE_PORT}}',
    dbname '{{SOURCE_DB}}'
);

-- 3️⃣ User mapping
CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
SERVER src_server
OPTIONS (user '{{SOURCE_USER}}', password '{{SOURCE_PASSWORD}}');

-- 4️⃣ Create foreign tables
DROP FOREIGN TABLE IF EXISTS src_AspNetUsers;
CREATE FOREIGN TABLE src_AspNetUsers (
    "Id" uuid,
    "Name" text,
    "Avatar" text,
    "CreatedAt" timestamptz,
    "LastLogin" timestamptz,
    "StandardRate" numeric,
    "IsConsultant" boolean,
    "IsActive" boolean,
    "TenantId" int,
    "UserName" text,
    "NormalizedUserName" text,
    "Email" text,
    "NormalizedEmail" text,
    "EmailConfirmed" boolean,
    "PasswordHash" text,
    "SecurityStamp" text,
    "ConcurrencyStamp" text,
    "PhoneNumber" text,
    "PhoneNumberConfirmed" boolean,
    "TwoFactorEnabled" boolean,
    "LockoutEnd" timestamptz,
    "LockoutEnabled" boolean,
    "AccessFailedCount" int
)
SERVER src_server
OPTIONS (schema_name 'public', table_name 'AspNetUsers');

DROP FOREIGN TABLE IF EXISTS src_AspNetRoles;
CREATE FOREIGN TABLE src_AspNetRoles (
    "Id" uuid,
    "Name" text,
    "NormalizedName" text,
    "ConcurrencyStamp" text,
    "Description" text
)
SERVER src_server
OPTIONS (schema_name 'public', table_name 'AspNetRoles');

DROP FOREIGN TABLE IF EXISTS src_Permissions;
CREATE FOREIGN TABLE src_Permissions (
    "Id" uuid,
    "Name" text,
    "Description" text
)
SERVER src_server
OPTIONS (schema_name 'public', table_name 'Permissions');

-- =============================================
-- 5️⃣ Do Migration
-- =============================================
DO $$
DECLARE
v_tenant_id INT := {{TENANT_ID}};
    v_email TEXT := '{{USER_EMAIL}}';
    v_role_name TEXT := '{{ROLE_NAME}}';
    v_permission_name TEXT := '{{PERMISSION_NAME}}';
BEGIN
    -- Insert User
    IF NOT EXISTS (SELECT 1 FROM "AspNetUsers" WHERE "Email" = v_email) THEN
        INSERT INTO "AspNetUsers" (
            "Id","Name","Avatar","CreatedAt","LastLogin","StandardRate",
            "IsConsultant","IsActive","TenantId","UserName","NormalizedUserName",
            "Email","NormalizedEmail","EmailConfirmed","PasswordHash",
            "SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed",
            "TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount"
        )
SELECT
    gen_random_uuid(),
    u."Name",
    u."Avatar",
    NOW() AT TIME ZONE 'UTC',
    u."LastLogin",
    u."StandardRate",
    u."IsConsultant",
    u."IsActive",
    v_tenant_id,
    u."UserName",
    u."NormalizedUserName",
    u."Email",
    u."NormalizedEmail",
    u."EmailConfirmed",
    u."PasswordHash",
    u."SecurityStamp",
    u."ConcurrencyStamp",
    u."PhoneNumber",
    u."PhoneNumberConfirmed",
    u."TwoFactorEnabled",
    u."LockoutEnd",
    u."LockoutEnabled",
    u."AccessFailedCount"
FROM src_AspNetUsers u
WHERE u."Email" = v_email;
END IF;

    -- Insert Role
    IF NOT EXISTS (SELECT 1 FROM "AspNetRoles" WHERE "Name" = v_role_name) THEN
        INSERT INTO "AspNetRoles" (
            "Id","Name","NormalizedName","ConcurrencyStamp","Description","TenantId"
        )
SELECT gen_random_uuid(), r."Name", r."NormalizedName", r."ConcurrencyStamp", r."Description", v_tenant_id
FROM src_AspNetRoles r
WHERE r."Name" = v_role_name;
END IF;

    -- User ↔ Role
    IF NOT EXISTS (
        SELECT 1
        FROM "AspNetUserRoles" ur
        JOIN "AspNetUsers" u ON ur."UserId" = u."Id"
        JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
        WHERE u."Email" = v_email AND r."Name" = v_role_name
    ) THEN
        INSERT INTO "AspNetUserRoles" ("UserId","RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
         JOIN "AspNetRoles" r ON r."Name" = v_role_name
WHERE u."Email" = v_email;
END IF;

    -- Insert Permission
    IF NOT EXISTS (SELECT 1 FROM "Permissions" WHERE "Name" = v_permission_name) THEN
        INSERT INTO "Permissions" ("Name","Description")
SELECT p."Name", p."Description"
FROM src_Permissions p
WHERE p."Name" = v_permission_name;
END IF;

    -- Role ↔ Permission
    IF NOT EXISTS (
        SELECT 1
        FROM "RolePermissions" rp
        JOIN "AspNetRoles" r ON rp."RoleId" = r."Id"
        JOIN "Permissions" p ON rp."PermissionId" = p."Id"
        WHERE r."Name" = v_role_name AND p."Name" = v_permission_name
    ) THEN
        INSERT INTO "RolePermissions" ("RoleId","PermissionId","TenantId","CreatedAt","CreatedBy")
SELECT r."Id", p."Id", v_tenant_id, NOW() AT TIME ZONE 'UTC', v_email
FROM "AspNetRoles" r
         JOIN "Permissions" p ON p."Name" = v_permission_name
WHERE r."Name" = v_role_name;
END IF;
END $$;
