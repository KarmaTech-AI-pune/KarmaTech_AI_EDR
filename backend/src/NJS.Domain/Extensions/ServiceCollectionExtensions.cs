using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Events;
using NJS.Domain.GenericRepository;
using NJS.Domain.Models;
using NJS.Domain.Services;
using NJS.Domain.UnitWork;

namespace NJS.Domain.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddAndMigrateTenantDatabases(this IServiceCollection services, IConfiguration configuration)
        {
            try
            {
                // Central database migrations
                using (var scopeTenant = services.BuildServiceProvider().CreateScope())
                {
                    var baseDbContext = scopeTenant.ServiceProvider.GetRequiredService<TenantDbContext>();
                    
                    if (baseDbContext.Database.GetPendingMigrations().Any())
                    {
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.WriteLine("Applying Central Database Migrations...");
                        Console.ResetColor();
                        baseDbContext.Database.Migrate();
                        Console.WriteLine("Central Database Migrations completed successfully.");
                    }

                    // Get all tenant configurations
                    var tenantsInDb = baseDbContext.TenantDatabases.ToList();
                    var defaultConnectionString = configuration.GetConnectionString("AppDbConnection");

                    // Tenant-specific database migrations
                    foreach (var tenant in tenantsInDb)
                    {
                        try
                        {
                            string connectionString = !string.IsNullOrEmpty(tenant.ConnectionString) 
                                ? tenant.ConnectionString 
                                : defaultConnectionString;

                            using (var scopeApplication = services.BuildServiceProvider().CreateScope())
                            {
                                var dbContext = scopeApplication.ServiceProvider.GetRequiredService<ProjectManagementContext>();
                                
                                // Configure context for this tenant
                                dbContext.Database.SetConnectionString(connectionString);

                                if (dbContext.Database.GetPendingMigrations().Any())
                                {
                                    Console.ForegroundColor = ConsoleColor.Blue;
                                    Console.WriteLine($"Applying Migrations for tenant '{tenant.Id}'...");
                                    Console.ResetColor();
                                    
                                    dbContext.Database.Migrate();
                                    Console.WriteLine($"Migrations for tenant '{tenant.Id}' completed successfully.");
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            // Log the error but continue with other tenants
                            Console.ForegroundColor = ConsoleColor.Red;
                            Console.WriteLine($"Error applying migrations for tenant '{tenant.Id}': {ex.Message}");
                            Console.ResetColor();
                            continue;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"Error in database migration process: {ex.Message}");
                Console.ResetColor();
                throw; // Rethrow as this is a critical startup error
            }

            return services;
        }
        public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<ICurrentTenantService, CurrentTenantService>();        
            

            // Register ProjectManagementContext after tenant services
            services.AddDbContext<ProjectManagementContext>((provider, options) =>
            {
                var tenantService = provider.GetService<ICurrentTenantService>();
                var connectionString = tenantService?.ConnectionString ?? configuration.GetConnectionString("AppDbConnection");

                options.UseSqlServer(connectionString,
                    sqlServerOptionsAction: sqlOptions =>
                    {
                        sqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null);
                    });

                // Add audit interceptor if audit services are available
                var auditSubject = provider.GetService<IAuditSubject>();
                var auditContext = provider.GetService<NJS.Domain.Services.IAuditContext>();
                
                if (auditSubject != null && auditContext != null)
                {
                    options.AddInterceptors(new NJS.Domain.Interceptors.AuditSaveChangesInterceptor(auditSubject, auditContext));
                }
            });
            services.AddHttpContextAccessor();


            services.AddIdentity<User, Role>()
                .AddEntityFrameworkStores<ProjectManagementContext>()
                .AddDefaultTokenProviders();

            // Register UnitOfWork
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Register generic repository
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

            services.Configure<EmailSettings>(options =>
            {
                configuration.GetSection(EmailSettings.SectionName).Bind(options);

            });
           // services.AddScoped<ITenantConnectionResolver, TenantConnectionResolver>();
           
            return services;
        }       
    }
}
