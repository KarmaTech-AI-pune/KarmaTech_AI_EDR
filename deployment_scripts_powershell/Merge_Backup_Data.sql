/*
==============================================================================
DATA MERGE SCRIPT (AUTO-DETECT TARGET DB + UPDATE CONNECTION STRING)
==============================================================================
This script automatically:
1. Detects the current database you're connected to as the target
2. Merges data from a restored backup database to the target database
3. Updates or Inserts into the TenantDatabases table with the new connection string

USAGE:
1. Restore your backup database with a specific name (e.g., 'MyBackup_20260204')
2. Update @SourceDbName below to match your restored database name
3. Update @TenantId to match the tenant you're migrating
4. Connect to your TARGET database in SSMS
5. Run this script - it will automatically detect the target database

NOTE: The script uses Windows Authentication by default. If you use SQL 
Authentication, modify the connection string construction on line ~207.
==============================================================================
*/

DECLARE @SourceDbName NVARCHAR(128) = 'Restore Datbase Name'; -- <== ENSURE THIS MATCHES YOUR RESTORED DB NAME
DECLARE @TargetDbName NVARCHAR(128) = DB_NAME(); -- Automatically detect current database
DECLARE @SchemaName NVARCHAR(128) = 'dbo';
DECLARE @TenantId INT = 1; -- <== SET YOUR TENANT ID HERE

-- Get the server name for connection string update
DECLARE @ServerName NVARCHAR(256) = @@SERVERNAME;

DECLARE @TableName NVARCHAR(128);
DECLARE @FullTableName NVARCHAR(256);
DECLARE @SourceFullTableName NVARCHAR(256);
DECLARE @Sql NVARCHAR(MAX);
DECLARE @CommonColumns NVARCHAR(MAX);
DECLARE @PkJoinCondition NVARCHAR(MAX);
DECLARE @HasIdentity BIT;
DECLARE @HasTenantId BIT;

-- Dynamic SQL Variables
DECLARE @TableExistsSql NVARCHAR(MAX);
DECLARE @Exists INT;
DECLARE @ColSql NVARCHAR(MAX);
DECLARE @InsertCols NVARCHAR(MAX);
DECLARE @SelectCols NVARCHAR(MAX);

-- Check if Source DB exists
IF DB_ID(@SourceDbName) IS NULL
BEGIN
    PRINT 'ERROR: Source database ' + @SourceDbName + ' does not exist. Please restore your backup and update the @SourceDbName variable.';
    RETURN;
END

PRINT 'Starting Data Merge from ' + @SourceDbName + ' to ' + @TargetDbName + ' with TenantId = ' + CAST(@TenantId AS NVARCHAR(20)) + '...';

-- 1. DISABLE FOREIGN KEYS
PRINT 'Disabling Foreign Keys...';
EXEC sp_msforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';

-- 1.5 MERGE PROGRAMS FIRST (To satisfy Foreign Key dependencies in Projects)
PRINT '---------------------------------------------------------';
PRINT 'SPECIAL MERGE: Programs (Priority Table)';
PRINT '---------------------------------------------------------';

SET @TableName = 'Programs';
SET @FullTableName = QUOTENAME(@SchemaName) + '.' + QUOTENAME(@TableName);
SET @SourceFullTableName = QUOTENAME(@SourceDbName) + '.' + QUOTENAME(@SchemaName) + '.' + QUOTENAME(@TableName);

-- Check if table exists in Source DB
SET @Exists = 0;
SET @TableExistsSql = N'SELECT @Exists = 1 FROM ' + QUOTENAME(@SourceDbName) + '.INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ''' + @SchemaName + ''' AND TABLE_NAME = ''' + @TableName + '''';

EXEC sp_executesql @TableExistsSql, N'@Exists INT OUTPUT', @Exists OUTPUT;

IF @Exists = 1
BEGIN
    PRINT 'Processing table: ' + @TableName;

    -- A. GET COMMON COLUMNS (Using XML PATH instead of STRING_AGG for compatibility)
    SET @CommonColumns = NULL;
    SET @ColSql = N'
        SELECT @Cols = STUFF((
            SELECT '', '' + QUOTENAME(c1.COLUMN_NAME)
            FROM INFORMATION_SCHEMA.COLUMNS c1
            INNER JOIN sys.columns sc 
                ON sc.object_id = OBJECT_ID(QUOTENAME(c1.TABLE_SCHEMA) + ''.'' + QUOTENAME(c1.TABLE_NAME)) 
                AND sc.name = c1.COLUMN_NAME
            INNER JOIN ' + QUOTENAME(@SourceDbName) + '.INFORMATION_SCHEMA.COLUMNS c2 
                ON c1.TABLE_NAME = c2.TABLE_NAME 
                AND c1.COLUMN_NAME = c2.COLUMN_NAME
                AND c1.TABLE_SCHEMA = c2.TABLE_SCHEMA
            WHERE c1.TABLE_SCHEMA = ''' + @SchemaName + ''' 
              AND c1.TABLE_NAME = ''' + @TableName + '''
              AND sc.is_computed = 0
              AND c1.COLUMN_NAME != ''TenantId''
            FOR XML PATH(''''), TYPE
        ).value(''.'', ''NVARCHAR(MAX)''), 1, 2, '''')';

    EXEC sp_executesql @ColSql, N'@Cols NVARCHAR(MAX) OUTPUT', @CommonColumns OUTPUT;

    -- B. CHECK FOR TENANT ID COLUMN
    SET @HasTenantId = 0;
    IF EXISTS (
        SELECT 1 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = @SchemaName 
          AND TABLE_NAME = @TableName 
          AND COLUMN_NAME = 'TenantId'
    )
    BEGIN
        SET @HasTenantId = 1;
    END

    -- B. GET PRIMARY KEY JOIN CONDITION
    SET @PkJoinCondition = NULL;
    
    SELECT @PkJoinCondition = STUFF((
        SELECT ' AND T.' + QUOTENAME(kcu.COLUMN_NAME) + ' = S.' + QUOTENAME(kcu.COLUMN_NAME)
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc 
            ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME 
            AND kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
        WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
          AND tc.TABLE_NAME = @TableName
          AND tc.TABLE_SCHEMA = @SchemaName
        FOR XML PATH(''), TYPE
    ).value('.', 'NVARCHAR(MAX)'), 1, 5, '');

    IF @CommonColumns IS NOT NULL
    BEGIN
        IF @PkJoinCondition IS NULL
        BEGIN
            PRINT '  -> SKIPPED: Table ' + @TableName + ' has no Primary Key. Manual merge recommended.';
        END
        ELSE
        BEGIN
            -- Check for Identity Column
            SET @HasIdentity = 0;
            IF EXISTS (
                SELECT 1 
                FROM sys.identity_columns 
                WHERE object_id = OBJECT_ID(@FullTableName)
            )
            BEGIN
                SET @HasIdentity = 1;
            END

            -- Build INSERT SQL
            SET @Sql = '';

            IF @HasIdentity = 1
            BEGIN
                SET @Sql = @Sql + 'SET IDENTITY_INSERT ' + @FullTableName + ' ON; ';
            END

            -- Construct column lists
            SET @InsertCols = @CommonColumns;
            SET @SelectCols = @CommonColumns;

            IF @HasTenantId = 1
            BEGIN
                SET @InsertCols = @InsertCols + ', [TenantId]';
                SET @SelectCols = @SelectCols + ', ' + CAST(@TenantId AS NVARCHAR(20)); -- Inject TenantId value
            END

            SET @Sql = @Sql + 'INSERT INTO ' + @FullTableName + ' (' + @InsertCols + ') ' +
                       'SELECT ' + @SelectCols + ' FROM ' + @SourceFullTableName + ' AS S ' +
                       'WHERE NOT EXISTS (SELECT 1 FROM ' + @FullTableName + ' AS T WHERE ' + @PkJoinCondition + '); ';

            IF @HasIdentity = 1
            BEGIN
                SET @Sql = @Sql + 'SET IDENTITY_INSERT ' + @FullTableName + ' OFF; ';
            END

            -- Execute
            BEGIN TRY
                EXEC sp_executesql @Sql;
                PRINT '  -> Merged successfully.';
            END TRY
            BEGIN CATCH
                PRINT '  -> WARNING/ERROR merging ' + @TableName + ': ' + ERROR_MESSAGE();
            END CATCH
        END
    END
    ELSE
    BEGIN
        PRINT '  -> No common columns found.';
    END
END
ELSE
BEGIN
    PRINT '  -> Skipped (Table not found in Source).';
END
PRINT '---------------------------------------------------------';

-- 2. CURSOR FOR TABLES
DECLARE TableCursor CURSOR FOR
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = @SchemaName AND TABLE_NAME NOT IN ('Programs')
ORDER BY TABLE_NAME;

OPEN TableCursor;
FETCH NEXT FROM TableCursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @FullTableName = QUOTENAME(@SchemaName) + '.' + QUOTENAME(@TableName);
    SET @SourceFullTableName = QUOTENAME(@SourceDbName) + '.' + QUOTENAME(@SchemaName) + '.' + QUOTENAME(@TableName);

    -- Check if table exists in Source DB
    -- Var declarations moved to top
    SET @Exists = 0;
    SET @TableExistsSql = N'SELECT @Exists = 1 FROM ' + QUOTENAME(@SourceDbName) + '.INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ''' + @SchemaName + ''' AND TABLE_NAME = ''' + @TableName + '''';
    
    EXEC sp_executesql @TableExistsSql, N'@Exists INT OUTPUT', @Exists OUTPUT;

    IF @Exists = 1
    BEGIN
        PRINT 'Processing table: ' + @TableName;

        -- A. GET COMMON COLUMNS (Using XML PATH instead of STRING_AGG for compatibility)
        SET @CommonColumns = NULL;
        -- @ColSql declared at top
        SET @ColSql = N'
            SELECT @Cols = STUFF((
                SELECT '', '' + QUOTENAME(c1.COLUMN_NAME)
                FROM INFORMATION_SCHEMA.COLUMNS c1
                INNER JOIN sys.columns sc 
                    ON sc.object_id = OBJECT_ID(QUOTENAME(c1.TABLE_SCHEMA) + ''.'' + QUOTENAME(c1.TABLE_NAME)) 
                    AND sc.name = c1.COLUMN_NAME
                INNER JOIN ' + QUOTENAME(@SourceDbName) + '.INFORMATION_SCHEMA.COLUMNS c2 
                    ON c1.TABLE_NAME = c2.TABLE_NAME 
                    AND c1.COLUMN_NAME = c2.COLUMN_NAME
                    AND c1.TABLE_SCHEMA = c2.TABLE_SCHEMA
                WHERE c1.TABLE_SCHEMA = ''' + @SchemaName + ''' 
                  AND c1.TABLE_NAME = ''' + @TableName + '''
                  AND sc.is_computed = 0
                  AND c1.COLUMN_NAME != ''TenantId''
                FOR XML PATH(''''), TYPE
            ).value(''.'', ''NVARCHAR(MAX)''), 1, 2, '''')';

        EXEC sp_executesql @ColSql, N'@Cols NVARCHAR(MAX) OUTPUT', @CommonColumns OUTPUT;

        -- B. CHECK FOR TENANT ID COLUMN
        SET @HasTenantId = 0;
        IF EXISTS (
            SELECT 1 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = @SchemaName 
              AND TABLE_NAME = @TableName 
              AND COLUMN_NAME = 'TenantId'
        )
        BEGIN
            SET @HasTenantId = 1;
        END

        -- B. GET PRIMARY KEY JOIN CONDITION
        SET @PkJoinCondition = NULL;
        
        -- We need a bit of dynamic SQL here to query the constraint tables properly related to the table at hand
        -- but since we are using INFORMATION_SCHEMA which is current DB relative, and we are running in Target, this is fine.
        SELECT @PkJoinCondition = STUFF((
            SELECT ' AND T.' + QUOTENAME(kcu.COLUMN_NAME) + ' = S.' + QUOTENAME(kcu.COLUMN_NAME)
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
            INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc 
                ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME 
                AND kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
            WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
              AND tc.TABLE_NAME = @TableName
              AND tc.TABLE_SCHEMA = @SchemaName
            FOR XML PATH(''), TYPE
        ).value('.', 'NVARCHAR(MAX)'), 1, 5, '');

        IF @CommonColumns IS NOT NULL
        BEGIN
            IF @PkJoinCondition IS NULL
            BEGIN
                PRINT '  -> SKIPPED: Table ' + @TableName + ' has no Primary Key. Manual merge recommended.';
            END
            ELSE
            BEGIN
                -- Check for Identity Column
                SET @HasIdentity = 0;
                IF EXISTS (
                    SELECT 1 
                    FROM sys.identity_columns 
                    WHERE object_id = OBJECT_ID(@FullTableName)
                )
                BEGIN
                    SET @HasIdentity = 1;
                END

                -- Build INSERT SQL
                SET @Sql = '';

                IF @HasIdentity = 1
                BEGIN
                    SET @Sql = @Sql + 'SET IDENTITY_INSERT ' + @FullTableName + ' ON; ';
                END

                -- Construct column lists
                SET @InsertCols = @CommonColumns;
                SET @SelectCols = @CommonColumns;

                IF @HasTenantId = 1
                BEGIN
                    SET @InsertCols = @InsertCols + ', [TenantId]';
                    SET @SelectCols = @SelectCols + ', ' + CAST(@TenantId AS NVARCHAR(20)); -- Inject TenantId value
                END

                SET @Sql = @Sql + 'INSERT INTO ' + @FullTableName + ' (' + @InsertCols + ') ' +
                           'SELECT ' + @SelectCols + ' FROM ' + @SourceFullTableName + ' AS S ' +
                           'WHERE NOT EXISTS (SELECT 1 FROM ' + @FullTableName + ' AS T WHERE ' + @PkJoinCondition + '); ';

                IF @HasIdentity = 1
                BEGIN
                    SET @Sql = @Sql + 'SET IDENTITY_INSERT ' + @FullTableName + ' OFF; ';
                END

                -- Execute
                BEGIN TRY
                    EXEC sp_executesql @Sql;
                    PRINT '  -> Merged successfully.';
                END TRY
                BEGIN CATCH
                    PRINT '  -> WARNING/ERROR merging ' + @TableName + ': ' + ERROR_MESSAGE();
                END CATCH
            END
        END
        ELSE
        BEGIN
            PRINT '  -> No common columns found.';
        END
    END
    ELSE
    BEGIN
        PRINT '  -> Skipped (Table not found in Source).';
    END

    FETCH NEXT FROM TableCursor INTO @TableName;
END

CLOSE TableCursor;
DEALLOCATE TableCursor;

-- 3. ENABLE FOREIGN KEYS (Using WITH NOCHECK to ignore existing orphans)
PRINT 'Re-enabling Foreign Keys...';
-- We use WITH NOCHECK to re-enable constraints without verifying existing data (which might have orphans now)
EXEC sp_msforeachtable 'ALTER TABLE ? WITH NOCHECK CHECK CONSTRAINT all';

PRINT 'Data Merge Completed.';

-- 4. UPDATE TENANT CONNECTION STRING
PRINT 'Updating Tenant Connection String...';

-- Check if TenantDatabases table exists
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TenantDatabases]') AND type in (N'U'))
BEGIN
    -- Build the new connection string for the target database
    DECLARE @NewConnectionString NVARCHAR(500);
    
    -- Construct connection string (adjust based on your authentication method)
    -- Using Windows Authentication format - modify if using SQL Authentication
    SET @NewConnectionString = 'Server=' + @ServerName + ';Database=' + @TargetDbName + ';Integrated Security=True;TrustServerCertificate=True;';
    
    -- Check if UpdatedAt column exists
    DECLARE @HasUpdatedAt BIT = 0;
    IF EXISTS (
        SELECT 1 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'dbo' 
          AND TABLE_NAME = 'TenantDatabases' 
          AND COLUMN_NAME = 'UpdatedAt'
    )
    BEGIN
        SET @HasUpdatedAt = 1;
    END
    
    -- Build dynamic UPDATE statement based on available columns
    DECLARE @UpdateSql NVARCHAR(MAX);
    SET @UpdateSql = N'UPDATE [dbo].[TenantDatabases] SET [ConnectionString] = @ConnectionString, [DatabaseName] = @DbName';
    
    IF @HasUpdatedAt = 1
    BEGIN
        SET @UpdateSql = @UpdateSql + N', [UpdatedAt] = GETDATE()';
    END
    
    SET @UpdateSql = @UpdateSql + N' WHERE [TenantId] = @TenantIdParam';
    
    -- Execute the dynamic UPDATE
    EXEC sp_executesql @UpdateSql, 
        N'@ConnectionString NVARCHAR(500), @DbName NVARCHAR(128), @TenantIdParam INT',
        @ConnectionString = @NewConnectionString,
        @DbName = @TargetDbName,
        @TenantIdParam = @TenantId;
    
    IF @@ROWCOUNT > 0
    BEGIN
        PRINT '  -> Connection string updated successfully for TenantId: ' + CAST(@TenantId AS NVARCHAR(20));
        PRINT '  -> New Database: ' + @TargetDbName;
        PRINT '  -> New Connection String: ' + @NewConnectionString;
    END
    ELSE
    BEGIN
        -- INSERT logic for missing tenant
        PRINT '  -> TenantId ' + CAST(@TenantId AS NVARCHAR(20)) + ' not found. Inserting new record...';
        
        DECLARE @InsertSql NVARCHAR(MAX);
        SET @InsertSql = N'INSERT INTO [dbo].[TenantDatabases] ([TenantId], [DatabaseName], [ConnectionString], [Status], [CreatedAt], [UpdatedAt]) 
                           VALUES (@TenantIdParam, @DbName, @ConnectionString, 0, GETDATE(), GETDATE())';
                           
        EXEC sp_executesql @InsertSql,
            N'@TenantIdParam INT, @DbName NVARCHAR(128), @ConnectionString NVARCHAR(500)',
            @TenantIdParam = @TenantId,
            @DbName = @TargetDbName,
            @ConnectionString = @NewConnectionString;
            
        PRINT '  -> New TenantDatabase record inserted successfully.';
        PRINT '  -> New Database: ' + @TargetDbName;
        PRINT '  -> New Connection String: ' + @NewConnectionString;
    END
END
ELSE
BEGIN
    PRINT '  -> TenantDatabases table not found. Skipping connection string update.';
END

PRINT '';
PRINT '==============================================================================';
PRINT 'MERGE PROCESS COMPLETED SUCCESSFULLY';
PRINT '==============================================================================';
PRINT 'Summary:';
PRINT '  - Source Database: ' + @SourceDbName;
PRINT '  - Target Database: ' + @TargetDbName;
PRINT '  - Tenant ID: ' + CAST(@TenantId AS NVARCHAR(20));
PRINT '  - Server: ' + @ServerName;
PRINT '==============================================================================';
PRINT '';
PRINT 'IMPORTANT: Please verify the following:';
PRINT '1. Check that all data was merged correctly';
PRINT '2. Verify foreign key constraints are working';
PRINT '3. Test your application with the new database';
PRINT '4. If using SQL Authentication, update the connection string manually';
PRINT '==============================================================================';
