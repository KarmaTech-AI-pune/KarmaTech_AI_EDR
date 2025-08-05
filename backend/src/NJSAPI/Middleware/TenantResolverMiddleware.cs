using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using NJS.Application.Services;
using System.Threading.Tasks;
using NJS.Repositories.Interfaces;
using System.Security.Claims;

namespace NJSAPI.Middleware
{
    public class TenantResolverMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantResolverMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
        {
            // Skip tenant resolution for authentication endpoints
            if (IsAuthenticationEndpoint(context.Request.Path))
            {
                await _next(context);
                return;
            }

            // Try to resolve tenant from JWT claims first (most reliable)
            var tenantId = await ResolveTenantFromClaims(context, tenantService);
            
            if (!tenantId.HasValue)
            {
                // Fallback to header-based tenant resolution
                tenantId = await ResolveTenantFromHeaders(context, tenantService);
            }

            if (!tenantId.HasValue)
            {
                // Fallback to host-based tenant resolution
                tenantId = await ResolveTenantFromHost(context, tenantService);
            }

            if (tenantId.HasValue)
            {
                context.Items["TenantId"] = tenantId.Value;
                
                // Also store tenant information for easy access
                var tenant = await tenantService.GetCurrentTenantAsync();
                if (tenant != null)
                {
                    context.Items["Tenant"] = tenant;
                    context.Items["TenantDomain"] = tenant.Domain;
                }
            }

            await _next(context);
        }

        private bool IsAuthenticationEndpoint(PathString path)
        {
            return path.StartsWithSegments("/api/user/login") || 
                   path.StartsWithSegments("/api/user/register") ||
                   path.StartsWithSegments("/api/auth");
        }

        private async Task<int?> ResolveTenantFromClaims(HttpContext context, ITenantService tenantService)
        {
            // Check if user is authenticated and has tenant claims
            if (context.User?.Identity?.IsAuthenticated == true)
            {
                var tenantIdClaim = context.User.FindFirst("TenantId");
                if (tenantIdClaim != null && int.TryParse(tenantIdClaim.Value, out var tenantId))
                {
                    // For super admin (tenantId = 0), we don't set a specific tenant
                    if (tenantId == 0)
                    {
                        return null; // Super admin can access any tenant
                    }
                    
                    // Validate that the tenant exists and user has access
                    if (await tenantService.ValidateTenantAccessAsync(context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value, tenantId))
                    {
                        return tenantId;
                    }
                }
            }
            
            return null;
        }

        private async Task<int?> ResolveTenantFromHeaders(HttpContext context, ITenantService tenantService)
        {
            var tenantContext = context.Request.Headers["X-Tenant-Context"].FirstOrDefault();
            if (!string.IsNullOrEmpty(tenantContext))
            {
                return await tenantService.GetTenantId(tenantContext);
            }
            
            return null;
        }

        private async Task<int?> ResolveTenantFromHost(HttpContext context, ITenantService tenantService)
        {
            var host = context.Request.Host.Value;
            if (!string.IsNullOrEmpty(host))
            {
                return await tenantService.GetTenantId(host);
            }
            
            return null;
        }
    }

    public static class TenantResolverMiddlewareExtensions
    {
        public static IApplicationBuilder UseTenantResolver(
            this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TenantResolverMiddleware>();
        }
    }
}
