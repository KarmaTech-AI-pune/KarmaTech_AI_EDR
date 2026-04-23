using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using EDR.Application.Services.IContract;

namespace EDR.Application.Services;

public class TenantMigrationSqlService : ITenantMigrationService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<TenantMigrationSqlService> _logger;
    private readonly string _migrationScriptsPath;
    private readonly string _nonIsolatedTenetScriptPath;

    public TenantMigrationSqlService(IConfiguration configuration, ILogger<TenantMigrationSqlService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        var possiblePaths = new[]
        {
            Path.Combine(Directory.GetCurrentDirectory(), "MigrationSQL", "IsolatedSQL"),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "MigrationSQL",
                "IsolatedSQL"),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "MigrationSQL", "IsolatedSQL"),
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
            Path.Combine(Directory.GetCurrentDirectory(), "MigrationSQL", "NonIsolatedSQL"),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "MigrationSQL",
                "NonIsolatedSQL"),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "MigrationSQL", "NonIsolatedSQL"),
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

    public async Task<bool> ExecuteTenantMigrationsAsync(string connectionString, int tenantId,
        string? sourceDatabaseName = null)
    {
        try
        {
            if (!Directory.Exists(_migrationScriptsPath))
            {
                _logger.LogError("Migration scripts directory not found: {Path}", _migrationScriptsPath);
                return false;
            }

            var builder = new SqlConnectionStringBuilder(connectionString);
            var targetDatabaseName = builder.InitialCatalog;

            if (string.IsNullOrEmpty(sourceDatabaseName))
            {
                //TODO: Update the connection string name here
                var defaultConnectionString = _configuration.GetConnectionString("SqlDbConnection");
                if (!string.IsNullOrEmpty(defaultConnectionString))
                {
                    var defaultBuilder = new SqlConnectionStringBuilder(defaultConnectionString);
                    sourceDatabaseName = defaultBuilder.InitialCatalog;
                }
            }

            //TODO: Added SQL scripts here
            var migrationScripts = new[]
            {
                "01_PermissionsSQL.sql",
                "04_PMWorkFlowSQL.Sql",
                "05_OpportunityStatusesSQL.Sql",
                "BDScoring_SQL.sql"
            };

            await using var connection = new SqlConnection(connectionString);
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

                scriptContent = ReplacePlaceholdersSql(scriptContent, tenantId, targetDatabaseName, sourceDatabaseName,
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
                        _logger.LogError(ex, "Error executing batch from {ScriptName} at line {LineNumber}: {ErrorMessage}",
                            scriptFileName,ex.LineNumber, ex.Message);

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


    public async Task<bool> ExecuteTenantUserMigrationsAsync(string connectionString, int tenantId,
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
                var defaultConnectionString = _configuration.GetConnectionString("SqlDbConnection");
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
                "02_Add_Roles_Mapp_Role_PermissionsSQL.sql",
                "03_Migrate_User_From_Soure_Target_DBsSQL.sql"
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
                scriptContent = ReplacePlaceholdersSql(scriptContent, tenantId, targetDatabaseName, sourceDatabaseName,
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
                var defaultConnectionString = _configuration.GetConnectionString("SqlDbConnection");
                if (!string.IsNullOrEmpty(defaultConnectionString))
                {
                    var defaultBuilder = new SqlConnectionStringBuilder(defaultConnectionString);
                    sourceDatabaseName = defaultBuilder.InitialCatalog;
                }
            }

            // Define the order of migration scripts
            var migrationScripts = new[]
            {
                "01_DropIndexSQL.Sql",
                "03_PMWorkFlowSQL.Sql",
                "04_OpportunityStatusesSQL.Sql",
                "05_Setup_userSQL.Sql",
                "BDScoring_SQL.sql"
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
                scriptContent = ReplacePlaceholdersSql(scriptContent, tenantId, targetDatabaseName, sourceDatabaseName,
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

            var builder = new SqlConnectionStringBuilder(connectionString);
            var targetDatabaseName = builder.InitialCatalog;

            if (string.IsNullOrEmpty(sourceDatabaseName))
            {
                //TODO: Update the connection string name here
                var defaultConnectionString = _configuration.GetConnectionString("SqlDbConnection");
                if (!string.IsNullOrEmpty(defaultConnectionString))
                {
                    var defaultBuilder = new SqlConnectionStringBuilder(defaultConnectionString);
                    sourceDatabaseName = defaultBuilder.InitialCatalog;
                }
            }

            //TODO:Add SQL scripts here
            var migrationScripts = new[]
            {
                "01_DropIndexSQL.Sql",
                "04_PMWorkFlowSQL.Sql",
                "05_OpportunityStatusesSQL.Sql",
                "03_Setup_userSQL.Sql",
                "BDScoring_SQL.sql"
            };

            await using var connection = new SqlConnection(connectionString);
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

                scriptContent = ReplacePlaceholdersSql(scriptContent, tenantId, targetDatabaseName, sourceDatabaseName,
                    userEmail, roleName, permissionName);

                var batches = SplitScriptIntoBatches(scriptContent);

                foreach (var batch in batches)
                {
                    if (string.IsNullOrWhiteSpace(batch))
                        continue;

                    try
                    {
                        await using var command = new SqlCommand(batch, connection);
                        command.CommandTimeout = 300;
                        await command.ExecuteNonQueryAsync();

                        _logger.LogDebug("Successfully executed batch from {ScriptName}", scriptFileName);
                    }
                    catch (SqlException ex)
                    {
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

    private string ReplacePlaceholdersSql(string scriptContent, int tenantId, string targetDatabaseName,
        string? sourceDatabaseName, string? userEmail = null, string? roleName = null,
        string? permissionName = null)
    {
        scriptContent = Regex.Replace(scriptContent, @"DECLARE\s+@TenantId\s+INT[^=]*=[^;]*;",
            $"DECLARE @TenantId INT = {tenantId};", RegexOptions.IgnoreCase);

        scriptContent = Regex.Replace(scriptContent, @"USE\s+\[.*?\];",
            $"USE [{targetDatabaseName}];", RegexOptions.IgnoreCase);

        scriptContent = Regex.Replace(scriptContent, @"DECLARE\s+@TargetDb\s+SYSNAME[^=]*=[^;]*;",
            $"DECLARE @TargetDb SYSNAME = '{targetDatabaseName}';", RegexOptions.IgnoreCase);

        if (!string.IsNullOrEmpty(sourceDatabaseName))
        {
            scriptContent = Regex.Replace(scriptContent, @"DECLARE\s+@SourceDb\s+SYSNAME[^=]*=[^;]*;",
                $"DECLARE @SourceDb SYSNAME = '{sourceDatabaseName}';", RegexOptions.IgnoreCase);
        }

        if (!string.IsNullOrEmpty(userEmail))
        {
            scriptContent = Regex.Replace(scriptContent, @"DECLARE\s+@Email\s+NVARCHAR\(256\)[^=]*=[^;]*;",
                $"DECLARE @Email NVARCHAR(256) = '{userEmail}';", RegexOptions.IgnoreCase);
        }

        if (!string.IsNullOrEmpty(roleName))
        {
            scriptContent = Regex.Replace(scriptContent, @"DECLARE\s+@RoleName\s+NVARCHAR\(256\)[^=]*=[^;]*;",
                $"DECLARE @RoleName NVARCHAR(256) = '{roleName}';", RegexOptions.IgnoreCase);
        }

        if (!string.IsNullOrEmpty(permissionName))
        {
            scriptContent = Regex.Replace(scriptContent, @"DECLARE\s+@PermissionName\s+NVARCHAR\(256\)[^=]*=[^;]*;",
                $"DECLARE @PermissionName NVARCHAR(256) = '{permissionName}';", RegexOptions.IgnoreCase);
        }

        return scriptContent;
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