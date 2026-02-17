using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using EDR.Domain.Services;
using EDR.Domain;
using EDR.Domain.Entities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using EDR.Domain.Entities; // Added for MigrationResult

namespace EDR.Domain.Database
{
    // Factory for TenantDbContext
    public class TenantDbContextFactory : IDesignTimeDbContextFactory<TenantDbContext>
    {
        public TenantDbContext
            CreateDbContext(string[] args) 
        {
            // Build the configuration by reading from the appsettings.json file (requires Microsoft.Extensions.Configuration.Json Nuget Package)
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            DbContextOptionsBuilder<TenantDbContext> optionsBuilder = new();

            string connectionString;
            if (configuration[Constants.DbType] == Constants.DbServerType)
            {
                connectionString = configuration.GetConnectionString("AppDbConnection");
                if (string.IsNullOrEmpty(connectionString))
                {
                    throw new InvalidOperationException(
                        "Connection string 'AppDbConnection' not found in appsettings.json");
                }

                _ = optionsBuilder.UseNpgsql(connectionString);
            }
            else
            {
                connectionString = configuration.GetConnectionString("SqlDbConnection");
                if (string.IsNullOrEmpty(connectionString))
                {
                    throw new InvalidOperationException(
                        "Connection string 'SqlDbConnection' not found in appsettings.json");
                }

                _ = optionsBuilder.UseSqlServer(connectionString);
            }


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
            var startupProjectPath = Path.Combine(solutionDir, "EDR.API");

            var configuration = new ConfigurationBuilder()
                .SetBasePath(startupProjectPath)
                .AddJsonFile(Path.Combine(startupProjectPath, "appsettings.json"))
                .AddJsonFile(Path.Combine(startupProjectPath, "appsettings.Development.json"), optional: true)
                .Build();

            string connectionString = string.Empty;

            var optionsBuilder = new DbContextOptionsBuilder<ProjectManagementContext>();
            if (configuration[Constants.DbType] == Constants.DbServerType)
            {
                connectionString = configuration.GetConnectionString("AppDbConnection");

                if (string.IsNullOrEmpty(connectionString))
                {
                    throw new InvalidOperationException(
                        "Connection string 'AppDbConnection' not found in appsettings.json");
                }

                optionsBuilder.UseNpgsql(connectionString);
            }
            else
            {
                connectionString = configuration.GetConnectionString("SqlDbConnection");

                if (string.IsNullOrEmpty(connectionString))
                {
                    throw new InvalidOperationException(
                        "Connection string 'SqlDbConnection' not found in appsettings.json");
                }

                optionsBuilder.UseSqlServer(connectionString);
            }


            // Create a mock tenant service for design-time operations
            var mockTenantService = new DesignTimeTenantService(connectionString);

            return new ProjectManagementContext(optionsBuilder.Options, mockTenantService, configuration);
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
