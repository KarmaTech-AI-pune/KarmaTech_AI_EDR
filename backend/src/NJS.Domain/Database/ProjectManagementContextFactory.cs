using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using NJS.Domain.Services;

namespace NJS.Domain.Database
{
    public class ProjectManagementContextFactory : IDesignTimeDbContextFactory<ProjectManagementContext>
    {
        private readonly ITenantConnectionResolver? _connectionResolver;
        private readonly IHttpContextAccessor? _httpContextAccessor;
        private readonly IConfiguration? _configuration;

        // This constructor is used during runtime by DI
        public ProjectManagementContextFactory(
            ITenantConnectionResolver connectionResolver,
            IHttpContextAccessor httpContextAccessor,
            IConfiguration configuration)
        {
            _connectionResolver = connectionResolver;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }

        // This parameterless constructor is used by EF Core design-time tools
        public ProjectManagementContextFactory()
        {
            // These will be null during design-time operations
            _connectionResolver = null;
            _httpContextAccessor = null;
            _configuration = null;
        }

        public ProjectManagementContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ProjectManagementContext>();

            // For design-time operations (migrations, etc.), use configuration from appsettings.json
            if (_configuration == null)
            {
                // When running from command line, build configuration manually
                // Get the absolute path to the NJSAPI project directory
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
                optionsBuilder.UseSqlServer(connectionString);
            }
            else
            {
                // During runtime, use injected configuration
                var connectionString = _configuration.GetConnectionString("AppDbConnection");
                if (string.IsNullOrEmpty(connectionString))
                {
                    throw new InvalidOperationException("Connection string 'AppDbConnection' not found in configuration");
                }
                optionsBuilder.UseSqlServer(connectionString);
            }

            return new ProjectManagementContext(optionsBuilder.Options, _httpContextAccessor);
        }

        public async Task<ProjectManagementContext> CreateTenantDbContextAsync()
        {
            if (_connectionResolver == null || _httpContextAccessor == null)
            {
                throw new InvalidOperationException("This method cannot be called during design-time operations.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<ProjectManagementContext>();

            // Get tenant info from the current request
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                throw new Exception("HttpContext is not available");
            }

            // Try to get tenant ID from the request
            if (httpContext.Items.TryGetValue("TenantId", out var tenantIdObj) && tenantIdObj is int tenantId)
            {
                var connectionString = await _connectionResolver.GetConnectionStringAsync(tenantId);
                optionsBuilder.UseSqlServer(connectionString);
            }
            else
            {
                // Try to get tenant from domain
                var host = httpContext.Request.Host.Value;
                var domain = host.Split('.')[0]; // Extract subdomain
                var connectionString = await _connectionResolver.GetConnectionStringByDomainAsync(domain);
                optionsBuilder.UseSqlServer(connectionString);
            }

            return new ProjectManagementContext(optionsBuilder.Options, _httpContextAccessor);
        }
    }
}