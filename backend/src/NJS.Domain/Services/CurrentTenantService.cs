using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Domain.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Services
{
    #nullable enable
    public class CurrentTenantService : ICurrentTenantService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly TenantDbContext _context;
        private readonly ILogger<CurrentTenantService> _logger;
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
            ILogger<CurrentTenantService> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _context = context;
            _logger = logger;
            _logger.LogInformation("CurrentTenantService initialized");
        }

        private int? GetTenantIdFromContext()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            _logger.LogDebug("Getting tenant ID from HttpContext");

            if (httpContext == null)
            {
                _logger.LogWarning("HttpContext is null when trying to get tenant ID");
                return null;
            }

            if (httpContext.Items.TryGetValue("TenantId", out var tenantId))
            {
                var resolvedTenantId = tenantId as int?;
                _logger.LogInformation("Resolved tenant ID from context: {TenantId}", resolvedTenantId);
                return resolvedTenantId;
            }

            _logger.LogWarning("No tenant ID found in HttpContext.Items");
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
                    throw new Exception($"Tenant not found with ID: {tenant}");
                }

                var tenantDb = await _context.TenantDatabases.Where(x => x.TenantId == tenantInfo.Id).FirstOrDefaultAsync();
                if (tenantDb == null)
                {
                    _logger.LogWarning("No database configuration found for tenant: {TenantId}", tenant);
                    throw new Exception($"No database configuration found for tenant: {tenant}");
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
                    _logger.LogWarning("HttpContext is null, could not set TenantId in Items");
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
    }
}
