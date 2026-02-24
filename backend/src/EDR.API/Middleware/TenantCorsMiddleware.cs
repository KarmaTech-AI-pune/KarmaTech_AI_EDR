using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Middleware
{
    public class TenantCorsMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public TenantCorsMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var origin = context.Request.Headers["Origin"].ToString();
            
            // Check if the origin is a tenant subdomain
            if (IsTenantSubdomain(origin))
            {
                // Set CORS headers for tenant subdomains
                context.Response.Headers.Add("Access-Control-Allow-Origin", origin);
                context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
                context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
                
                // Handle preflight requests
                if (context.Request.Method == "OPTIONS")
                {
                    context.Response.StatusCode = 200;
                    return;
                }
            }

            await _next(context);
        }

        private bool IsTenantSubdomain(string origin)
        {
            if (string.IsNullOrEmpty(origin))
                return false;

            // Check if it's a localhost tenant subdomain
            var localhostPatterns = new[]
            {
                "http://tenant1.localhost:",
                "http://tenant2.localhost:",
                "http://tenant3.localhost:",
                "http://tenant4.localhost:",
                "http://tenant5.localhost:",
                "http://companya.localhost:",
                "http://companyb.localhost:",
                "http://companyc.localhost:"
            };

            return localhostPatterns.Any(pattern => origin.StartsWith(pattern));
        }
    }

    public static class TenantCorsMiddlewareExtensions
    {
        public static IApplicationBuilder UseTenantCors(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TenantCorsMiddleware>();
        }
    }
} 
