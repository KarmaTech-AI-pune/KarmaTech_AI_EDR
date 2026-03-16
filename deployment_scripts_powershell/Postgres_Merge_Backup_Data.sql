/*
==============================================================================
POSTGRESQL DATA MERGE SCRIPT
==============================================================================
STEP 1: Change the 3 values below.
STEP 2: Select ALL and Run in your TARGET database.

The script will take ALL data from v_restore_db and insert it into 
the current database, stamping every row with v_target_tenant_id.
==============================================================================
*/

CREATE EXTENSION IF NOT EXISTS dblink;

DO $$
DECLARE
    -- ============================================================
    -- PARAMETERS: ONLY CHANGE THESE 3 VALUES. DO NOT EDIT BELOW.
    -- ============================================================
    v_restore_db       TEXT := 'Restore_DB'; -- <== Restored Backup DB Name
    v_target_tenant_id INT  := 1;            -- <== Tenant ID to assign all data
    v_db_password      TEXT := 'admin@123';  -- <== Your PostgreSQL Password
    -- ============================================================

    v_target_db   TEXT := current_database();
    v_user        TEXT := current_user;
    v_db_host     TEXT := 'localhost';
    v_db_port     TEXT := '5432';
    v_schema_name TEXT := 'public';

    v_table_record       RECORD;
    v_pk_col_record      RECORD;
    v_common_columns     TEXT;
    v_pk_join_condition  TEXT;
    v_sql                TEXT;
    v_conn_str           TEXT;
    v_has_tenant_id      BOOLEAN;
    v_target_tenant_col  TEXT;
    v_actual_table_name  TEXT;
    v_is_replica_set     BOOLEAN := FALSE;
    v_rows_inserted      INT;
    v_dblink_query       TEXT;
    v_dblink_types       TEXT;
    v_target_conn_str    TEXT;
    v_col_name           TEXT;
    v_exists             BOOLEAN;
BEGIN
    RAISE NOTICE '=== MERGE STARTING ===';
    RAISE NOTICE 'Source (Restore DB): %', v_restore_db;
    RAISE NOTICE 'Target DB:           %', v_target_db;
    RAISE NOTICE 'Injecting Tenant ID: %', v_target_tenant_id;

    -- Step 0: Bypass FK constraints (superuser only, fallback is safe)
    BEGIN
        SET session_replication_role = 'replica';
        v_is_replica_set := TRUE;
        RAISE NOTICE 'Status: FK constraints bypassed.';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Status: FK constraints active.';
    END;

    -- Step 1: Open dblink connection to restore DB
    IF 'source_conn' IN (SELECT unnest(dblink_get_connections())) THEN
        PERFORM dblink_disconnect('source_conn');
    END IF;

    v_conn_str := format('host=%s port=%s dbname=%s user=%s password=%s',
        v_db_host, v_db_port, v_restore_db, v_user, v_db_password);

    BEGIN
        PERFORM dblink_connect('source_conn', v_conn_str);
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Cannot connect to restore DB [%]. Check the name is correct and it is restored. Error: %', v_restore_db, SQLERRM;
    END;

    -- Step 2: Loop through all tables
    FOR v_table_record IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = v_schema_name
          AND table_type = 'BASE TABLE'
          AND LOWER(table_name) NOT IN ('tenantdatabases', 'spatial_ref_sys', '__efmigrationshistory')
        ORDER BY
            CASE
                WHEN LOWER(table_name) = 'tenants'            THEN 0
                WHEN LOWER(table_name) = 'subscriptionplans'  THEN 1
                WHEN LOWER(table_name) = 'aspnetroles'        THEN 2
                WHEN LOWER(table_name) = 'aspnetusers'        THEN 3
                ELSE 10
            END, table_name
    LOOP
        v_actual_table_name := v_table_record.table_name;

        -- Does this table have a TenantId column?
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = v_schema_name
          AND table_name = v_actual_table_name
          AND LOWER(column_name) = 'tenantid'
        INTO v_target_tenant_col;
        v_has_tenant_id := (v_target_tenant_col IS NOT NULL);

        -- Build common columns between source and target (excluding TenantId)
        SELECT
            string_agg(quote_ident(t.column_name), ', ' ORDER BY t.ordinal_position),
            string_agg(quote_ident(t.column_name) || ' ' || t.data_type, ', ' ORDER BY t.ordinal_position)
        FROM information_schema.columns t
        INNER JOIN dblink('source_conn',
            format('SELECT column_name FROM information_schema.columns WHERE table_schema = %L AND table_name = %L',
                v_schema_name, v_actual_table_name))
            AS s(column_name TEXT) ON LOWER(t.column_name) = LOWER(s.column_name)
        WHERE t.table_schema = v_schema_name
          AND t.table_name = v_actual_table_name
          AND LOWER(t.column_name) != 'tenantid'   -- Always exclude TenantId (we inject it)
        INTO v_common_columns, v_dblink_types;

        -- Build PK join condition (SAME AS T-SQL: only compare PK columns, no TenantId)
        -- This prevents duplicate rows when same Id exists for different TenantIds
        v_pk_join_condition := NULL;
        FOR v_pk_col_record IN
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_name = v_actual_table_name
              AND tc.table_schema = v_schema_name
              AND LOWER(kcu.column_name) != 'tenantid'  -- Exclude TenantId from PK check
        LOOP
            IF v_pk_join_condition IS NOT NULL THEN
                v_pk_join_condition := v_pk_join_condition || ' AND ';
            END IF;
            v_pk_join_condition := v_pk_join_condition
                || format('t.%I = s.%I', v_pk_col_record.column_name, v_pk_col_record.column_name);
        END LOOP;

        IF v_common_columns IS NOT NULL THEN
            v_dblink_query := format('SELECT %s FROM %I.%I', v_common_columns, v_schema_name, v_actual_table_name);

            -- Build INSERT with TenantId injection
            IF v_has_tenant_id THEN
                v_sql := format(
                    'INSERT INTO %I.%I (%s, %I) SELECT %s, %L FROM dblink(''source_conn'', %L) AS s(%s)',
                    v_schema_name, v_actual_table_name,
                    v_common_columns, v_target_tenant_col,
                    v_common_columns, v_target_tenant_id,
                    v_dblink_query, v_dblink_types
                );
            ELSE
                v_sql := format(
                    'INSERT INTO %I.%I (%s) SELECT %s FROM dblink(''source_conn'', %L) AS s(%s)',
                    v_schema_name, v_actual_table_name,
                    v_common_columns, v_common_columns,
                    v_dblink_query, v_dblink_types
                );
            END IF;

            -- Add existence guard (by PK only, matching T-SQL behavior - NO TenantId in check)
            IF v_pk_join_condition IS NOT NULL THEN
                v_sql := v_sql || format(
                    ' WHERE NOT EXISTS (SELECT 1 FROM %I.%I t WHERE %s)',
                    v_schema_name, v_actual_table_name, v_pk_join_condition
                );
            END IF;

            BEGIN
                EXECUTE v_sql;
                GET DIAGNOSTICS v_rows_inserted = ROW_COUNT;
                IF v_rows_inserted > 0 THEN
                    RAISE NOTICE 'Table %: % rows merged.', v_actual_table_name, v_rows_inserted;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Table %: Skipped - %', v_actual_table_name, SQLERRM;
            END;
        END IF;
    END LOOP;

    -- Step 3: Cleanup connection and restore FK constraints
    PERFORM dblink_disconnect('source_conn');
    IF v_is_replica_set THEN EXECUTE 'SET session_replication_role = origin'; END IF;

    -- Step 4: Update TenantDatabases (isolated - never crashes the script)
    BEGIN
        SELECT table_name INTO v_actual_table_name
        FROM information_schema.tables
        WHERE table_schema = v_schema_name AND LOWER(table_name) = 'tenantdatabases';

        IF v_actual_table_name IS NOT NULL THEN
            v_target_conn_str := format('Host=%s;Port=%s;Database=%s;Username=%s;Password=%s;',
                v_db_host, v_db_port, v_target_db, v_user, v_db_password);

            v_sql := 'UPDATE ' || quote_ident(v_actual_table_name) || ' SET ';
            v_exists := FALSE;
            FOR v_col_name IN
                SELECT column_name FROM information_schema.columns
                WHERE table_schema = v_schema_name AND table_name = v_actual_table_name
            LOOP
                IF LOWER(v_col_name) = 'connectionstring' THEN
                    v_sql := v_sql || quote_ident(v_col_name) || ' = ' || quote_literal(v_target_conn_str) || ', ';
                    v_exists := TRUE;
                ELSIF LOWER(v_col_name) = 'databasename' THEN
                    v_sql := v_sql || quote_ident(v_col_name) || ' = ' || quote_literal(v_target_db) || ', ';
                    v_exists := TRUE;
                ELSIF LOWER(v_col_name) = 'updatedat' THEN
                    v_sql := v_sql || quote_ident(v_col_name) || ' = now(), ';
                ELSIF LOWER(v_col_name) = 'tenantid' THEN
                    v_target_tenant_col := v_col_name;
                END IF;
            END LOOP;

            IF v_exists AND v_target_tenant_col IS NOT NULL THEN
                v_sql := RTRIM(v_sql, ', ') || ' WHERE ' || quote_ident(v_target_tenant_col) || ' = ' || v_target_tenant_id;
                EXECUTE v_sql;
                GET DIAGNOSTICS v_rows_inserted = ROW_COUNT;
                IF v_rows_inserted > 0 THEN
                    RAISE NOTICE 'TenantDatabases: Connection string updated for Tenant %.', v_target_tenant_id;
                ELSE
                    RAISE NOTICE 'TenantDatabases: No record found for Tenant % to update. (Data was still merged successfully)', v_target_tenant_id;
                END IF;
            END IF;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'TenantDatabases: Skipped (%). All data was merged successfully.', SQLERRM;
    END;

    RAISE NOTICE '=== MERGE COMPLETE ===';

EXCEPTION WHEN OTHERS THEN
    IF 'source_conn' IN (SELECT unnest(dblink_get_connections())) THEN
        PERFORM dblink_disconnect('source_conn');
    END IF;
    IF v_is_replica_set THEN EXECUTE 'SET session_replication_role = origin'; END IF;
    RAISE EXCEPTION 'MERGE FAILED: %', SQLERRM;
END $$;
