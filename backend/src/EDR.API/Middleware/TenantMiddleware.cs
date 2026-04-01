using EDR.Domain.Services;
using EDR.Repositories.Interfaces;

namespace EDR.API.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantMiddleware> _logger;

    public TenantMiddleware(RequestDelegate next, ILogger<TenantMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }


    public async Task Invoke(HttpContext context, ICurrentTenantService currentTenantService,
        ITenantService tenantResolver)
    {
        var path = context.Request.Path.Value?.ToLower() ?? string.Empty;
        
        // Bypass for health check, logout, and login
        if (path.Contains("/health") || path.Contains("/logout") || path.Contains("/login"))
        {
            await _next(context);
            return;
        }

        try
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var tenantId = tenantResolver.GetTenantIdFromClaims();
                if (tenantId.HasValue)
                {
                    var tenant = await tenantResolver.GetTenantByIdentifierAsync(tenantId.Value.ToString());
                    var isSuperAdmin = tenantResolver.IsSuperAdminFromClaims();

                    // 1. Check if tenant is blocked (only for non-super admins)
                    if (!isSuperAdmin && tenant != null && tenant.IsBlocked)
                    {
                        _logger.LogWarning("Access blocked for tenant {TenantId} ({TenantName}). Reason: {Reason}", 
                            tenant.Id, tenant.Name, tenant.BlockReason);
                        
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsJsonAsync(new 
                        { 
                            success = false, 
                            message = tenant.BlockReason,
                            errorCode = tenant.BlockErrorCode
                        });
                        return;
                    }

                    // 2. Validate if user has active access to this tenant (only for non-super admins)
                    if (!isSuperAdmin)
                    {
                        var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                                     ?? context.User.FindFirst("sub")?.Value;

                        if (!string.IsNullOrEmpty(userId))
                        {
                            var hasAccess = await tenantResolver.ValidateTenantAccessAsync(userId, tenantId.Value);
                            if (!hasAccess)
                            {
                                _logger.LogWarning("User {UserId} attempted to access tenant {TenantId} but is inactive or has no mapping.", userId, tenantId.Value);
                                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                                context.Response.ContentType = "application/json";
                                await context.Response.WriteAsJsonAsync(new 
                                { 
                                    success = false, 
                                    message = "Your account is inactive for this tenant. Please contact your administrator.",
                                    errorCode = "USER_INACTIVE_FOR_TENANT"
                                });
                                return;
                            }
                        }
                    }

                    await currentTenantService.SetTenant(tenantId.Value);
                    _logger.LogInformation("Tenant context set for request. TenantId: {TenantId}", tenantId.Value);
                }
            }

            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting tenant context");
        }
    }
}
