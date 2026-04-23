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
                    // 1. Establish tenant context first (sets connection string for further checks)
                    var tenantSet = await currentTenantService.SetTenant(tenantId.Value);
                    if (!tenantSet)
                    {
                        var tenantInfo = await tenantResolver.GetTenantByIdentifierAsync(tenantId.Value.ToString());
                        string reason = tenantInfo?.IsBlocked == true ? "Tenant is blocked: " + tenantInfo.BlockReason : "Tenant not found or database not configured.";
                        
                        _logger.LogWarning("Failed to set tenant context for TenantId: {TenantId}. Reason: {Reason}", tenantId.Value, reason);
                        
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await context.Response.WriteAsJsonAsync(new 
                        { 
                            success = false, 
                            message = "Access denied: " + reason,
                            errorCode = "TENANT_CONTEXT_ERROR"
                        });
                        return;
                    }

                    _logger.LogInformation("Tenant context established for TenantId: {TenantId}", tenantId.Value);

                    var isSuperAdmin = tenantResolver.IsSuperAdminFromClaims();

                    // 2. Validate if user has active access to this tenant (only for non-super admins)
                    if (!isSuperAdmin)
                    {
                        var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                                     ?? context.User.FindFirst("sub")?.Value;

                        if (!string.IsNullOrEmpty(userId))
                        {
                            var accessResult = await tenantResolver.ValidateTenantAccessAsync(userId, tenantId.Value);
                            if (accessResult != TenantAccessResult.Success)
                            {
                                string message = "Access denied.";
                                string errorCode = "USER_ACCESS_DENIED";

                                if (accessResult == TenantAccessResult.UserInactive)
                                {
                                    message = "Your account for this tenant has been deactivated. Please contact your administrator.";
                                    errorCode = "USER_ACCOUNT_INACTIVE";
                                }
                                else if (accessResult == TenantAccessResult.NoMapping)
                                {
                                    message = "Access denied: You are not assigned to this tenant.";
                                    errorCode = "USER_NOT_ASSIGNED_TO_TENANT";
                                }

                                _logger.LogWarning("ACCESS DENIED ({ErrorCode}): User {UserId} for Tenant {TenantId}", errorCode, userId, tenantId.Value);
                                
                                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                                context.Response.ContentType = "application/json";
                                await context.Response.WriteAsJsonAsync(new 
                                { 
                                    success = false, 
                                    message = message,
                                    errorCode = errorCode
                                });
                                return;
                            }
                        }
                    }
                }
                else
                {
                    _logger.LogWarning("No TenantId claim found for authenticated user.");
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
