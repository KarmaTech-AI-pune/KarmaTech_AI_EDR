using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using NJS.Domain.Services;

namespace NJS.Domain.Database
{
    public class ProjectManagementContextFactory : IDesignTimeDbContextFactory<ProjectManagementContext>
    {
        private readonly ITenantConnectionResolver _connectionResolver;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;

        public ProjectManagementContextFactory(
            ITenantConnectionResolver connectionResolver,
            IHttpContextAccessor httpContextAccessor,
            IConfiguration configuration)
        {
            _connectionResolver = connectionResolver;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }

        public ProjectManagementContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ProjectManagementContext>();
            
            // For design-time operations (migrations, etc.), use the default connection
            var connectionString = _configuration.GetConnectionString("AppDbConnection");
            optionsBuilder.UseSqlServer(connectionString);

            return new ProjectManagementContext(optionsBuilder.Options, _httpContextAccessor);
        }

        public async Task<ProjectManagementContext> CreateTenantDbContextAsync()
        {
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