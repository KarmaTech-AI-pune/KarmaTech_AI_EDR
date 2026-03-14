/*
==============================================================================
POSTGRESQL DATA MERGE SCRIPT (FULL DYNAMIC MERGE)
==============================================================================
This script merges ALL data from a backup database into this target database.
It FORCES all rows to the Tenant ID you specify below.

FEATURES:
- Bypasses Foreign Key checks (if permissions allow)
- Injects Target TenantId into all merged rows
- Tenant-Specific deduplication (it won't skip rows if they belong to other tenants)
- Dynamically handles missing columns in TenantDatabases
- Case-resilient (handles PascalCase/lower case automatically)
==============================================================================
*/

-- Enable dblink extension
CREATE EXTENSION IF NOT EXISTS dblink;

DO $$
DECLARE
    -- <== SET YOUR SETTINGS HERE ==>
    v_source_db TEXT := 'KarmaTechAI_EDR_SAAS'; 
    v_target_tenant_id INT := 3; -- <== DATA WILL BE SAVED AS THIS TENANT ID
    
    v_source_user TEXT := 'postgres'; 
    v_source_pass TEXT := 'admin@123'; 
    v_source_host TEXT := 'localhost';
    v_source_port TEXT := '5432';
    -- <========================>

    v_target_db TEXT := current_database();
    v_schema_name TEXT := 'public';
    v_table_record RECORD;
    v_common_columns TEXT;
    v_pk_join_condition TEXT;
    v_sql TEXT;
    v_conn_str TEXT;
    v_exists BOOLEAN;
    v_has_tenant_id_target BOOLEAN;
    v_has_tenant_id_source BOOLEAN;
    v_target_tenant_col TEXT;
    v_source_tenant_col TEXT;
    v_actual_table_name TEXT;
    v_is_replica_set BOOLEAN := FALSE;
    v_rows_inserted INT;
    v_pk_col_record RECORD;
    v_dblink_query TEXT;
    v_dblink_types TEXT;
    v_target_conn_str TEXT;

    -- TenantDatabases columns
    v_td_cols TEXT[] := ARRAY['tenantid', 'connectionstring', 'databasename', 'status', 'createdat', 'updatedat'];
    v_td_found_cols TEXT[] := ARRAY[]::TEXT[];
    v_col_name TEXT;
BEGIN
    RAISE NOTICE 'Starting DYNAMIC MERGE from % to %...', v_source_db, v_target_db;
    RAISE NOTICE 'Target: Tenant ID %', v_target_tenant_id;

    -- 0. Bypass FK checks
    BEGIN
        SET session_replication_role = 'replica';
        v_is_replica_set := TRUE;
        RAISE NOTICE 'Status: Bypassing constraints.';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Status: Constraints enabled (standard user).';
    END;

    -- 1. Connect
    v_conn_str := format('dbname=%s user=%s password=%s host=%s port=%s', v_source_db, v_source_user, v_source_pass, v_source_host, v_source_port);
    PERFORM dblink_connect('source_conn', v_conn_str);

    -- 2. Process Tables
    FOR v_table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = v_schema_name AND table_type = 'BASE TABLE' 
          AND LOWER(table_name) NOT IN ('tenantdatabases', 'spatial_ref_sys', '__efmigrationshistory') 
        ORDER BY 
            CASE 
                WHEN LOWER(table_name) = 'tenants' THEN 0 
                WHEN LOWER(table_name) = 'subscriptionplans' THEN 1
                WHEN LOWER(table_name) = 'aspnetroles' THEN 2
                WHEN LOWER(table_name) = 'aspnetusers' THEN 3
                ELSE 10 
            END, table_name
    LOOP
        v_actual_table_name := v_table_record.table_name;

        -- Column Check
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = v_schema_name AND table_name = v_actual_table_name AND LOWER(column_name) = 'tenantid'
        INTO v_target_tenant_col;
        v_has_tenant_id_target := (v_target_tenant_col IS NOT NULL);

        SELECT col_name FROM dblink('source_conn', 
            format('SELECT column_name FROM information_schema.columns WHERE table_schema = %L AND table_name = %L AND LOWER(column_name) = %L', 
            v_schema_name, v_actual_table_name, 'tenantid')) 
            AS t(col_name TEXT) INTO v_source_tenant_col;
        v_has_tenant_id_source := (v_source_tenant_col IS NOT NULL);

        -- Build columns list (excluding tenantid if merging into target tenant)
        SELECT string_agg(quote_ident(t.column_name), ', '), 
               string_agg(quote_ident(t.column_name) || ' ' || t.data_type, ', ')
        FROM information_schema.columns t
        INNER JOIN dblink('source_conn', format('SELECT column_name FROM information_schema.columns WHERE table_schema = %L AND table_name = %L', v_schema_name, v_actual_table_name)) 
        AS s(column_name TEXT) ON LOWER(t.column_name) = LOWER(s.column_name)
        WHERE t.table_schema = v_schema_name AND t.table_name = v_actual_table_name
          AND (NOT v_has_tenant_id_target OR LOWER(t.column_name) != 'tenantid')
        INTO v_common_columns, v_dblink_types;

        -- Build PK Condition (CRITICAL: Must include TenantId check if it exists in target)
        v_pk_join_condition := NULL;
        FOR v_pk_col_record IN 
            SELECT kcu.column_name FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = v_actual_table_name AND tc.table_schema = v_schema_name
        LOOP
            IF v_pk_join_condition IS NOT NULL THEN v_pk_join_condition := v_pk_join_condition || ' AND '; END IF;
            IF LOWER(v_pk_col_record.column_name) = 'tenantid' THEN
                v_pk_join_condition := v_pk_join_condition || format('t.%I = %L', v_pk_col_record.column_name, v_target_tenant_id);
            ELSE
                v_pk_join_condition := v_pk_join_condition || format('t.%I = s.%I', v_pk_col_record.column_name, v_pk_col_record.column_name);
            END IF;
        END LOOP;

        -- If table has TenantId but it's NOT in the PK, we MUST manually add it to the check
        IF v_has_tenant_id_target AND (v_pk_join_condition IS NULL OR v_pk_join_condition NOT LIKE '%tenantid%') THEN
             IF v_pk_join_condition IS NOT NULL THEN v_pk_join_condition := v_pk_join_condition || ' AND '; END IF;
             v_pk_join_condition := COALESCE(v_pk_join_condition, '') || format('t.%I = %L', v_target_tenant_col, v_target_tenant_id);
        END IF;

        IF v_common_columns IS NOT NULL THEN
            v_dblink_query := format('SELECT %s FROM %I.%I', v_common_columns, v_schema_name, v_actual_table_name);
            
            -- Prepare Insert
            IF v_has_tenant_id_target THEN
                v_sql := format('INSERT INTO %I.%I (%s, %I) SELECT %s, %L FROM dblink(''source_conn'', %L) AS s(%s)',
                    v_schema_name, v_actual_table_name, v_common_columns, v_target_tenant_col, v_common_columns, v_target_tenant_id, v_dblink_query, v_dblink_types);
            ELSE
                v_sql := format('INSERT INTO %I.%I (%s) SELECT %s FROM dblink(''source_conn'', %L) AS s(%s)',
                    v_schema_name, v_actual_table_name, v_common_columns, v_common_columns, v_dblink_query, v_dblink_types);
            END IF;

            -- Add Existence Guard (only if we have components to check)
            IF v_pk_join_condition IS NOT NULL THEN
                v_sql := v_sql || format(' WHERE NOT EXISTS (SELECT 1 FROM %I.%I t WHERE %s)', v_schema_name, v_actual_table_name, v_pk_join_condition);
            END IF;

            BEGIN
                EXECUTE v_sql;
                GET DIAGNOSTICS v_rows_inserted = ROW_COUNT;
                IF v_rows_inserted > 0 THEN RAISE NOTICE 'Table %: % rows merged.', v_actual_table_name, v_rows_inserted; END IF;
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Table %: Error - %', v_actual_table_name, SQLERRM;
            END;
        END IF;
    END LOOP;

    -- 3. Cleanup
    PERFORM dblink_disconnect('source_conn');
    IF v_is_replica_set THEN EXECUTE 'SET session_replication_role = origin'; END IF;

    -- 4. Update TenantDatabases
    SELECT table_name FROM information_schema.tables WHERE table_schema = v_schema_name AND LOWER(table_name) = 'tenantdatabases' INTO v_actual_table_name;
    IF v_actual_table_name IS NOT NULL THEN
        v_target_conn_str := format('Host=%s;Port=%s;Database=%s;Username=%s;Password=%s;', v_source_host, v_source_port, v_target_db, v_source_user, v_source_pass);
        
        -- Map columns dynamically
        v_sql := 'UPDATE ' || quote_ident(v_actual_table_name) || ' SET ';
        v_exists := FALSE;
        FOR v_col_name IN SELECT column_name FROM information_schema.columns WHERE table_schema = v_schema_name AND table_name = v_actual_table_name
        LOOP
            IF LOWER(v_col_name) = 'connectionstring' THEN v_sql := v_sql || quote_ident(v_col_name) || ' = ' || quote_literal(v_target_conn_str) || ', '; v_exists := TRUE;
            ELSIF LOWER(v_col_name) = 'databasename' THEN v_sql := v_sql || quote_ident(v_col_name) || ' = ' || quote_literal(v_target_db) || ', '; v_exists := TRUE;
            ELSIF LOWER(v_col_name) = 'updatedat' THEN v_sql := v_sql || quote_ident(v_col_name) || ' = now(), ';
            ELSIF LOWER(v_col_name) = 'tenantid' THEN v_target_tenant_col := v_col_name;
            END IF;
        END LOOP;

        IF v_exists AND v_target_tenant_col IS NOT NULL THEN
            v_sql := RTRIM(v_sql, ', ') || ' WHERE ' || quote_ident(v_target_tenant_col) || ' = ' || v_target_tenant_id;
            EXECUTE v_sql;
            GET DIAGNOSTICS v_rows_inserted = ROW_COUNT;
            
            IF v_rows_inserted = 0 THEN
                RAISE NOTICE 'TenantDatabases: Record not found. Creating new one...';
                -- Try to build a basic insert
                v_sql := 'INSERT INTO ' || quote_ident(v_actual_table_name) || ' (' || quote_ident(v_target_tenant_col);
                FOR v_col_name IN SELECT column_name FROM information_schema.columns WHERE table_schema = v_schema_name AND table_name = v_actual_table_name
                LOOP
                    IF LOWER(v_col_name) IN ('connectionstring', 'databasename', 'status', 'createdat', 'updatedat') THEN
                        v_sql := v_sql || ', ' || quote_ident(v_col_name);
                    END IF;
                END LOOP;
                v_sql := v_sql || ') VALUES (' || v_target_tenant_id;
                FOR v_col_name IN SELECT column_name FROM information_schema.columns WHERE table_schema = v_schema_name AND table_name = v_actual_table_name
                LOOP
                    IF LOWER(v_col_name) = 'connectionstring' THEN v_sql := v_sql || ', ' || quote_literal(v_target_conn_str);
                    ELSIF LOWER(v_col_name) = 'databasename' THEN v_sql := v_sql || ', ' || quote_literal(v_target_db);
                    ELSIF LOWER(v_col_name) = 'status' THEN v_sql := v_sql || ', 0';
                    ELSIF LOWER(v_col_name) IN ('createdat', 'updatedat') THEN v_sql := v_sql || ', now()';
                    END IF;
                END LOOP;
                v_sql := v_sql || ')';
                EXECUTE v_sql;
            END IF;
            RAISE NOTICE 'TenantDatabases: Connection details updated for Tenant %.', v_target_tenant_id;
        END IF;
    END IF;

    RAISE NOTICE 'DONE: Merge process complete.';
EXCEPTION WHEN OTHERS THEN
    BEGIN PERFORM dblink_disconnect('source_conn'); EXCEPTION WHEN OTHERS THEN NULL; END;
    IF v_is_replica_set THEN EXECUTE 'SET session_replication_role = origin'; END IF;
    RAISE EXCEPTION 'Fatal Error: %', SQLERRM;
END $$;
