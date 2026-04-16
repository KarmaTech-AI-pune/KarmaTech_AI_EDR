using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using EDR.Repositories.Interfaces;
using System.Security.Claims;
using System.Linq;
using System;
using Microsoft.Extensions.Logging;

namespace EDR.Application.Services
{
    public class TenantService : ITenantService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly TenantDbContext _tenantDbContext;
        private readonly IServiceProvider _serviceProvider;

        public int? TenantId { get; set; }

        public TenantService(
            IHttpContextAccessor httpContextAccessor, 
            TenantDbContext tenantDbContext,
            IServiceProvider serviceProvider)
        {
            _httpContextAccessor = httpContextAccessor;
            _tenantDbContext = tenantDbContext;
            _serviceProvider = serviceProvider;
        }

        public async Task<string> GetTenantDomain()
        {
            return _httpContextAccessor.HttpContext?.Request.Host.Value ?? string.Empty;
        }

        public async Task<int?> GetTenantId(string domain)
        {
            var tenant = await _tenantDbContext.Tenants
                .FirstOrDefaultAsync(t => t.Domain == domain);

            if (tenant == null && int.TryParse(domain, out var tenantId))
            {
                tenant = await _tenantDbContext.Tenants
                    .FirstOrDefaultAsync(t => t.Id == tenantId);
            }

            return tenant?.Id;
        }

        public async Task<int?> GetCurrentTenantIdAsync()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
                return null;

            // First, try to get tenant ID from JWT claims (most reliable)
            var tenantIdFromClaims = GetTenantIdFromClaims();
            if (tenantIdFromClaims.HasValue && tenantIdFromClaims.Value > 0)
            {
                return tenantIdFromClaims.Value;
            }

            // Check if tenant ID is already set in the context
            if (httpContext.Items.TryGetValue("TenantId", out var tenantId))
            {
                return tenantId as int?;
            }

            var tenantDomain = await GetCurrentTenantDomain();
            if (string.IsNullOrEmpty(tenantDomain))
                return null;

            var tenant = await _tenantDbContext.Tenants.FirstOrDefaultAsync(t => t.Domain == tenantDomain);
            if (tenant != null)
            {
                httpContext.Items["TenantId"] = tenant.Id;
                httpContext.Items["TenantDomain"] = tenant.Domain;
                return tenant.Id;
            }

            return null;
        }

        public async Task<string> GetCurrentTenantDomain()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
                return string.Empty;

            // First, try to get tenant domain from JWT claims
            var tenantDomainFromClaims = GetTenantDomainFromClaims();
            if (!string.IsNullOrEmpty(tenantDomainFromClaims))
            {
                return tenantDomainFromClaims;
            }

            var tenantContext = httpContext.Request.Headers["X-Tenant-Context"].FirstOrDefault();
            if (!string.IsNullOrEmpty(tenantContext))
            {
                return tenantContext;
            }

            // Fallback to host-based tenant resolution
            return httpContext.Request.Host.Value ?? string.Empty;
        }

        public async Task<bool> SetTenantContextAsync(string tenantDomain)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
                return false;

            var tenants = _tenantDbContext.Tenants.ToList();
            var selectedTenant = tenants.FirstOrDefault(t => 
                t.Domain.Equals(tenantDomain, StringComparison.OrdinalIgnoreCase) || 
                t.Id.ToString() == tenantDomain);

            if (selectedTenant == null)
            {
                return false;
            }

            var tenant = selectedTenant;

            httpContext.Items["TenantId"] = tenant.Id;
            httpContext.Items["TenantDomain"] = tenant.Domain;
            httpContext.Items["Tenant"] = tenant;

            TenantId = tenant.Id;

            try
            {
                var currentTenantService = _serviceProvider.GetService<ICurrentTenantService>();
                if (currentTenantService != null)
                {
                    await currentTenantService.SetTenant(tenant.Id);
                    var projectContext = _serviceProvider.GetService<ProjectManagementContext>();
                    if (projectContext != null && !string.IsNullOrEmpty(currentTenantService.ConnectionString))
                    {
                        projectContext.Database.SetConnectionString(currentTenantService.ConnectionString);
                    }
                }
            }
            catch (Exception ex)
            {
                // Log or ignore if services aren't registered, but this is critical for DB switching
            }

            return true;
        }

        // New methods for JWT claim extraction
        public int? GetTenantIdFromClaims()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
                return null;

            var tenantIdClaim = httpContext.User.FindFirst("TenantId");
            if (tenantIdClaim != null && int.TryParse(tenantIdClaim.Value, out var tenantId))
            {
                return tenantId;
            }

            return null;
        }

        public string GetTenantDomainFromClaims()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
                return string.Empty;

            var tenantDomainClaim = httpContext.User.FindFirst("TenantDomain");
            return tenantDomainClaim?.Value ?? string.Empty;
        }

        public string GetUserTypeFromClaims()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
                return string.Empty;

            var userTypeClaim = httpContext.User.FindFirst("UserType");
            return userTypeClaim?.Value ?? string.Empty;
        }

        public string GetTenantRoleFromClaims()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
                return string.Empty;

            var tenantRoleClaim = httpContext.User.FindFirst("TenantRole");
            return tenantRoleClaim?.Value ?? string.Empty;
        }

        public bool IsSuperAdminFromClaims()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
                return false;

            var isSuperAdminClaim = httpContext.User.FindFirst("IsSuperAdmin");
            return isSuperAdminClaim?.Value == "true";
        }

        public async Task<Tenant?> GetTenantByIdentifierAsync(string identifier)
        {
            if (string.IsNullOrEmpty(identifier))
                return null;

            var tenant = await _tenantDbContext.Tenants
                .FirstOrDefaultAsync(t => t.Domain == identifier);

            // If not found, try extracting the subdomain
            if (tenant == null && identifier.Contains('.'))
            {
                var subDomain = identifier.Split('.')[0];
                tenant = await _tenantDbContext.Tenants
                    .FirstOrDefaultAsync(t => t.Domain == subDomain);
            }

            if (tenant == null && int.TryParse(identifier, out var tenantId))
            {
                tenant = await _tenantDbContext.Tenants
                    .FirstOrDefaultAsync(t => t.Id == tenantId);
            }

            return tenant;
        }

        public async Task<Tenant> GetCurrentTenantAsync()
        {
            var tenantId = await GetCurrentTenantIdAsync();
            if (!tenantId.HasValue)
                return null;

            return await _tenantDbContext.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId.Value);
        }

        public async Task<bool> ValidateTenantAccessAsync(string userId, int tenantId)
        {
            // For super admin (System Admin), allow access to any tenant
            if (IsSuperAdminFromClaims())
                return true;

            // For regular users, first check if they belong to explicit cross-tenant mappings
            bool hasExplicitMapping = await _tenantDbContext.TenantUsers
                .AnyAsync(tu => tu.UserId == userId && tu.TenantId == tenantId && tu.IsActive);

            if (hasExplicitMapping)
            {
                return true;
            }

            // If no explicit mapping, fallback to checking their primary TenantId inside the User table
            try
            {
                var projectContext = _serviceProvider.GetRequiredService<ProjectManagementContext>();

                var logger = _serviceProvider.GetService<Microsoft.Extensions.Logging.ILogger<TenantService>>();
                logger?.LogInformation("ValidateTenantAccessAsync checking primary mapping for User {UserId} in Tenant {TenantId}", userId, tenantId);

                // Just to be absolutely safe that the connection string is correctly propagating
                var currentTenantService = _serviceProvider.GetService<ICurrentTenantService>();
                if (currentTenantService != null && !string.IsNullOrEmpty(currentTenantService.ConnectionString))
                {
                    projectContext.Database.SetConnectionString(currentTenantService.ConnectionString);
                }

                bool hasPrimaryMapping = await projectContext.Users
                    .IgnoreQueryFilters()
                    .AnyAsync(u => u.Id == userId && u.TenantId == tenantId && u.IsActive);

                if (hasPrimaryMapping)
                {
                    logger?.LogInformation("User {UserId} HAS primary mapping for Tenant {TenantId}", userId, tenantId);
                    return true;
                }
                logger?.LogWarning("User {UserId} does NOT have primary mapping for Tenant {TenantId}", userId, tenantId);
            }
            catch (Exception ex)
            {
                var logger = _serviceProvider.GetService<Microsoft.Extensions.Logging.ILogger<TenantService>>();
                logger?.LogError(ex, "Error while checking primary mapping for User {UserId} in Tenant {TenantId}", userId, tenantId);
            }

            return false;
        }

        public async Task<List<TenantUser>> GetTenantUsersByUserIdAsync(string userId)
        {
            return await _tenantDbContext.TenantUsers
                .Where(tu => tu.UserId == userId)
                .Include(tu => tu.Tenant)
                .ToListAsync();
        }
    }
}


