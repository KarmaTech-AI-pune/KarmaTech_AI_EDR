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
        try
        {
            if (context.User.Identity?.IsAuthenticated==true)
            {
                var tenantId = tenantResolver.GetTenantIdFromClaims();
                if (tenantId.HasValue)
                {
                    await currentTenantService.SetTenant(tenantId.Value);
                    _logger.LogInformation("Tenant context set for request. TenantId: {TenantId}", tenantId.Value);
                }
            }
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,"Error setting tenant context");
        }
    }
}
