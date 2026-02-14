using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NJS.Application.Services;
using NJS.Application.Services.IContract;
using NJS.Domain;
using NJS.Domain.Database;
using NJS.Repositories.Interfaces;

namespace NJS.Application.Extensions
{
    public static class TenantServiceExtensions
    {
        public static IServiceCollection AddTenantServices(this IServiceCollection services, IConfiguration configuration)
        {
           
            var dbType = configuration[Constants.DbType];

            if (dbType == Constants.DbServerType)
            {
                services.AddDbContext<TenantDbContext>(options =>
                    options.UseNpgsql(configuration.GetConnectionString("AppDbConnection"),
                        b => b.MigrationsAssembly("NJS.Domain.Migrations.PostgreSQL")));
                services.AddScoped<ITenantMigrationService, TenantMigrationPostgresSqlService>();  
            }
            else
            {
                services.AddDbContext<TenantDbContext>(options =>
                    options.UseSqlServer(configuration.GetConnectionString("SqlDbConnection"),
                        b => b.MigrationsAssembly("NJS.Domain.Migrations.SqlServer")));
                
                services.AddScoped<ITenantMigrationService, TenantMigrationSqlService>();
            }

            services.AddScoped<ITenantService, TenantService>();
           
            

            return services;
        }
    }
}
