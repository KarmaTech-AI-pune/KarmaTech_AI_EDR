using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using EDR.Application.Services;
using System.Threading.Tasks;
using EDR.Domain.Services;
using System.Collections.Generic;
using System.Linq;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;
using System.Text.Json;
using System;

namespace EDR.API.Middleware
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

            if (context.Request.Path.StartsWithSegments(("/health")))
            {
                _logger.LogDebug("Healthy");
                await _next(context);
                return;
            }
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

                    var tenant = await tenantService.GetTenantByIdentifierAsync(tenantIdentifier);
                    if (tenant == null)
                    {
                        _logger.LogWarning("No tenant found for identifier: {TenantIdentifier}", tenantIdentifier);
                        continue;
                    }

                    // Defer tenant status and subscription/trial validity check to TenantMiddleware
                    // which runs after authentication and can handle bypasses for SuperAdmins.

                    _logger.LogInformation("Resolved tenant ID: {TenantId} for identifier: {TenantIdentifier}", 
                        tenant.Id, tenantIdentifier);

                    // Set tenant info in context
                    context.Items["TenantId"] = tenant.Id;
                    context.Items["Tenant"] = tenant;
                    _logger.LogDebug("Set TenantId in HttpContext.Items: {TenantId}", tenant.Id);

                    // Set up current tenant service
                    await currentTenantService.SetTenant(tenant.Id);
                    _logger.LogInformation("Successfully configured tenant: {TenantId}", tenant.Id);
                    
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

        private async Task HandleBlockedTenantResponse(HttpContext context, string message, string errorCode)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            
            var response = new 
            { 
                success = false, 
                message = message, 
                errorCode = errorCode 
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
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
