using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using NJS.Domain.Services;
using System;
using System.IO;
using System.Threading.Tasks;
using NJS.Domain.Entities; // Added for MigrationResult

namespace NJS.Domain.Database
{
    // Factory for TenantDbContext
    public class TenantDbContextFactory : IDesignTimeDbContextFactory<TenantDbContext>
    {
        public TenantDbContext CreateDbContext(string[] args) // neccessary for EF migration designer to run on this context
        {
            // Build the configuration by reading from the appsettings.json file (requires Microsoft.Extensions.Configuration.Json Nuget Package)
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            // Retrieve the connection string from the configuration
            string connectionString = configuration.GetConnectionString("AppDbConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string 'AppDbConnection' not found in appsettings.json");
            }

            DbContextOptionsBuilder<TenantDbContext> optionsBuilder = new();
           // _ = optionsBuilder.UseSqlServer(connectionString);
            _ = optionsBuilder.UseNpgsql(connectionString);
            return new TenantDbContext(optionsBuilder.Options);
        }
    }

    // Factory for ProjectManagementContext
    public class ProjectManagementContextFactory : IDesignTimeDbContextFactory<ProjectManagementContext>
    {
        public ProjectManagementContext CreateDbContext(string[] args)
        {
            // For design-time operations (migrations, etc.), use configuration from appsettings.json
            var currentDir = Directory.GetCurrentDirectory();
            var solutionDir = Path.GetFullPath(Path.Combine(currentDir, ".."));
            var startupProjectPath = Path.Combine(solutionDir, "NJSAPI");

            var configuration = new ConfigurationBuilder()
                .SetBasePath(startupProjectPath)
                .AddJsonFile(Path.Combine(startupProjectPath, "appsettings.json"))
                .AddJsonFile(Path.Combine(startupProjectPath, "appsettings.Development.json"), optional: true)
                .Build();

            var connectionString = configuration.GetConnectionString("AppDbConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string 'AppDbConnection' not found in appsettings.json");
            }

            var optionsBuilder = new DbContextOptionsBuilder<ProjectManagementContext>();
           // optionsBuilder.UseSqlServer(connectionString);
           optionsBuilder.UseNpgsql(connectionString);

            // Create a mock tenant service for design-time operations
            var mockTenantService = new DesignTimeTenantService(connectionString);

            return new ProjectManagementContext(optionsBuilder.Options, mockTenantService);
        }
    }

    // Mock tenant service for design-time operations
#nullable enable
    internal class DesignTimeTenantService : ICurrentTenantService
    {
        private string? _connectionString;
        private int? _tenantId;

        public DesignTimeTenantService(string connectionString)
        {
            _connectionString = connectionString;
            _tenantId = 1; // Default tenant for migrations
        }

        public string? ConnectionString
        {
            get => _connectionString;
            set => _connectionString = value;
        }

        public int? TenantId
        {
            get => _tenantId;
            set => _tenantId = value;
        }

        public Task<bool> SetTenant(int tenant)
        {
            _tenantId = tenant;
            return Task.FromResult(true);
        }

        public Task<List<MigrationResult>> ApplyMigrationsToAllTenantsAsync()
        {
            // For design-time, this method is not actively used for applying migrations.
            // It's a mock implementation to satisfy the interface.
            return Task.FromResult(new List<MigrationResult>());
        }
    }
#nullable restore
}
