-- =====================================================
-- Complete Project Data Deletion Script for PostgreSQL
-- =====================================================
-- WARNING: This script will delete data from tables.
-- Make sure to backup your database before running this script
-- =====================================================

DO $$
DECLARE
    -- Optional ProjectId parameter
    -- Set to a specific ProjectId to delete only that project's data, or NULL to delete ALL data
    v_project_id INT := 1; -- Replace 1 with your actual project ID, or use NULL for everything
    
    v_table_record RECORD;
    v_sql TEXT;
    v_col_name TEXT;
    v_id_col_name TEXT;
    v_row_count INT;
BEGIN
    RAISE NOTICE 'Starting script...';

    -- ==================================================
    -- DISABLE FOREIGN KEY CONSTRAINTS
    -- ==================================================
    -- Temporarily disable foreign key triggers (Requires superuser privileges for this command)
    SET session_replication_role = 'replica';

    -- ==================================================
    -- DELETE DATA FROM ALL TABLES
    -- ==================================================
    RAISE NOTICE 'Starting data deletion from all tables...';

    FOR v_table_record IN 
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_type = 'BASE TABLE' 
          AND table_schema NOT IN ('pg_catalog', 'information_schema')
    LOOP
        IF v_project_id IS NOT NULL THEN
            -- Check if it's the main project table
            IF v_table_record.table_name ILIKE 'projects' THEN
                -- Find exact column name for 'Id'
                SELECT column_name INTO v_id_col_name 
                FROM information_schema.columns 
                WHERE table_schema = v_table_record.table_schema 
                  AND table_name = v_table_record.table_name 
                  AND column_name ILIKE 'id' LIMIT 1;

                IF v_id_col_name IS NOT NULL THEN
                    v_sql := format('DELETE FROM %I.%I WHERE %I = $1', v_table_record.table_schema, v_table_record.table_name, v_id_col_name);
                    RAISE NOTICE 'Executing: %', v_sql;
                    EXECUTE v_sql USING v_project_id;
                END IF;
            ELSE
                -- Check if table has a ProjectId column
                SELECT column_name INTO v_col_name 
                FROM information_schema.columns 
                WHERE table_schema = v_table_record.table_schema 
                  AND table_name = v_table_record.table_name 
                  AND column_name ILIKE 'projectid' LIMIT 1;

                IF v_col_name IS NOT NULL THEN
                    v_sql := format('DELETE FROM %I.%I WHERE %I = $1', v_table_record.table_schema, v_table_record.table_name, v_col_name);
                    RAISE NOTICE 'Executing: %', v_sql;
                    EXECUTE v_sql USING v_project_id;
                END IF;
            END IF;
        ELSE
            -- Delete all data
            v_sql := format('DELETE FROM %I.%I', v_table_record.table_schema, v_table_record.table_name);
            RAISE NOTICE 'Executing: %', v_sql;
            EXECUTE v_sql;
        END IF;
    END LOOP;

    -- ==================================================
    -- RESET IDENTITY COLUMNS / SEQUENCES
    -- ==================================================
    IF v_project_id IS NULL THEN
        RAISE NOTICE 'Resetting identity columns...';
        FOR v_table_record IN 
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_type = 'BASE TABLE' 
              AND table_schema NOT IN ('pg_catalog', 'information_schema')
        LOOP
            -- For PostgreSQL 10+ identity columns:
            SELECT column_name INTO v_col_name
            FROM information_schema.columns
            WHERE table_schema = v_table_record.table_schema 
              AND table_name = v_table_record.table_name
              AND is_identity = 'YES' LIMIT 1;
              
            IF v_col_name IS NOT NULL THEN
                v_sql := format('ALTER TABLE %I.%I ALTER COLUMN %I RESTART WITH 1', 
                                v_table_record.table_schema, 
                                v_table_record.table_name, 
                                v_col_name);
                EXECUTE v_sql;
                RAISE NOTICE 'Identity reset for %.%', v_table_record.table_schema, v_table_record.table_name;
            END IF;
        END LOOP;
    END IF;

    -- ==================================================
    -- RE-ENABLE FOREIGN KEY CONSTRAINTS
    -- ==================================================
    RAISE NOTICE 'Re-enabling foreign key constraints...';
    SET session_replication_role = 'origin';

    RAISE NOTICE 'All requested project data has been successfully deleted!';

EXCEPTION WHEN OTHERS THEN
    -- This block catches the exact error instead of completely failing silently
    RAISE NOTICE 'FAILED ON SQL: %', v_sql;
    RAISE NOTICE 'ERROR MESSAGE: %', SQLERRM;
    RAISE NOTICE 'ERROR STATE: %', SQLSTATE;
    
    -- Attempt to fallback role
    SET session_replication_role = 'origin';
    RAISE EXCEPTION 'Rolled back due to error.';
END $$;
