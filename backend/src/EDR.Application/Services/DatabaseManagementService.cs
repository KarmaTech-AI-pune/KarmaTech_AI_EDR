using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;

namespace EDR.Application.Services
{
    public class DatabaseManagementService : IDatabaseManagementService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<DatabaseManagementService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public DatabaseManagementService(IServiceProvider serviceProvider,
            IConfiguration configuration, ILogger<DatabaseManagementService> logger)
        {
            _configuration = configuration;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task<(bool isDbCreated, string dbName, string connectionString)> CreateTenantDatabaseAsyncSQL(
            string subDomain, bool isIsolated)
        {
            string mainConnectionString = _configuration.GetConnectionString("AppDbConnection");
            SqlConnectionStringBuilder builder = new(mainConnectionString);
            string mainDatabaseName = builder.InitialCatalog; // retrieve the database name
            string tenantDbName = mainDatabaseName + "-" + subDomain;
            builder.InitialCatalog = tenantDbName; // set new database name
            string modifiedConnectionString = builder.ConnectionString; // create new connection string
            // Use the main database for all tenants
            //var databaseName = mainConnectionString;


            //string modifiedConnectionString = builder.ConnectionString; // create new connection string
            //try
            //{
            //    // Get the master database connection string
            //    var masterConnectionString = GetMasterConnectionString();

            //    using var connection = new SqlConnection(masterConnectionString);
            //    await connection.OpenAsync();

            //    // Check if database already exists
            //    if (await DatabaseExistsAsync(databaseName))
            //    {
            //        _logger.LogWarning("Database {DatabaseName} already exists", databaseName);
            //        return true;
            //    }

            //    // Create the database
            //    var createDatabaseSql = $"CREATE DATABASE [{databaseName}]";
            //    using var command = new SqlCommand(createDatabaseSql, connection);
            //    await command.ExecuteNonQueryAsync();

            //    _logger.LogInformation("Successfully created database {DatabaseName}", databaseName);

            //    // Create the database schema by running migrations
            //    await CreateDatabaseSchemaAsync(databaseName, connectionString);

            //    return true;
            //}
            //catch (Exception ex)
            //{
            //    _logger.LogError(ex, "Error creating database {DatabaseName}", databaseName);
            //    return false;
            //}
            try
            {
                if (isIsolated)
                {
                    // create a new tenant database and bring current with any pending migrations from ApplicationDbContext
                    using IServiceScope scopeTenant = _serviceProvider.CreateScope();
                    ProjectManagementContext dbContext =
                        scopeTenant.ServiceProvider.GetRequiredService<ProjectManagementContext>();
                    dbContext.Database.SetConnectionString(modifiedConnectionString);
                    if (dbContext.Database.GetPendingMigrations().Any())
                    {
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.WriteLine($"Applying ApplicationDB Migrations for New '{tenantDbName}' tenant.");
                        Console.ResetColor();
                        dbContext.Database.Migrate();
                    }

                    return new(true, tenantDbName, modifiedConnectionString);
                }
                else
                {
                    return new(true, mainDatabaseName, mainConnectionString!);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating database {DatabaseName}", tenantDbName);
            }

            return new(false, null!, null!);
        }


        public async Task<(bool isDbCreated, string dbName, string connectionString)> CreateTenantDatabaseAsync(
            string subDomain, bool isIsolated)
        {
            string mainConnectionString = _configuration.GetConnectionString("SqlDbConnection");
            var mainBuilder = new SqlConnectionStringBuilder(mainConnectionString);
            string mainDatabaseName = mainBuilder.InitialCatalog;
            string tenantDbName = $"{mainDatabaseName}-{subDomain}";
            mainBuilder.InitialCatalog = tenantDbName;
            string tenantConnectionString = mainBuilder.ConnectionString;

            if (!isIsolated)
            {
                return new(true, mainDatabaseName, mainConnectionString!);
            }

            try
            {
                using IServiceScope scopeTenant = _serviceProvider.CreateScope();
                var dbContext = scopeTenant.ServiceProvider.GetRequiredService<ProjectManagementContext>();
                dbContext.Database.SetConnectionString(tenantConnectionString);
                if (dbContext.Database.GetPendingMigrations().Any())
                {
                    _logger.LogInformation("Applying SQL Server migrations for new tenant DB '{TenantDbName}'",
                        tenantDbName);
                    dbContext.Database.Migrate();
                }

                return new(true, tenantDbName, tenantConnectionString);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating SQL Server database {DatabaseName}", tenantDbName);
                return new(false, null!, null!);
            }
        }

        public async Task<bool> DeleteTenantDatabaseAsync(string databaseName)
        {
            try
            {
                var masterConnectionString = GetMasterConnectionString();

                using var connection = new SqlConnection(masterConnectionString);
                await connection.OpenAsync();

                // Terminate all connections to the database
                var terminateConnectionsSql = $@"
                    ALTER DATABASE [{databaseName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                    DROP DATABASE [{databaseName}];";

                using var command = new SqlCommand(terminateConnectionsSql, connection);
                await command.ExecuteNonQueryAsync();

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
                var masterConnectionString = GetMasterConnectionString();

                using var connection = new SqlConnection(masterConnectionString);
                await connection.OpenAsync();

                var checkDatabaseSql = $@"
                    SELECT COUNT(*) 
                    FROM sys.databases 
                    WHERE name = '{databaseName}'";

                using var command = new SqlCommand(checkDatabaseSql, connection);
                var count = await command.ExecuteScalarAsync();

                return Convert.ToInt32(count) > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if database {DatabaseName} exists", databaseName);
                return false;
            }
        }

        public async Task<bool> BackupTenantDatabaseAsync(string databaseName, string backupPath)
        {
            try
            {
                var masterConnectionString = GetMasterConnectionString();

                using var connection = new SqlConnection(masterConnectionString);
                await connection.OpenAsync();

                var backupSql = $@"
                    BACKUP DATABASE [{databaseName}] 
                    TO DISK = '{backupPath}' 
                    WITH FORMAT, INIT, NAME = N'{databaseName}-Full Database Backup', 
                    SKIP, NOREWIND, NOUNLOAD, STATS = 10";

                using var command = new SqlCommand(backupSql, connection);
                await command.ExecuteNonQueryAsync();

                _logger.LogInformation("Successfully backed up database {DatabaseName} to {BackupPath}", databaseName,
                    backupPath);
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
            try
            {
                var masterConnectionString = GetMasterConnectionString();

                using var connection = new SqlConnection(masterConnectionString);
                await connection.OpenAsync();

                var restoreSql = $@"
                    RESTORE DATABASE [{databaseName}] 
                    FROM DISK = '{backupPath}' 
                    WITH REPLACE, RECOVERY";

                using var command = new SqlCommand(restoreSql, connection);
                await command.ExecuteNonQueryAsync();

                _logger.LogInformation("Successfully restored database {DatabaseName} from {BackupPath}", databaseName,
                    backupPath);
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
            var connectionString = _configuration.GetConnectionString("AppDbConnection");
            var builder = new SqlConnectionStringBuilder(connectionString)
            {
                InitialCatalog = "master"
            };
            return builder.ConnectionString;
        }

        private async Task CreateDatabaseSchemaAsync(string databaseName, string connectionString)
        {
            try
            {
                // For now, we'll create a basic schema
                // In a production environment, you would run Entity Framework migrations
                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                // Create basic tables structure (simplified version)
                var createTablesSql = @"
                    -- Create basic tables for tenant database
                    -- This is a simplified schema - in production, run EF migrations
                    
                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Projects]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[Projects](
                            [Id] [int] IDENTITY(1,1) NOT NULL,
                            [Name] [nvarchar](255) NOT NULL,
                            [Description] [nvarchar](max) NULL,
                            [Status] [int] NOT NULL DEFAULT 0,
                            [CreatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
                            CONSTRAINT [PK_Projects] PRIMARY KEY CLUSTERED ([Id] ASC)
                        )
                    END

                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[Users](
                            [Id] [nvarchar](450) NOT NULL,
                            [UserName] [nvarchar](256) NOT NULL,
                            [Email] [nvarchar](256) NOT NULL,
                            [CreatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
                            CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC)
                        )
                    END";

                using var command = new SqlCommand(createTablesSql, connection);
                await command.ExecuteNonQueryAsync();

                _logger.LogInformation("Successfully created schema for database {DatabaseName}", databaseName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating schema for database {DatabaseName}", databaseName);
                throw;
            }
        }
    }
}