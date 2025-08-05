using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NJS.Application.Services;
using NJS.Domain.Database;
using NJS.Repositories.Interfaces;

namespace NJS.Application.Extensions
{
    public static class TenantServiceExtensions
    {
        public static IServiceCollection AddTenantServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<TenantDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("AppDbConnection")));

            services.AddScoped<ITenantService, TenantService>();

            return services;
        }
    }
}
