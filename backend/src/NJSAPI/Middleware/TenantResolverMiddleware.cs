using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using NJS.Application.Services;
using System.Threading.Tasks;
using NJS.Domain.Services;
using System.Collections.Generic;
using System.Linq;
using NJS.Repositories.Interfaces;

namespace NJSAPI.Middleware
{
    public class TenantResolverMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IEnumerable<ITenantResolutionStrategy> _resolutionStrategies;

        public TenantResolverMiddleware(
            RequestDelegate next,
            IEnumerable<ITenantResolutionStrategy> resolutionStrategies)
        {
            _next = next;
            _resolutionStrategies = resolutionStrategies;
        }

        public async Task InvokeAsync(
            HttpContext context,
            ITenantService tenantService,
            ICurrentTenantService currentTenantService)
        {
            if (IsAuthenticationEndpoint(context.Request.Path))
            {
                await _next(context);
                return;
            }

            // Try each resolution strategy in order
            foreach (var strategy in _resolutionStrategies)
            {
                var tenantIdentifier = await strategy.GetTenantIdentifierAsync();
                if (!string.IsNullOrEmpty(tenantIdentifier))
                {
                    var tenantId = await tenantService.GetTenantId(tenantIdentifier);
                    if (tenantId.HasValue)
                    {
                        // Set tenant info in context
                        context.Items["TenantId"] = tenantId.Value;
                        
                        // Set up current tenant service
                        await currentTenantService.SetTenant(tenantId.Value);
                        
                        break;
                    }
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