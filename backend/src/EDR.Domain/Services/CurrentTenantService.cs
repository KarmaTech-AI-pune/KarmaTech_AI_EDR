using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using EDR.Domain.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EDR.Domain.Entities;

namespace EDR.Domain.Services
{
    #nullable enable
    public class CurrentTenantService : ICurrentTenantService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly TenantDbContext _context;
        private readonly ILogger<CurrentTenantService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IConfiguration _configuration;
        private int? _tenantId;
        private string? _connectionString;

        public int? TenantId 
        { 
            get => _tenantId ?? GetTenantIdFromContext();
            set => _tenantId = value;
        }
        
        public string? ConnectionString 
        { 
            get => _connectionString;
            set => _connectionString = value;
        }

        public CurrentTenantService(
            IHttpContextAccessor httpContextAccessor,
            TenantDbContext context,
            ILogger<CurrentTenantService> logger,
            IServiceProvider serviceProvider,
            IConfiguration configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            _context = context;
            _logger = logger;
            _serviceProvider = serviceProvider;
            _configuration = configuration;
            _logger.LogInformation("CurrentTenantService initialized");
        }

        private int? GetTenantIdFromContext()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            _logger.LogDebug("Getting tenant ID from HttpContext");

            if (httpContext == null)
            {
                _logger.LogDebug("HttpContext is null when trying to get tenant ID");
                return null;
            }

            if (httpContext.Items.TryGetValue("TenantId", out var tenantId))
            {
                var resolvedTenantId = tenantId as int?;
                _logger.LogInformation("Resolved tenant ID from context: {TenantId}", resolvedTenantId);
                return resolvedTenantId;
            }

            _logger.LogDebug("No tenant ID found in HttpContext.Items");
            return null;
        }

        public async Task<bool> SetTenant(int tenant)
        {
            _logger.LogInformation("Attempting to set tenant ID: {TenantId}", tenant);

            try
            {
                var tenantInfo = await _context.Tenants.Where(x => x.Id == tenant).FirstOrDefaultAsync();
                if (tenantInfo == null)
                {
                    _logger.LogWarning("Tenant not found with ID: {TenantId}", tenant);
                    return false;
                }

                if (tenantInfo.IsBlocked)
                {
                    _logger.LogWarning("Tenant {TenantId} is blocked. Reason: {Reason}", tenant, tenantInfo.BlockReason);
                    return false;
                }

                var tenantDb = await _context.TenantDatabases.Where(x => x.TenantId == tenantInfo.Id).FirstOrDefaultAsync();
                if (tenantDb == null)
                {
                    _logger.LogWarning("No database configuration found for tenant: {TenantId}", tenant);
                    return false;
                }

                _tenantId = tenant;
                _connectionString = tenantDb.ConnectionString;
                
                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext != null)
                {
                    httpContext.Items["TenantId"] = tenant;
                    _logger.LogDebug("Set TenantId in HttpContext.Items: {TenantId}", tenant);
                }
                else
                {
                    _logger.LogDebug("HttpContext is null, could not set TenantId in Items");
                }
                
                _logger.LogInformation("Successfully set tenant ID: {TenantId} with connection string: {ConnectionStringStart}...", 
                    tenant, 
                    _connectionString?.Substring(0, Math.Min(_connectionString?.Length ?? 0, 30)));

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting tenant ID: {TenantId}", tenant);
                throw;
            }
        }

        public async Task<List<MigrationResult>> ApplyMigrationsToAllTenantsAsync()
        {
            var results = new List<MigrationResult>();
            var tenants = await _context.TenantDatabases.ToListAsync();

            foreach (var tenant in tenants)
            {
                var tenantResult = new MigrationResult { TenantId = tenant.Id };
                try
                {
                    string connectionString = !string.IsNullOrEmpty(tenant.ConnectionString)
                        ? tenant.ConnectionString
                        : _configuration.GetConnectionString("AppDbConnection");

                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
                    dbContext.Database.SetConnectionString(connectionString);

                    var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();

                    if (pendingMigrations.Any())
                    {
                        _logger.LogInformation($"Applying {pendingMigrations.Count()} migration(s) to tenant {tenant.Id}");
                        await dbContext.Database.MigrateAsync();
                        tenantResult.Success = true;
                        tenantResult.Message = $"Applied {pendingMigrations.Count()} migration(s)";
                    }
                    else
                    {
                        tenantResult.Success = true;
                        tenantResult.Message = "No pending migrations";
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error applying migrations to tenant {tenant.Id}");
                    tenantResult.Success = false;
                    tenantResult.Message = ex.Message;
                }
                results.Add(tenantResult);
            }
            return results;
        }
    }
}

