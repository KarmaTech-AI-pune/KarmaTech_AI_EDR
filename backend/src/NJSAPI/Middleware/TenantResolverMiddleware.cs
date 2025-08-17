using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<TenantResolverMiddleware> _logger;

        public TenantResolverMiddleware(
            RequestDelegate next,
            IEnumerable<ITenantResolutionStrategy> resolutionStrategies,
            ILogger<TenantResolverMiddleware> logger)
        {
            _next = next;
            _resolutionStrategies = resolutionStrategies;
            _logger = logger;
        }

        public async Task InvokeAsync(
            HttpContext context,
            ITenantService tenantService,
            ICurrentTenantService currentTenantService)
        {
            _logger.LogDebug("Processing request: {Path}", context.Request.Path);

            //if (IsAuthenticationEndpoint(context.Request.Path))
            //{
            //    _logger.LogDebug("Skipping tenant resolution for authentication endpoint: {Path}", context.Request.Path);
            //    await _next(context);
            //    return;
            //}

            try
            {
                // Try each resolution strategy in order
                foreach (var strategy in _resolutionStrategies)
                {
                    _logger.LogDebug("Attempting tenant resolution using strategy: {StrategyType}", strategy.GetType().Name);
                    
                    var tenantIdentifier = await strategy.GetTenantIdentifierAsync();
                    if (string.IsNullOrEmpty(tenantIdentifier))
                    {
                        _logger.LogDebug("No tenant identifier found using {StrategyType}", strategy.GetType().Name);
                        continue;
                    }

                    _logger.LogInformation("Found tenant identifier: {TenantIdentifier} using {StrategyType}", 
                        tenantIdentifier, strategy.GetType().Name);

                    var tenantId = await tenantService.GetTenantId(tenantIdentifier);
                    if (!tenantId.HasValue)
                    {
                        _logger.LogWarning("No tenant found for identifier: {TenantIdentifier}", tenantIdentifier);
                        continue;
                    }

                    _logger.LogInformation("Resolved tenant ID: {TenantId} for identifier: {TenantIdentifier}", 
                        tenantId.Value, tenantIdentifier);

                    // Set tenant info in context
                    context.Items["TenantId"] = tenantId.Value;
                    _logger.LogDebug("Set TenantId in HttpContext.Items: {TenantId}", tenantId.Value);

                    // Set up current tenant service
                    await currentTenantService.SetTenant(tenantId.Value);
                    _logger.LogInformation("Successfully configured tenant: {TenantId}", tenantId.Value);
                    
                    break;
                }

                if (!context.Items.ContainsKey("TenantId"))
                {
                    _logger.LogWarning("No tenant was resolved for request: {Path}", context.Request.Path);
                }

                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during tenant resolution for request: {Path}", context.Request.Path);
                throw;
            }
        }

        private bool IsAuthenticationEndpoint(PathString path)
        {
            var isAuthEndpoint = path.StartsWithSegments("/api/user/login") || 
                                path.StartsWithSegments("/api/user/register") ||
                                path.StartsWithSegments("/api/auth");

            if (isAuthEndpoint)
            {
                _logger.LogDebug("Path {Path} identified as authentication endpoint", path);
            }

            return isAuthEndpoint;
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