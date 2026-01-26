BEGIN;

CREATE EXTENSION IF NOT EXISTS dblink;

DO $$
DECLARE
    -- ===== CONFIG (replace via placeholders from C#) =====
v_source_db TEXT := '{{SOURCE_DB}}';
    v_host TEXT := '{{SOURCE_HOST}}';        -- e.g. localhost / host.docker.internal
    v_port TEXT := '{{SOURCE_PORT}}';        -- usually 5432
    v_user TEXT := '{{SOURCE_USER}}';
    v_password TEXT := '{{SOURCE_PASSWORD}}';

    v_tenant_id INT := {{TENANT_ID}};
    v_email TEXT := '{{USER_EMAIL}}';
    v_role_name TEXT := '{{ROLE_NAME}}';
    v_permission_name TEXT := '{{PERMISSION_NAME}}';

    v_conn_str TEXT;
BEGIN
    -------------------------------------------------------------------
    -- Open dblink connection ONCE
    -------------------------------------------------------------------
    v_conn_str :=
        format(
            'host=%s port=%s dbname=%I user=%s password=%s',
            v_host,
            v_port,
            v_source_db,
            v_user,
            v_password
        );

    PERFORM dblink_connect('src', v_conn_str);

    -------------------------------------------------------------------
    -- 1) Insert User
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM "AspNetUsers" WHERE "Email" = v_email
    ) THEN
        INSERT INTO "AspNetUsers" (
            "Id","Name","Avatar","CreatedAt","LastLogin","StandardRate",
            "IsConsultant","IsActive","TenantId","UserName","NormalizedUserName",
            "Email","NormalizedEmail","EmailConfirmed","PasswordHash",
            "SecurityStamp","ConcurrencyStamp","PhoneNumber","PhoneNumberConfirmed",
            "TwoFactorEnabled","LockoutEnd","LockoutEnabled","AccessFailedCount"
        )
SELECT
    gen_random_uuid(),
    u."Name", u."Avatar", NOW() AT TIME ZONE 'UTC', u."LastLogin",
    u."StandardRate", u."IsConsultant", u."IsActive",
    v_tenant_id,
    u."UserName", u."NormalizedUserName",
    u."Email", u."NormalizedEmail", u."EmailConfirmed",
    u."PasswordHash", u."SecurityStamp", u."ConcurrencyStamp",
    u."PhoneNumber", u."PhoneNumberConfirmed",
    u."TwoFactorEnabled", u."LockoutEnd",
    u."LockoutEnabled", u."AccessFailedCount"
FROM dblink(
             'src',
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
    -- 2) Insert Role
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM "AspNetRoles" WHERE "Name" = v_role_name
    ) THEN
        INSERT INTO "AspNetRoles"
        ("Id","Name","NormalizedName","ConcurrencyStamp","Description","TenantId")
SELECT
    gen_random_uuid(),
    r."Name", r."NormalizedName", r."ConcurrencyStamp",
    r."Description", v_tenant_id
FROM dblink(
             'src',
             'SELECT "Name","NormalizedName","ConcurrencyStamp","Description"
              FROM "AspNetRoles"
              WHERE "Name" = ' || quote_literal(v_role_name)
     ) AS r(
            "Name" text, "NormalizedName" text,
            "ConcurrencyStamp" text, "Description" text
    );
END IF;

    -------------------------------------------------------------------
    -- 3) User ↔ Role
    -------------------------------------------------------------------
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

    -------------------------------------------------------------------
    -- 4) Permission
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM "Permissions" WHERE "Name" = v_permission_name
    ) THEN
        INSERT INTO "Permissions" ("Name","Description")
SELECT p."Name", p."Description"
FROM dblink(
             'src',
             'SELECT "Name","Description"
              FROM "Permissions"
              WHERE "Name" = ' || quote_literal(v_permission_name)
     ) AS p("Name" text, "Description" text);
END IF;

    -------------------------------------------------------------------
    -- 5) Role ↔ Permission
    -------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1
        FROM "RolePermissions" rp
        JOIN "AspNetRoles" r ON rp."RoleId" = r."Id"
        JOIN "Permissions" p ON rp."PermissionId" = p."Id"
        WHERE r."Name" = v_role_name AND p."Name" = v_permission_name
    ) THEN
        INSERT INTO "RolePermissions"
        ("RoleId","PermissionId","TenantId","CreatedAt","CreatedBy")
SELECT
    r."Id", p."Id", v_tenant_id,
    NOW() AT TIME ZONE 'UTC', v_email
FROM "AspNetRoles" r
         JOIN "Permissions" p ON p."Name" = v_permission_name
WHERE r."Name" = v_role_name;
END IF;

    -------------------------------------------------------------------
    -- Close dblink
    -------------------------------------------------------------------
 IF dblink_is_connected('src') THEN
        PERFORM dblink_disconnect('src');
END IF;

EXCEPTION
    WHEN OTHERS THEN
        IF dblink_is_connected('src') THEN
            PERFORM dblink_disconnect('src');
END IF;
        RAISE;
END $$;

COMMIT;
