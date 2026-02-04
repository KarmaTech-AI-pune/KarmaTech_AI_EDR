-- =====================================================
-- Complete Project Data Deletion Script for SSMS
-- =====================================================
-- WARNING: This script will delete ALL data from ALL tables
-- Make sure to backup your database before running this script
-- =====================================================

-- Optional ProjectId parameter
DECLARE @ProjectId INT = NULL; -- Set to a specific ProjectId to delete only that project's data

BEGIN TRANSACTION DeleteAllProjectData

BEGIN TRY
    -- Disable all foreign key constraints temporarily
    PRINT 'Disabling foreign key constraints...'
    
    -- Generate and execute commands to disable all FK constraints
    DECLARE @sql NVARCHAR(MAX) = ''
    SELECT @sql = @sql + 'ALTER TABLE [' + SCHEMA_NAME(schema_id) + '].[' + OBJECT_NAME(parent_object_id) + '] NOCHECK CONSTRAINT [' + name + '];' + CHAR(13)
    FROM sys.foreign_keys
    
    EXEC sp_executesql @sql
    PRINT 'Foreign key constraints disabled.'

    -- ==================================================
    -- DELETE DATA FROM ALL TABLES
    -- ==================================================
    PRINT 'Starting data deletion from all tables...'

    -- Method 1: Delete from all user tables (recommended)
    DECLARE @tableName NVARCHAR(128)
    DECLARE @schemaName NVARCHAR(128)
    DECLARE @deleteSQL NVARCHAR(MAX)
    
    DECLARE table_cursor CURSOR FOR
    SELECT TABLE_SCHEMA, TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
    AND TABLE_SCHEMA NOT IN ('sys', 'information_schema', 'guest')
    ORDER BY TABLE_NAME

    OPEN table_cursor
    FETCH NEXT FROM table_cursor INTO @schemaName, @tableName

    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF @ProjectId IS NOT NULL
        BEGIN
            -- Handle the main project table (assuming it's named 'Projects')
            IF @tableName = 'Projects'
            BEGIN
                SET @deleteSQL = 'DELETE FROM [' + @schemaName + '].[' + @tableName + '] WHERE Id = @ProjectId';
                PRINT 'Deleting from table: ' + @schemaName + '.' + @tableName + ' with Id = @ProjectId'
            END
            -- Handle related tables with a ProjectId foreign key
            ELSE IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'ProjectId' AND Object_ID = Object_ID(@schemaName + '.' + @tableName))
            BEGIN
                SET @deleteSQL = 'DELETE FROM [' + @schemaName + '].[' + @tableName + '] WHERE ProjectId = @ProjectId';
                PRINT 'Deleting from table: ' + @schemaName + '.' + @tableName + ' with ProjectId = @ProjectId'
            END
			ELSE
			BEGIN
				PRINT 'Skipping table: ' + @schemaName + '.' + @tableName + ' because it does not have an Id or ProjectId column'
				
				FETCH NEXT FROM table_cursor INTO @schemaName, @tableName
				CONTINUE -- Skip to the next table
			END
        END
        ELSE
        BEGIN
            -- Original logic to delete all data if no ProjectId is specified
            SET @deleteSQL = 'DELETE FROM [' + @schemaName + '].[' + @tableName + ']';
            PRINT 'Deleting from table: ' + @schemaName + '.' + @tableName
        END
        
        BEGIN TRY
            EXEC sp_executesql @deleteSQL, N'@ProjectId INT', @ProjectId = @ProjectId;
            PRINT 'Successfully deleted from: ' + @schemaName + '.' + @tableName
        END TRY
        BEGIN CATCH
            PRINT 'Error deleting from ' + @schemaName + '.' + @tableName + ': ' + ERROR_MESSAGE()
        END CATCH
        
        FETCH NEXT FROM table_cursor INTO @schemaName, @tableName
    END

    CLOSE table_cursor
    DEALLOCATE table_cursor

    -- ==================================================
    -- RESET IDENTITY COLUMNS
    -- ==================================================
    PRINT 'Resetting identity columns...'
    
    IF @ProjectId IS NULL  -- Only reset identity columns if deleting all data
    BEGIN
        DECLARE @reseedSQL NVARCHAR(MAX) = ''
        SELECT @reseedSQL = @reseedSQL + 'DBCC CHECKIDENT(''' + SCHEMA_NAME(t.schema_id) + '.' + t.name + ''', RESEED, 0);' + CHAR(13)
        FROM sys.tables t
        INNER JOIN sys.columns c ON t.object_id = c.object_id
        WHERE c.is_identity = 1

        IF LEN(@reseedSQL) > 0
        BEGIN
            EXEC sp_executesql @reseedSQL
            PRINT 'Identity columns reset.'
        END
    END

    -- ==================================================
    -- RE-ENABLE FOREIGN KEY CONSTRAINTS
    -- ==================================================
    PRINT 'Re-enabling foreign key constraints...'
    
    SET @sql = ''
    SELECT @sql = @sql + 'ALTER TABLE [' + SCHEMA_NAME(schema_id) + '].[' + OBJECT_NAME(parent_object_id) + '] CHECK CONSTRAINT [' + name + '];' + CHAR(13)
    FROM sys.foreign_keys
    
    EXEC sp_executesql @sql
    PRINT 'Foreign key constraints re-enabled.'

    -- ==================================================
    -- VERIFY DELETION
    -- ==================================================
    PRINT 'Verification - Row counts after deletion:'
    
    DECLARE verify_cursor CURSOR FOR
    SELECT TABLE_SCHEMA, TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_TYPE = 'BASE TABLE'
    AND TABLE_SCHEMA NOT IN ('sys', 'information_schema', 'guest')
    ORDER BY TABLE_NAME

    OPEN verify_cursor
    FETCH NEXT FROM verify_cursor INTO @schemaName, @tableName

    WHILE @@FETCH_STATUS = 0
    BEGIN
        DECLARE @countSQL NVARCHAR(MAX)
        DECLARE @rowCount INT
        
        SET @countSQL = 'SELECT @count = COUNT(*) FROM [' + @schemaName + '].[' + @tableName + ']'
        EXEC sp_executesql @countSQL, N'@count INT OUTPUT', @count = @rowCount OUTPUT
        
        PRINT @schemaName + '.' + @tableName + ': ' + CAST(@rowCount AS VARCHAR(10)) + ' rows'
        
        FETCH NEXT FROM verify_cursor INTO @schemaName, @tableName
    END

    CLOSE verify_cursor
    DEALLOCATE verify_cursor

    PRINT 'All project data has been successfully deleted!'
    
    -- Commit the transaction
    COMMIT TRANSACTION DeleteAllProjectData
    PRINT 'Transaction committed successfully.'

END TRY
BEGIN CATCH
    -- Rollback in case of error
    ROLLBACK TRANSACTION DeleteAllProjectData
    
    PRINT 'Error occurred during deletion:'
    PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR(10))
    PRINT 'Error Message: ' + ERROR_MESSAGE()
    PRINT 'Transaction has been rolled back.'
    
    -- Try to re-enable constraints even if there was an error
    DECLARE @recoverSQL NVARCHAR(MAX) = ''
    SELECT @recoverSQL = @recoverSQL + 'ALTER TABLE [' + SCHEMA_NAME(schema_id) + '].[' + OBJECT_NAME(parent_object_id) + '] CHECK CONSTRAINT [' + name + '];' + CHAR(13)
    FROM sys.foreign_keys
    
    IF LEN(@recoverSQL) > 0
    BEGIN
        EXEC sp_executesql @recoverSQL
        PRINT 'Foreign key constraints re-enabled after error.'
    END
END CATCH

-- =====================================================
-- ALTERNATIVE METHOD: Truncate tables (faster but more restrictive)
-- =====================================================
/*
-- Uncomment this section if you prefer to use TRUNCATE instead of DELETE
-- TRUNCATE is faster but requires handling foreign keys more carefully

BEGIN TRANSACTION TruncateAllTables

BEGIN TRY
    PRINT 'Starting TRUNCATE operation...'
    
    -- First disable all constraints
    EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"
    
    -- Truncate all tables
    EXEC sp_MSforeachtable "TRUNCATE TABLE ?"
    
    -- Re-enable all constraints
    EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"
    
    PRINT 'All tables truncated successfully!'
    COMMIT TRANSACTION TruncateAllTables
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION TruncateAllTables
    PRINT 'Error during truncate: ' + ERROR_MESSAGE()
    
    -- Re-enable constraints
    EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"
END CATCH
*/

PRINT 'Script execution completed.'
