using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using EDR.Application.Services;
using EDR.Application.Services.IContract;
using EDR.Domain;
using EDR.Domain.Database;
using EDR.Repositories.Interfaces;
namespace EDR.Application.Extensions
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
                        b => b.MigrationsAssembly("EDR.Domain")));
                services.AddScoped<ITenantMigrationService, TenantMigrationService>();  
                services.AddScoped<IDatabaseManagementService, TenantCreationPostgresSqlService>();
            }
            else
            {
                services.AddDbContext<TenantDbContext>(options =>
                    options.UseSqlServer(configuration.GetConnectionString("SqlDbConnection"),
                        b => b.MigrationsAssembly("EDR.Domain")));
                
                services.AddScoped<ITenantMigrationService, TenantMigrationSqlService>();
                services.AddScoped<IDatabaseManagementService, DatabaseManagementService>();
            }

            services.AddScoped<ITenantService, TenantService>();
           
            

            return services;
        }
    }
}



