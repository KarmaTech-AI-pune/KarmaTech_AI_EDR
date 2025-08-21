using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace NJS.Application.Services
{
    public interface ITenantDatabaseService
    {
        Task<bool> CreateTenantDatabaseAsync(TenantDatabase tenantDatabase);
        Task<bool> DeleteTenantDatabaseAsync(int tenantId);
        Task<bool> EnsureDatabaseCreatedAsync(string connectionString);
    }

    public class TenantDatabaseService : ITenantDatabaseService
    {
        private readonly IConfiguration _configuration;
        private readonly TenantDbContext _tenantDbContext;
        private readonly IDbContextFactory<ProjectManagementContext> _contextFactory;

        public TenantDatabaseService(
            IConfiguration configuration,
            TenantDbContext tenantDbContext,
            IDbContextFactory<ProjectManagementContext> contextFactory)
        {
            _configuration = configuration;
            _tenantDbContext = tenantDbContext;
            _contextFactory = contextFactory;
        }

        public async Task<bool> CreateTenantDatabaseAsync(TenantDatabase tenantDatabase)
        {
            try
            {
                // Add tenant database record to central database
                _tenantDbContext.TenantDatabases.Add(tenantDatabase);
                await _tenantDbContext.SaveChangesAsync();

                // Create the actual database and apply migrations
                string connectionString = !string.IsNullOrEmpty(tenantDatabase.ConnectionString)
                    ? tenantDatabase.ConnectionString
                    : _configuration.GetConnectionString("AppDbConnection");

                await EnsureDatabaseCreatedAsync(connectionString);

                return true;
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error creating tenant database: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> DeleteTenantDatabaseAsync(int tenantId)
        {
            try
            {
                var tenantDatabase = await _tenantDbContext.TenantDatabases
                    .FirstOrDefaultAsync(t => t.Id == tenantId);

                if (tenantDatabase == null)
                    return false;

                // Remove from central database
                _tenantDbContext.TenantDatabases.Remove(tenantDatabase);
                await _tenantDbContext.SaveChangesAsync();

                // Note: Actually deleting the physical database should be handled carefully
                // and might require additional security considerations
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting tenant database: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> EnsureDatabaseCreatedAsync(string connectionString)
        {
            try
            {
                using var context = _contextFactory.CreateDbContext();
                context.Database.SetConnectionString(connectionString);
                
                // Create database if it doesn't exist
                await context.Database.EnsureCreatedAsync();
                
                // Apply any pending migrations
                if ((await context.Database.GetPendingMigrationsAsync()).Any())
                {
                    await context.Database.MigrateAsync();
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error ensuring database created: {ex.Message}");
                return false;
            }
        }
    }
}
