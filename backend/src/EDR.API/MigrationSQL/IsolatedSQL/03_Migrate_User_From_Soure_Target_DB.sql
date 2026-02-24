-- ----------------------------------------------------
-- Please select target DATABASE before running this SQL script
-- ----------------------------------------------------

BEGIN;

DO $$
DECLARE
v_source_db TEXT := '';     -- Source database name
    v_target_db TEXT := '';     -- Target database name (current DB recommended)
    v_tenant_id INT  := 0;
    v_email TEXT := '';
    v_role_name TEXT := '';
    v_permission_name TEXT := '';
BEGIN
    -------------------------------------------------------------------
    -- 1) Force Insert User (if not exists in TARGET)
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM "AspNetUsers" WHERE "Email" = v_email
    ) THEN
        INSERT INTO "AspNetUsers" (
            "Id", "Name", "Avatar", "CreatedAt", "LastLogin", "StandardRate",
            "IsConsultant", "IsActive", "TenantId", "UserName", "NormalizedUserName",
            "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash",
            "SecurityStamp", "ConcurrencyStamp", "PhoneNumber", "PhoneNumberConfirmed",
            "TwoFactorEnabled", "LockoutEnd", "LockoutEnabled", "AccessFailedCount"
        )
SELECT
    gen_random_uuid(),
    u."Name", u."Avatar", NOW() AT TIME ZONE 'UTC', u."LastLogin", u."StandardRate",
    u."IsConsultant", u."IsActive", v_tenant_id, u."UserName", u."NormalizedUserName",
    u."Email", u."NormalizedEmail", u."EmailConfirmed", u."PasswordHash",
    u."SecurityStamp", u."ConcurrencyStamp", u."PhoneNumber", u."PhoneNumberConfirmed",
    u."TwoFactorEnabled", u."LockoutEnd", u."LockoutEnabled", u."AccessFailedCount"
FROM dblink(
             format('dbname=%I', v_source_db),
             'SELECT * FROM "AspNetUsers" WHERE "Email" = ' || quote_literal(v_email)
     ) AS u(
            "Id" uuid, "Name" text, "Avatar" text, "CreatedAt" timestamptz,
            "LastLogin" timestamptz, "StandardRate" numeric,
            "IsConsultant" boolean, "IsActive" boolean, "TenantId" int,
            "UserName" text, "NormalizedUserName" text,
            "Email" text, "NormalizedEmail" text, "EmailConfirmed" boolean,
            "PasswordHash" text, "SecurityStamp" text, "ConcurrencyStamp" text,
            "PhoneNumber" text, "PhoneNumberConfirmed" boolean,
            "TwoFactorEnabled" boolean, "LockoutEnd" timestamptz,
            "LockoutEnabled" boolean, "AccessFailedCount" int
    );
END IF;

    -------------------------------------------------------------------
    -- 2) Force Insert Role
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM "AspNetRoles" WHERE "Name" = v_role_name
    ) THEN
        INSERT INTO "AspNetRoles"
        ("Id", "Name", "NormalizedName", "ConcurrencyStamp", "Description", "TenantId")
SELECT
    gen_random_uuid(),
    r."Name", r."NormalizedName", r."ConcurrencyStamp", r."Description", v_tenant_id
FROM dblink(
             format('dbname=%I', v_source_db),
             'SELECT "Name","NormalizedName","ConcurrencyStamp","Description"
              FROM "AspNetRoles" WHERE "Name" = ' || quote_literal(v_role_name)
     ) AS r(
            "Name" text, "NormalizedName" text,
            "ConcurrencyStamp" text, "Description" text
    );
END IF;

    -------------------------------------------------------------------
    -- 3) Link User to Role
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1
        FROM "AspNetUserRoles" ur
        JOIN "AspNetUsers" u ON ur."UserId" = u."Id"
        JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
        WHERE u."Email" = v_email AND r."Name" = v_role_name
    ) THEN
        INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
SELECT u."Id", r."Id"
FROM "AspNetUsers" u
         CROSS JOIN "AspNetRoles" r
WHERE u."Email" = v_email AND r."Name" = v_role_name;
END IF;

    -------------------------------------------------------------------
    -- 4) Force Insert Permission
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM "Permissions" WHERE "Name" = v_permission_name
    ) THEN
        INSERT INTO "Permissions" ("Name", "Description")
SELECT p."Name", p."Description"
FROM dblink(
             format('dbname=%I', v_source_db),
             'SELECT "Name","Description" FROM "Permissions"
              WHERE "Name" = ' || quote_literal(v_permission_name)
     ) AS p("Name" text, "Description" text);
END IF;

    -------------------------------------------------------------------
    -- 5) Link Role to Permission
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1
        FROM "RolePermissions" rp
        JOIN "AspNetRoles" r ON rp."RoleId" = r."Id"
        JOIN "Permissions" p ON rp."PermissionId" = p."Id"
        WHERE r."Name" = v_role_name AND p."Name" = v_permission_name
    ) THEN
        INSERT INTO "RolePermissions"
        ("RoleId", "PermissionId", "TenantId", "CreatedAt", "CreatedBy")
SELECT
    r."Id", p."Id", v_tenant_id, NOW() AT TIME ZONE 'UTC', v_email
FROM "AspNetRoles" r
         CROSS JOIN "Permissions" p
WHERE r."Name" = v_role_name AND p."Name" = v_permission_name;
END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END $$;

COMMIT;
