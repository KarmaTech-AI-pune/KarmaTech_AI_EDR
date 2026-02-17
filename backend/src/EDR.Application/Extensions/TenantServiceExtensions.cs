using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using EDR.Application.Services;
using EDR.Domain.Database;
using EDR.Repositories.Interfaces;

namespace EDR.Application.Extensions
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

