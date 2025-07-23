using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using NJS.Application.Services;
using System.Threading.Tasks;
using NJS.Repositories.Interfaces;

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
            var domain = await tenantService.GetTenantDomain();
            var tenantId = await tenantService.GetTenantId(domain);

            if (tenantId.HasValue)
            {
                context.Items["TenantId"] = tenantId.Value;
            }

            await _next(context);
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
