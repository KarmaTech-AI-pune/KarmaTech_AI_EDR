using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using EDR.Application.Services.IContract;
using EDR.Domain;
using EDR.Domain.Database;
using EDR.Domain.Services;

namespace EDR.Application.Services
{
    public class DatabaseManagementService : IDatabaseManagementService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<DatabaseManagementService> _logger;
        private readonly IServiceProvider _serviceProvider;

        private readonly ITenantConnectionResolver _connectionResolver;

        public DatabaseManagementService(IServiceProvider serviceProvider,
            IConfiguration configuration, ILogger<DatabaseManagementService> logger,
            ITenantConnectionResolver connectionResolver)
        {
            _configuration = configuration;
            _serviceProvider = serviceProvider;
            _logger = logger;
            _connectionResolver = connectionResolver;
        }

        public async Task<(bool isDbCreated, string dbName, string connectionString)> CreateTenantDatabaseAsync(
            string subDomain, bool isIsolated)
        {
            try
            {
                var dbType = _configuration[Constants.DbType];
                string mainConnectionString = await _connectionResolver.GetDefaultConnectionStringAsync();
                
                string mainDatabaseName;
                string tenantDbName;
                string tenantConnectionString;

                if (dbType == Constants.DbServerType)
                {
                    var builder = new Npgsql.NpgsqlConnectionStringBuilder(mainConnectionString);
                    mainDatabaseName = builder.Database;
                    tenantDbName = $"{mainDatabaseName}-{subDomain}".ToLower(); // Postgres prefers lowercase
                    builder.Database = tenantDbName;
                    tenantConnectionString = builder.ConnectionString;
                }
                else
                {
                    var builder = new SqlConnectionStringBuilder(mainConnectionString);
                    mainDatabaseName = builder.InitialCatalog;
                    tenantDbName = $"{mainDatabaseName}-{subDomain}";
                    builder.InitialCatalog = tenantDbName;
                    tenantConnectionString = builder.ConnectionString;
                }

                if (!isIsolated)
                {
                    return (true, mainDatabaseName, mainConnectionString);
                }

                // For isolated tenants, we need to create the database if it doesn't exist
                if (!await DatabaseExistsAsync(tenantDbName))
                {
                    await CreatePhysicalDatabaseAsync(tenantDbName);
                }

                // Apply migrations to the new database
                using IServiceScope scopeTenant = _serviceProvider.CreateScope();
                var dbContext = scopeTenant.ServiceProvider.GetRequiredService<ProjectManagementContext>();
                dbContext.Database.SetConnectionString(tenantConnectionString);
                
                if (dbContext.Database.GetPendingMigrations().Any())
                {
                    _logger.LogInformation("Applying migrations for new tenant DB '{TenantDbName}' ({DbType})", tenantDbName, dbType);
                    await dbContext.Database.MigrateAsync();
                }

                return (true, tenantDbName, tenantConnectionString);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tenant database for subdomain {SubDomain}", subDomain);
                return (false, null!, null!);
            }
        }

        private async Task CreatePhysicalDatabaseAsync(string databaseName)
        {
            var dbType = _configuration[Constants.DbType];
            var masterConnectionString = GetMasterConnectionString();

            if (dbType == Constants.DbServerType)
            {
                await using var connection = new Npgsql.NpgsqlConnection(masterConnectionString);
                await connection.OpenAsync();
                var sql = $"CREATE DATABASE \"{databaseName}\"";
                await using var command = new Npgsql.NpgsqlCommand(sql, connection);
                await command.ExecuteNonQueryAsync();
            }
            else
            {
                using var connection = new SqlConnection(masterConnectionString);
                await connection.OpenAsync();
                var sql = $"CREATE DATABASE [{databaseName}]";
                using var command = new SqlCommand(sql, connection);
                await command.ExecuteNonQueryAsync();
            }
            _logger.LogInformation("Successfully created physical database {DatabaseName}", databaseName);
        }

        public async Task<bool> DeleteTenantDatabaseAsync(string databaseName)
        {
            try
            {
                var dbType = _configuration[Constants.DbType];
                var masterConnectionString = GetMasterConnectionString();

                if (dbType == Constants.DbServerType)
                {
                    await using var connection = new Npgsql.NpgsqlConnection(masterConnectionString);
                    await connection.OpenAsync();
                    var sql = $"DROP DATABASE IF EXISTS \"{databaseName}\" WITH (FORCE)";
                    await using var command = new Npgsql.NpgsqlCommand(sql, connection);
                    await command.ExecuteNonQueryAsync();
                }
                else
                {
                    using var connection = new SqlConnection(masterConnectionString);
                    await connection.OpenAsync();
                    var sql = $@"ALTER DATABASE [{databaseName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                                DROP DATABASE [{databaseName}];";
                    using var command = new SqlCommand(sql, connection);
                    await command.ExecuteNonQueryAsync();
                }

                _logger.LogInformation("Successfully deleted database {DatabaseName}", databaseName);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting database {DatabaseName}", databaseName);
                return false;
            }
        }

        public async Task<bool> DatabaseExistsAsync(string databaseName)
        {
            try
            {
                var dbType = _configuration[Constants.DbType];
                var masterConnectionString = GetMasterConnectionString();

                if (dbType == Constants.DbServerType)
                {
                    await using var connection = new Npgsql.NpgsqlConnection(masterConnectionString);
                    await connection.OpenAsync();
                    var sql = "SELECT COUNT(*) FROM pg_database WHERE datname = @name";
                    await using var command = new Npgsql.NpgsqlCommand(sql, connection);
                    command.Parameters.AddWithValue("name", databaseName);
                    var count = await command.ExecuteScalarAsync();
                    return Convert.ToInt32(count) > 0;
                }
                else
                {
                    using var connection = new SqlConnection(masterConnectionString);
                    await connection.OpenAsync();
                    var sql = "SELECT COUNT(*) FROM sys.databases WHERE name = @name";
                    using var command = new SqlCommand(sql, connection);
                    command.Parameters.AddWithValue("name", databaseName);
                    var count = await command.ExecuteScalarAsync();
                    return Convert.ToInt32(count) > 0;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if database {DatabaseName} exists", databaseName);
                return false;
            }
        }

        public async Task<bool> BackupTenantDatabaseAsync(string databaseName, string backupPath)
        {
            var dbType = _configuration[Constants.DbType];
            if (dbType == Constants.DbServerType)
            {
                _logger.LogWarning("Backup for Postgres not implemented via SQL command.");
                return false;
            }

            try
            {
                var masterConnectionString = GetMasterConnectionString();
                using var connection = new SqlConnection(masterConnectionString);
                await connection.OpenAsync();
                var sql = $@"BACKUP DATABASE [{databaseName}] TO DISK = '{backupPath}' WITH FORMAT, INIT, NAME = N'{databaseName}-Full Backup', STATS = 10";
                using var command = new SqlCommand(sql, connection);
                await command.ExecuteNonQueryAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error backing up database {DatabaseName}", databaseName);
                return false;
            }
        }

        public async Task<bool> RestoreTenantDatabaseAsync(string databaseName, string backupPath)
        {
            var dbType = _configuration[Constants.DbType];
            if (dbType == Constants.DbServerType) return false;

            try
            {
                var masterConnectionString = GetMasterConnectionString();
                using var connection = new SqlConnection(masterConnectionString);
                await connection.OpenAsync();
                var sql = $"RESTORE DATABASE [{databaseName}] FROM DISK = '{backupPath}' WITH REPLACE, RECOVERY";
                using var command = new SqlCommand(sql, connection);
                await command.ExecuteNonQueryAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring database {DatabaseName}", databaseName);
                return false;
            }
        }

        private string GetMasterConnectionString()
        {
            var connectionString = _connectionResolver.GetDefaultConnectionStringAsync().GetAwaiter().GetResult();
            var dbType = _configuration[Constants.DbType];
            
            if (dbType == Constants.DbServerType)
            {
                var builder = new Npgsql.NpgsqlConnectionStringBuilder(connectionString) { Database = "postgres" };
                return builder.ConnectionString;
            }
            else
            {
                var builder = new SqlConnectionStringBuilder(connectionString) { InitialCatalog = "master" };
                return builder.ConnectionString;
            }
        }
    }
}