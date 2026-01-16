/*
==============================================================================
DATA MERGE SCRIPT (FINAL FIX: DYNAMIC PK + NOCHECK CONSTRAINTS)
==============================================================================
*/

DECLARE @SourceDbName NVARCHAR(128) = 'Restore Datbase Name'; -- <== ENSURE THIS MATCHES YOUR RESTORED DB NAME
DECLARE @TargetDbName NVARCHAR(128) = 'Target Database Name';
DECLARE @SchemaName NVARCHAR(128) = 'dbo';

DECLARE @TableName NVARCHAR(128);
DECLARE @FullTableName NVARCHAR(256);
DECLARE @SourceFullTableName NVARCHAR(256);
DECLARE @Sql NVARCHAR(MAX);
DECLARE @CommonColumns NVARCHAR(MAX);
DECLARE @PkJoinCondition NVARCHAR(MAX);
DECLARE @HasIdentity BIT;

-- Check if Source DB exists
IF DB_ID(@SourceDbName) IS NULL
BEGIN
    PRINT 'ERROR: Source database ' + @SourceDbName + ' does not exist. Please restore your backup and update the @SourceDbName variable.';
    RETURN;
END

PRINT 'Starting Data Merge from ' + @SourceDbName + ' to ' + @TargetDbName + '...';

-- 1. DISABLE FOREIGN KEYS
PRINT 'Disabling Foreign Keys...';
EXEC sp_msforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';

-- 2. CURSOR FOR TABLES
DECLARE TableCursor CURSOR FOR
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = @SchemaName
ORDER BY TABLE_NAME;

OPEN TableCursor;
FETCH NEXT FROM TableCursor INTO @TableName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @FullTableName = QUOTENAME(@SchemaName) + '.' + QUOTENAME(@TableName);
    SET @SourceFullTableName = QUOTENAME(@SourceDbName) + '.' + QUOTENAME(@SchemaName) + '.' + QUOTENAME(@TableName);

    -- Check if table exists in Source DB
    DECLARE @TableExistsSql NVARCHAR(MAX);
    DECLARE @Exists INT = 0;
    SET @TableExistsSql = N'SELECT @Exists = 1 FROM ' + QUOTENAME(@SourceDbName) + '.INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ''' + @SchemaName + ''' AND TABLE_NAME = ''' + @TableName + '''';
    
    EXEC sp_executesql @TableExistsSql, N'@Exists INT OUTPUT', @Exists OUTPUT;

    IF @Exists = 1
    BEGIN
        PRINT 'Processing table: ' + @TableName;

        -- A. GET COMMON COLUMNS (Filtering out computed columns)
        SET @CommonColumns = NULL;
        DECLARE @ColSql NVARCHAR(MAX);
        SET @ColSql = N'
            SELECT @Cols = STRING_AGG(QUOTENAME(c1.COLUMN_NAME), '', '')
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
              AND sc.is_computed = 0';

        EXEC sp_executesql @ColSql, N'@Cols NVARCHAR(MAX) OUTPUT', @CommonColumns OUTPUT;

        -- B. GET PRIMARY KEY JOIN CONDITION
        SET @PkJoinCondition = NULL;
        SELECT @PkJoinCondition = STRING_AGG('T.' + QUOTENAME(kcu.COLUMN_NAME) + ' = S.' + QUOTENAME(kcu.COLUMN_NAME), ' AND ')
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc 
            ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME 
            AND kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
        WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
          AND tc.TABLE_NAME = @TableName
          AND tc.TABLE_SCHEMA = @SchemaName;

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

                SET @Sql = @Sql + 'INSERT INTO ' + @FullTableName + ' (' + @CommonColumns + ') ' +
                           'SELECT ' + @CommonColumns + ' FROM ' + @SourceFullTableName + ' AS S ' +
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