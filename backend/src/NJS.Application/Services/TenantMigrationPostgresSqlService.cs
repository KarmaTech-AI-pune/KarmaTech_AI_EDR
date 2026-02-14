using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NJS.Application.Services.IContract;
using System.Text;
using System.Text.RegularExpressions;
using Npgsql;

namespace NJS.Application.Services
{
    public class TenantMigrationPostgresSqlService : ITenantMigrationService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<TenantMigrationPostgresSqlService> _logger;
        private readonly string _migrationScriptsPath;
        private readonly string _nonIsolatedTenetScriptPath;

        public TenantMigrationPostgresSqlService(IConfiguration configuration, ILogger<TenantMigrationPostgresSqlService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            // Try multiple paths to find the migration scripts directory
            var possiblePaths = new[]
            {
                // Path from current directory (when running from backend folder)
                Path.Combine(Directory.GetCurrentDirectory(), "MigrationSQL", "IsolatedSQL"),
                // Path from application base directory
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "MigrationSQL",
                    "IsolatedSQL"),
                // Path relative to solution root
                Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "MigrationSQL", "IsolatedSQL"),
                // Absolute path from current directory going up
                Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "MigrationSQL",
                    "IsolatedSQL"))
            };

            _migrationScriptsPath = possiblePaths.FirstOrDefault(Directory.Exists) ?? possiblePaths[0];

            if (!Directory.Exists(_migrationScriptsPath))
            {
                _logger.LogWarning("Migration scripts directory not found. Tried paths: {Paths}",
                    string.Join(", ", possiblePaths));
            }
            else
            {
                _logger.LogInformation("Using migration scripts path: {Path}", _migrationScriptsPath);
            }

            var norIsolatedPossiblePaths = new[]
            {
                // Path from current directory (when running from backend folder)
                Path.Combine(Directory.GetCurrentDirectory(), "MigrationSQL", "NonIsolatedSQL"),
                // Path from application base directory
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "MigrationSQL",
                    "NonIsolatedSQL"),
                // Path relative to solution root
                Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "MigrationSQL", "NonIsolatedSQL"),
                // Absolute path from current directory going up
                Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "MigrationSQL",
                    "NonIsolatedSQL"))
            };

            _nonIsolatedTenetScriptPath = norIsolatedPossiblePaths.FirstOrDefault(Directory.Exists) ??
                                          norIsolatedPossiblePaths[0];

            if (!Directory.Exists(_nonIsolatedTenetScriptPath))
            {
                _logger.LogWarning("Migration scripts directory not found. Tried paths: {Paths}",
                    string.Join(", ", norIsolatedPossiblePaths));
            }
            else
            {
                _logger.LogInformation("Using migration scripts path: {Path}", _nonIsolatedTenetScriptPath);
            }
        }

        public async Task<bool> ExecuteTenantMigrationsAsyncSQL(string connectionString, int tenantId,
            string? sourceDatabaseName = null)
        {
            try
            {
                if (!Directory.Exists(_migrationScriptsPath))
                {
                    _logger.LogError("Migration scripts directory not found: {Path}", _migrationScriptsPath);
                    return false;
                }

                // Extract database name from connection string
                var builder = new SqlConnectionStringBuilder(connectionString);
                var targetDatabaseName = builder.InitialCatalog;

                // If source database/server not provided, use the default from configuration
                if (string.IsNullOrEmpty(sourceDatabaseName))
                {
                    var defaultConnectionString = _configuration.GetConnectionString("AppDbConnection");
                    if (!string.IsNullOrEmpty(defaultConnectionString))
                    {
                        var defaultBuilder = new SqlConnectionStringBuilder(defaultConnectionString);
                        sourceDatabaseName = defaultBuilder.InitialCatalog;
                    }
                }

                // Define the order of migration scripts
                var migrationScripts = new[]
                {
                    "01_Permissions.sql",
                    "04_PMWorkFlow.Sql",
                    "05_OpportunityStatuses.Sql"
                };

                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                foreach (var scriptFileName in migrationScripts)
                {
                    var scriptPath = Path.Combine(_migrationScriptsPath, scriptFileName);

                    if (!File.Exists(scriptPath))
                    {
                        _logger.LogWarning("Migration script not found: {ScriptPath}, skipping...", scriptPath);
                        continue;
                    }

                    _logger.LogInformation("Executing migration script: {ScriptName}", scriptFileName);

                    var scriptContent = await File.ReadAllTextAsync(scriptPath, Encoding.UTF8);

                    // Replace placeholders in the script
                    scriptContent = ReplacePlaceholders(scriptContent, tenantId, targetDatabaseName, sourceDatabaseName,
                        null, null, null);

                    // Split script into batches (by GO statements)
                    var batches = SplitScriptIntoBatches(scriptContent);

                    foreach (var batch in batches)
                    {
                        if (string.IsNullOrWhiteSpace(batch))
                            continue;

                        try
                        {
                            using var command = new SqlCommand(batch, connection);
                            command.CommandTimeout = 300; // 5 minutes timeout for migrations
                            await command.ExecuteNonQueryAsync();

                            _logger.LogDebug("Successfully executed batch from {ScriptName}", scriptFileName);
                        }
                        catch (SqlException ex)
                        {
                            // Log error but continue with next batch
                            _logger.LogError(ex, "Error executing batch from {ScriptName}: {ErrorMessage}",
                                scriptFileName, ex.Message);

                            // For certain errors, we might want to continue (e.g., object already exists)
                            if (ex.Number != 2714 &&
                                ex.Number != 1750) // Object already exists, or cannot create constraint
                            {
                                throw;
                            }
                        }
                    }

                    _logger.LogInformation("Completed migration script: {ScriptName}", scriptFileName);
                }

                _logger.LogInformation("All migration scripts executed successfully for tenant {TenantId}", tenantId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing tenant migrations for tenant {TenantId}", tenantId);
                return false;
            }
        }

        public async Task<bool> ExecuteTenantMigrationsAsync(
            string connectionString,
            int tenantId,
            string? sourceDatabaseName = null)
        {
            try
            {
                if (!Directory.Exists(_migrationScriptsPath))
                {
                    _logger.LogError("Migration scripts directory not found: {Path}", _migrationScriptsPath);
                    return false;
                }

                // Extract database name
                var builder = new NpgsqlConnectionStringBuilder(connectionString);
                var targetDatabaseName = builder.Database;

                // PostgreSQL does NOT support cross-database queries
                sourceDatabaseName ??= targetDatabaseName;

                var migrationScripts = new[]
                {
                    "01_Permissions.sql",
                    "04_PMWorkFlow.sql",
                    "05_OpportunityStatuses.sql"
                };

                await using var connection = new NpgsqlConnection(connectionString);
                await connection.OpenAsync();

                foreach (var scriptFileName in migrationScripts)
                {
                    var scriptPath = Path.Combine(_migrationScriptsPath, scriptFileName);

                    if (!File.Exists(scriptPath))
                    {
                        _logger.LogWarning("Migration script not found: {ScriptPath}, skipping...", scriptPath);
                        continue;
                    }

                    _logger.LogInformation("Executing migration script: {ScriptName}", scriptFileName);

                    var scriptContent = await File.ReadAllTextAsync(scriptPath, Encoding.UTF8);

                    // Replace placeholders
                    scriptContent = ReplacePlaceholders(
                        scriptContent,
                        tenantId,
                        targetDatabaseName,
                        sourceDatabaseName,
                        null,
                        null,
                        null);

                    try
                    {
                        await using var command = new NpgsqlCommand(scriptContent, connection)
                        {
                            CommandTimeout = 300
                        };

                        await command.ExecuteNonQueryAsync();
                    }
                    catch (PostgresException ex)
                    {
                        // Common PostgreSQL "already exists" errors
                        if (ex.SqlState == "42P07" || // duplicate_table
                            ex.SqlState == "42710") // duplicate_object
                        {
                            _logger.LogWarning(
                                "Object already exists while executing {ScriptName}, continuing...",
                                scriptFileName);
                        }
                        else
                        {
                            _logger.LogError(
                                ex,
                                "Error executing migration script {ScriptName}",
                                scriptFileName);
                            throw;
                        }
                    }

                    _logger.LogInformation("Completed migration script: {ScriptName}", scriptFileName);
                }

                _logger.LogInformation(
                    "All PostgreSQL migration scripts executed successfully for tenant {TenantId}",
                    tenantId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error executing PostgreSQL tenant migrations for tenant {TenantId}",
                    tenantId);
                return false;
            }
        }

        public async Task<bool> ExecuteTenantUserMigrationsAsyncSQL(string connectionString, int tenantId,
            string userEmail, string roleName, string permissionName, string? sourceDatabaseName = null)
        {
            try
            {
                if (!Directory.Exists(_migrationScriptsPath))
                {
                    _logger.LogError("Migration scripts directory not found: {Path}", _migrationScriptsPath);
                    return false;
                }

                // Extract database name from connection string
                var builder = new SqlConnectionStringBuilder(connectionString);
                var targetDatabaseName = builder.InitialCatalog;

                // If source database not provided, use the default from configuration
                if (string.IsNullOrEmpty(sourceDatabaseName))
                {
                    var defaultConnectionString = _configuration.GetConnectionString("AppDbConnection");
                    if (!string.IsNullOrEmpty(defaultConnectionString))
                    {
                        var defaultBuilder = new SqlConnectionStringBuilder(defaultConnectionString);
                        sourceDatabaseName = defaultBuilder.InitialCatalog;
                    }
                }

                // Define the order of migration scripts for user migration
                // Note: 02_Add_Roles_Mapp_Role_Permissions.sql is included to ensure roles exist
                // Error handling will skip duplicate role inserts (error 2627 = duplicate key)
                var migrationScripts = new[]
                {
                    "02_Add_Roles_Mapp_Role_Permissions.sql",
                    "03_Migrate_User_From_Soure_Target_DBs.sql"
                };

                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                foreach (var scriptFileName in migrationScripts)
                {
                    var scriptPath = Path.Combine(_migrationScriptsPath, scriptFileName);

                    if (!File.Exists(scriptPath))
                    {
                        _logger.LogWarning("Migration script not found: {ScriptPath}, skipping...", scriptPath);
                        continue;
                    }

                    _logger.LogInformation("Executing migration script: {ScriptName}", scriptFileName);

                    var scriptContent = await File.ReadAllTextAsync(scriptPath, Encoding.UTF8);

                    // Replace placeholders in the script
                    scriptContent = ReplacePlaceholders(scriptContent, tenantId, targetDatabaseName, sourceDatabaseName,
                        userEmail, roleName, permissionName);

                    // Split script into batches (by GO statements)
                    var batches = SplitScriptIntoBatches(scriptContent);

                    foreach (var batch in batches)
                    {
                        if (string.IsNullOrWhiteSpace(batch))
                            continue;

                        try
                        {
                            using var command = new SqlCommand(batch, connection);
                            command.CommandTimeout = 300; // 5 minutes timeout for migrations
                            await command.ExecuteNonQueryAsync();

                            _logger.LogDebug("Successfully executed batch from {ScriptName}", scriptFileName);
                        }
                        catch (SqlException ex)
                        {
                            // Log error but continue with next batch for certain non-critical errors
                            _logger.LogWarning(ex,
                                "Error executing batch from {ScriptName}: {ErrorMessage} (Error Number: {ErrorNumber})",
                                scriptFileName, ex.Message, ex.Number);

                            // Handle non-critical errors that we can safely ignore:
                            // 2714 = Object already exists (table, procedure, etc.)
                            // 1750 = Cannot create constraint (usually because object already exists)
                            // 2627 = Violation of PRIMARY KEY constraint (duplicate key - roles already exist)
                            // 2601 = Cannot insert duplicate key row (duplicate key)
                            if (ex.Number == 2714 || ex.Number == 1750 || ex.Number == 2627 || ex.Number == 2601)
                            {
                                _logger.LogInformation(
                                    "Skipping duplicate insert in {ScriptName} - object already exists",
                                    scriptFileName);
                                continue; // Skip this batch and continue with next
                            }

                            // For other errors, rethrow to fail the migration
                            throw;
                        }
                    }

                    _logger.LogInformation("Completed migration script: {ScriptName}", scriptFileName);
                }

                _logger.LogInformation(
                    "All user migration scripts executed successfully for tenant {TenantId} and user {UserEmail}",
                    tenantId, userEmail);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error executing tenant user migrations for tenant {TenantId} and user {UserEmail}", tenantId,
                    userEmail);
                return false;
            }
        }

        public async Task<bool> ExecuteTenantUserMigrationsAsync(
            string connectionString,
            int tenantId,
            string userEmail,
            string roleName,
            string permissionName,
            string? sourceDatabaseName = null)
        {
            try
            {
                if (!Directory.Exists(_migrationScriptsPath))
                {
                    _logger.LogError("Migration scripts directory not found: {Path}", _migrationScriptsPath);
                    return false;
                }

                // Extract database name from connection string (PostgreSQL version)
                var builder = new Npgsql.NpgsqlConnectionStringBuilder(connectionString);
                var targetDatabaseName = builder.Database;

                // If source database not provided, use the default from configuration
                if (string.IsNullOrEmpty(sourceDatabaseName))
                {
                    var defaultConnectionString = _configuration.GetConnectionString("AppDbConnection");
                    if (!string.IsNullOrEmpty(defaultConnectionString))
                    {
                        var defaultBuilder = new Npgsql.NpgsqlConnectionStringBuilder(defaultConnectionString);
                        sourceDatabaseName = defaultBuilder.Database;
                    }
                }

                // Migration scripts for user and role setup
                var migrationScripts = new[]
                {
                    "02_Add_Roles_Mapp_Role_Permissions.sql",
                    "03_Migrate_User_From_Soure_Target_ProgresDB.sql"
                };

                await using var connection = new Npgsql.NpgsqlConnection(connectionString);
                await connection.OpenAsync();

                foreach (var scriptFileName in migrationScripts)
                {
                    var scriptPath = Path.Combine(_migrationScriptsPath, scriptFileName);

                    if (!File.Exists(scriptPath))
                    {
                        _logger.LogWarning("Migration script not found: {ScriptPath}, skipping...", scriptPath);
                        continue;
                    }

                    _logger.LogInformation("Executing migration script: {ScriptName}", scriptFileName);

                    var scriptContent = await File.ReadAllTextAsync(scriptPath, Encoding.UTF8);

                    // Replace placeholders in the script (tenantId, userEmail, roleName, permissionName)
                    scriptContent = ReplacePlaceholders(scriptContent, tenantId, targetDatabaseName, sourceDatabaseName,
                        userEmail, roleName, permissionName);

                    // Split script into batches using semicolons (PostgreSQL doesn't use GO)
                   // var batches = scriptContent.Split(";", StringSplitOptions.RemoveEmptyEntries);

                    //foreach (var batchRaw in batches)
                    {
                       // var batch = batchRaw.Trim();
                       // if (string.IsNullOrWhiteSpace(scriptContent))
                        //    continue;

                        try
                        {
                            await using var command = new Npgsql.NpgsqlCommand(scriptContent, connection);
                            command.CommandTimeout = 300; // 5 minutes timeout for migrations
                            await command.ExecuteNonQueryAsync();

                            _logger.LogDebug("Successfully executed batch from {ScriptName}", scriptFileName);
                        }
                        catch (PostgresException ex)
                        {
                            // Log warning for duplicate entries (idempotent inserts)
                            if (ex.SqlState == "23505") // unique_violation
                            {
                                _logger.LogInformation(
                                    "Skipping duplicate insert in {ScriptName} (unique_violation): {Message}",
                                    scriptFileName, ex.Message);
                                continue; // Skip this batch
                            }

                            // Other Postgres errors rethrow
                            _logger.LogError(ex,
                                "Error executing batch from {ScriptName}: {Message}", scriptFileName, ex.Message);
                            throw;
                        }
                    }

                    _logger.LogInformation("Completed migration script: {ScriptName}", scriptFileName);
                }

                _logger.LogInformation(
                    "All user migration scripts executed successfully for tenant {TenantId} and user {UserEmail}",
                    tenantId, userEmail);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error executing tenant user migrations for tenant {TenantId} and user {UserEmail}", tenantId,
                    userEmail);
                return false;
            }
        }

        public async Task<bool> ExecuteNonIsolatedTenantMigrationsAsync(string connectionString, int tenantId,
            string? sourceDatabaseName = null)
        {
            try
            {
                if (!Directory.Exists(_nonIsolatedTenetScriptPath))
                {
                    _logger.LogError("Migration scripts directory not found: {Path}", _nonIsolatedTenetScriptPath);
                    return false;
                }

                // Extract database name from connection string
                var builder = new SqlConnectionStringBuilder(connectionString);
                var targetDatabaseName = builder.InitialCatalog;

                // If source database/server not provided, use the default from configuration
                if (string.IsNullOrEmpty(sourceDatabaseName))
                {
                    var defaultConnectionString = _configuration.GetConnectionString("AppDbConnection");
                    if (!string.IsNullOrEmpty(defaultConnectionString))
                    {
                        var defaultBuilder = new SqlConnectionStringBuilder(defaultConnectionString);
                        sourceDatabaseName = defaultBuilder.InitialCatalog;
                    }
                }

                // Define the order of migration scripts
                var migrationScripts = new[]
                {
                    "01_DropIndex.Sql",
                    "03_PMWorkFlow.Sql",
                    "04_OpportunityStatuses.Sql",
                    "05_Setup_user.Sql"
                };

                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                foreach (var scriptFileName in migrationScripts)
                {
                    var scriptPath = Path.Combine(_nonIsolatedTenetScriptPath, scriptFileName);

                    if (!File.Exists(scriptPath))
                    {
                        _logger.LogWarning("Migration script not found: {ScriptPath}, skipping...", scriptPath);
                        continue;
                    }

                    _logger.LogInformation("Executing migration script: {ScriptName}", scriptFileName);

                    var scriptContent = await File.ReadAllTextAsync(scriptPath, Encoding.UTF8);

                    // Replace placeholders in the script
                    scriptContent = ReplacePlaceholders(scriptContent, tenantId, targetDatabaseName, sourceDatabaseName,
                        null, null, null);

                    // Split script into batches (by GO statements)
                    var batches = SplitScriptIntoBatches(scriptContent);

                    foreach (var batch in batches)
                    {
                        if (string.IsNullOrWhiteSpace(batch))
                            continue;

                        try
                        {
                            using var command = new SqlCommand(batch, connection);
                            command.CommandTimeout = 300; // 5 minutes timeout for migrations
                            await command.ExecuteNonQueryAsync();

                            _logger.LogDebug("Successfully executed batch from {ScriptName}", scriptFileName);
                        }
                        catch (SqlException ex)
                        {
                            // Log error but continue with next batch
                            _logger.LogError(ex, "Error executing batch from {ScriptName}: {ErrorMessage}",
                                scriptFileName, ex.Message);

                            // For certain errors, we might want to continue (e.g., object already exists)
                            if (ex.Number != 2714 &&
                                ex.Number != 1750) // Object already exists, or cannot create constraint
                            {
                                throw;
                            }
                        }
                    }

                    _logger.LogInformation("Completed migration script: {ScriptName}", scriptFileName);
                }

                _logger.LogInformation("All migration scripts executed successfully for tenant {TenantId}", tenantId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing tenant migrations for tenant {TenantId}", tenantId);
                return false;
            }
        }

        public async Task<bool> ExecuteNonIsolatedTenantUserMigrationsAsyncSQL(string connectionString, int tenantId,
            string userEmail, string roleName, string permissionName, string? sourceDatabaseName = null)
        {
            try
            {
                if (!Directory.Exists(_nonIsolatedTenetScriptPath))
                {
                    _logger.LogError("Migration scripts directory not found: {Path}", _nonIsolatedTenetScriptPath);
                    return false;
                }

                // Extract database name from connection string
                var builder = new SqlConnectionStringBuilder(connectionString);
                var targetDatabaseName = builder.InitialCatalog;

                // If source database not provided, use the default from configuration
                if (string.IsNullOrEmpty(sourceDatabaseName))
                {
                    var defaultConnectionString = _configuration.GetConnectionString("AppDbConnection");
                    if (!string.IsNullOrEmpty(defaultConnectionString))
                    {
                        var defaultBuilder = new SqlConnectionStringBuilder(defaultConnectionString);
                        sourceDatabaseName = defaultBuilder.InitialCatalog;
                    }
                }

                var migrationScripts = new[]
                {
                    "01_DropIndex.Sql",
                    "04_PMWorkFlow.Sql",
                    "05_OpportunityStatuses.Sql",
                    "03_Setup_user.Sql"
                };

                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                foreach (var scriptFileName in migrationScripts)
                {
                    var scriptPath = Path.Combine(_nonIsolatedTenetScriptPath, scriptFileName);

                    if (!File.Exists(scriptPath))
                    {
                        _logger.LogWarning("Migration script not found: {ScriptPath}, skipping...", scriptPath);
                        continue;
                    }

                    _logger.LogInformation("Executing migration script: {ScriptName}", scriptFileName);

                    var scriptContent = await File.ReadAllTextAsync(scriptPath, Encoding.UTF8);

                    // Replace placeholders in the script
                    scriptContent = ReplacePlaceholders(scriptContent, tenantId, targetDatabaseName, sourceDatabaseName,
                        userEmail, roleName, permissionName);

                    // Split script into batches (by GO statements)
                    var batches = SplitScriptIntoBatches(scriptContent);

                    foreach (var batch in batches)
                    {
                        if (string.IsNullOrWhiteSpace(batch))
                            continue;

                        try
                        {
                            using var command = new SqlCommand(batch, connection);
                            command.CommandTimeout = 300; // 5 minutes timeout for migrations
                            await command.ExecuteNonQueryAsync();

                            _logger.LogDebug("Successfully executed batch from {ScriptName}", scriptFileName);
                        }
                        catch (SqlException ex)
                        {
                            // Log error but continue with next batch for certain non-critical errors
                            _logger.LogWarning(ex,
                                "Error executing batch from {ScriptName}: {ErrorMessage} (Error Number: {ErrorNumber})",
                                scriptFileName, ex.Message, ex.Number);

                            throw;
                        }
                    }

                    _logger.LogInformation("Completed migration script: {ScriptName}", scriptFileName);
                }

                _logger.LogInformation(
                    "All user migration scripts executed successfully for tenant {TenantId} and user {UserEmail}",
                    tenantId, userEmail);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error executing tenant user migrations for tenant {TenantId} and user {UserEmail}", tenantId,
                    userEmail);
                return false;
            }
        }
        
        public async Task<bool> ExecuteNonIsolatedTenantUserMigrationsAsync(string connectionString, int tenantId,
                    string userEmail, string roleName, string permissionName, string? sourceDatabaseName = null)
                {
                    try
                    {
                        if (!Directory.Exists(_nonIsolatedTenetScriptPath))
                        {
                            _logger.LogError("Migration scripts directory not found: {Path}", _nonIsolatedTenetScriptPath);
                            return false;
                        }
        
                        // Extract database name from connection string
                        var builder = new NpgsqlConnectionStringBuilder(connectionString);
                        var targetDatabaseName = builder.Database;
        
                        // If source database not provided, use the default from configuration
                        if (string.IsNullOrEmpty(sourceDatabaseName))
                        {
                            var defaultConnectionString = _configuration.GetConnectionString("AppDbConnection");
                            if (!string.IsNullOrEmpty(defaultConnectionString))
                            {
                                var defaultBuilder = new NpgsqlConnectionStringBuilder(defaultConnectionString);
                                sourceDatabaseName = defaultBuilder.Database;
                            }
                        }
        
                        var migrationScripts = new[]
                        {
                            "04_PMWorkFlow.Sql",
                            "05_OpportunityStatuses.Sql",
                            "03_Setup_user.Sql"
                        };

                        await using var connection = new NpgsqlConnection(connectionString);
                        await connection.OpenAsync();
        
                        foreach (var scriptFileName in migrationScripts)
                        {
                            var scriptPath = Path.Combine(_nonIsolatedTenetScriptPath, scriptFileName);
        
                            if (!File.Exists(scriptPath))
                            {
                                _logger.LogWarning("Migration script not found: {ScriptPath}, skipping...", scriptPath);
                                continue;
                            }
        
                            _logger.LogInformation("Executing migration script: {ScriptName}", scriptFileName);
        
                            var scriptContent = await File.ReadAllTextAsync(scriptPath, Encoding.UTF8);
        
                            // Replace placeholders in the script
                            scriptContent = ReplacePlaceholders(scriptContent, tenantId, targetDatabaseName, sourceDatabaseName,
                                userEmail, roleName, permissionName);
        
                            // Split script into batches (by GO statements)
                            var batches = SplitScriptIntoBatches(scriptContent);
        
                            foreach (var batch in batches)
                            {
                                if (string.IsNullOrWhiteSpace(batch))
                                    continue;
        
                                try
                                {
                                    using var command = new NpgsqlCommand(batch, connection);
                                    command.CommandTimeout = 300; // 5 minutes timeout for migrations
                                    await command.ExecuteNonQueryAsync();
        
                                    _logger.LogDebug("Successfully executed batch from {ScriptName}", scriptFileName);
                                }
                                catch (SqlException ex)
                                {
                                    // Log error but continue with next batch for certain non-critical errors
                                    _logger.LogWarning(ex,
                                        "Error executing batch from {ScriptName}: {ErrorMessage} (Error Number: {ErrorNumber})",
                                        scriptFileName, ex.Message, ex.Number);
        
                                    throw;
                                }
                            }
        
                            _logger.LogInformation("Completed migration script: {ScriptName}", scriptFileName);
                        }
        
                        _logger.LogInformation(
                            "All user migration scripts executed successfully for tenant {TenantId} and user {UserEmail}",
                            tenantId, userEmail);
                        return true;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex,
                            "Error executing tenant user migrations for tenant {TenantId} and user {UserEmail}", tenantId,
                            userEmail);
                        return false;
                    }
                }

        private string ReplacePlaceholdersSQL(string scriptContent, int tenantId, string targetDatabaseName,
            string? sourceDatabaseName, string? userEmail = null, string? roleName = null,
            string? permissionName = null)
        {
            // Replace @TenantId placeholder
            // Replace @TenantId placeholder (Robust: matches INT = X; or INT=X;)
            scriptContent = Regex.Replace(scriptContent, @"DECLARE\s+@TenantId\s+INT[^=]*=[^;]*;",
                $"DECLARE @TenantId INT = {tenantId};", RegexOptions.IgnoreCase);

            // Replace database name placeholders in USE statements
            scriptContent = Regex.Replace(scriptContent, @"USE\s+\[.*?\];",
                $"USE [{targetDatabaseName}];", RegexOptions.IgnoreCase);

            // Replace @TargetDb placeholder
            scriptContent = Regex.Replace(scriptContent, @"DECLARE\s+@TargetDb\s+SYSNAME[^=]*=[^;]*;",
                $"DECLARE @TargetDb SYSNAME = '{targetDatabaseName}';", RegexOptions.IgnoreCase);

            // Replace @SourceDb placeholder if source database name is provided
            if (!string.IsNullOrEmpty(sourceDatabaseName))
            {
                scriptContent = Regex.Replace(scriptContent, @"DECLARE\s+@SourceDb\s+SYSNAME[^=]*=[^;]*;",
                    $"DECLARE @SourceDb SYSNAME = '{sourceDatabaseName}';", RegexOptions.IgnoreCase);
            }

            // Replace @Email placeholder if user email is provided
            if (!string.IsNullOrEmpty(userEmail))
            {
                scriptContent = Regex.Replace(scriptContent, @"DECLARE\s+@Email\s+NVARCHAR\(256\)[^=]*=[^;]*;",
                    $"DECLARE @Email NVARCHAR(256) = '{userEmail}';", RegexOptions.IgnoreCase);
            }

            // Replace @RoleName placeholder if role name is provided
            if (!string.IsNullOrEmpty(roleName))
            {
                scriptContent = Regex.Replace(scriptContent, @"DECLARE\s+@RoleName\s+NVARCHAR\(256\)[^=]*=[^;]*;",
                    $"DECLARE @RoleName NVARCHAR(256) = '{roleName}';", RegexOptions.IgnoreCase);
            }

            // Replace @PermissionName placeholder if permission name is provided
            if (!string.IsNullOrEmpty(permissionName))
            {
                scriptContent = Regex.Replace(scriptContent, @"DECLARE\s+@PermissionName\s+NVARCHAR\(256\)[^=]*=[^;]*;",
                    $"DECLARE @PermissionName NVARCHAR(256) = '{permissionName}';", RegexOptions.IgnoreCase);
            }

            return scriptContent;
        }
        
        
        private string ReplacePlaceholders(
            string scriptContent,
            int tenantId,
            string targetDatabaseName,
            string? sourceDatabaseName,
            string? userEmail = null,
            string? roleName = null,
            string? permissionName = null)
        {
            // Read source connection details
            var sourceConn = new NpgsqlConnectionStringBuilder(
                _configuration.GetConnectionString("AppDbConnection")
            );

            return scriptContent
                // ---- dblink connection ----
                .Replace("{{SOURCE_DB}}", sourceDatabaseName ?? sourceConn.Database)
                .Replace("{{SOURCE_HOST}}", sourceConn.Host)
                .Replace("{{SOURCE_PORT}}", sourceConn.Port.ToString())
                .Replace("{{SOURCE_USER}}", sourceConn.Username)
                .Replace("{{SOURCE_PASSWORD}}", sourceConn.Password)

                // ---- business values ----
                .Replace("{{TENANT_ID}}", tenantId.ToString())
                .Replace("{{USER_EMAIL}}", EscapeSql(userEmail))
                .Replace("{{ROLE_NAME}}", EscapeSql(roleName))
                .Replace("{{PERMISSION_NAME}}", EscapeSql(permissionName));
        }
        private static string EscapeSql(string? value)
        {
            return value == null ? string.Empty : value.Replace("'", "''");
        }

        private List<string> SplitScriptIntoBatches(string script)
        {
            var batches = new List<string>();
            var currentBatch = new StringBuilder();
            var lines = script.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);

            foreach (var line in lines)
            {
                // Check if line is a GO statement (case-insensitive, with optional semicolon)
                if (Regex.IsMatch(line.Trim(), @"^\s*GO\s*;?\s*$", RegexOptions.IgnoreCase))
                {
                    if (currentBatch.Length > 0)
                    {
                        batches.Add(currentBatch.ToString());
                        currentBatch.Clear();
                    }
                }
                else
                {
                    currentBatch.AppendLine(line);
                }
            }

            // Add the last batch if it's not empty
            if (currentBatch.Length > 0)
            {
                batches.Add(currentBatch.ToString());
            }

            return batches;
        }
    }
}