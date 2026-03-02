using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Events;
using EDR.Domain.GenericRepository;
using EDR.Domain.Models;
using EDR.Domain.Services;
using EDR.Domain.UnitWork;
using EDR.Domain;

namespace EDR.Domain.Extensions
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
                    
                    var dbType = configuration[Constants.DbType];
                    if (dbType == Constants.DbServerType)
                    {
                         var connectionString = configuration.GetConnectionString("AppDbConnection");
                         var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
                         optionsBuilder.UseNpgsql(connectionString, b => b.MigrationsAssembly("EDR.Domain"));
                         baseDbContext.Database.SetConnectionString(connectionString);
                    }
                    else
                    {
                         var connectionString = configuration.GetConnectionString("SqlDbConnection");
                         var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
                         optionsBuilder.UseSqlServer(connectionString, b => b.MigrationsAssembly("EDR.Domain"));
                         baseDbContext.Database.SetConnectionString(connectionString);
                    }

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
                                if (dbType == Constants.DbServerType)
                                {
                                     var optionsBuilder = new DbContextOptionsBuilder<ProjectManagementContext>();
                                     optionsBuilder.UseNpgsql(connectionString, b => b.MigrationsAssembly("EDR.Domain"));
                                     dbContext.Database.SetConnectionString(connectionString);
                                }
                                else
                                {
                                     var optionsBuilder = new DbContextOptionsBuilder<ProjectManagementContext>();
                                     optionsBuilder.UseSqlServer(connectionString, b => b.MigrationsAssembly("EDR.Domain"));
                                     dbContext.Database.SetConnectionString(connectionString);
                                }
                                
                                // Note: SetConnectionString might not be enough if the provider changes (which shouldn't happen for a single run)
                                // But since we are resolving the service, it's already configured in AddDatabaseServices.
                                // However, AddAndMigrateTenantDatabases builds a temporary ServiceProvider. 
                                // The issue is that GetRequiredService<ProjectManagementContext> uses the options configured in AddDatabaseServices.
                                // In AddDatabaseServices, we use ITenantConnectionResolver which might not be available or fully set up in this isolated scope?
                                // Actually, AddDatabaseServices is called AFTER AddAndMigrateTenantDatabases in Program.cs (usually). 
                                // Wait, AddAndMigrateTenantDatabases is usually called after AddInfrastructure/AddPersistence.
                                
                                // Let's look at Program.cs again. 
                                // It seems AddAndMigrateTenantDatabases is NOT called in Program.cs provided earlier? 
                                // I see builder.Services.AddDatabaseServices(builder.Configuration);
                                // but not AddAndMigrateTenantDatabases.
                                
                                // Ah, AddAndMigrateTenantDatabases is an extension method. Let's check where it is called.
                                // Searching for usage of AddAndMigrateTenantDatabases...
                                
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
            services.AddHttpContextAccessor();
            services.AddScoped<ICurrentTenantService, CurrentTenantService>();        
            

            // Register ProjectManagementContext after tenant services
            services.AddDbContext<ProjectManagementContext>((provider, options) =>
            {
                var tenantConnectionResolver = provider.GetService<ITenantConnectionResolver>();
                // Use the default connection string during service registration.
                // The actual tenant-specific connection will be resolved at runtime by TenantConnectionResolver.
                if (configuration[Constants.DbType] == Constants.DbServerType)
                {
                    var connectionString = tenantConnectionResolver?.GetDefaultConnectionStringAsync().Result ?? configuration.GetConnectionString("AppDbConnection");
                    options.UseNpgsql(connectionString, b => b.MigrationsAssembly("EDR.Domain"));
                }
                else
                {
                    var connectionString = tenantConnectionResolver?.GetDefaultConnectionStringAsync().Result ?? configuration.GetConnectionString("SqlDbConnection");
                    options.UseSqlServer(connectionString,
                        sqlServerOptionsAction: sqlOptions =>
                        {
                            sqlOptions.MigrationsAssembly("EDR.Domain");
                            sqlOptions.EnableRetryOnFailure(
                                maxRetryCount: 5,
                                maxRetryDelay: TimeSpan.FromSeconds(30),
                                errorNumbersToAdd: null);
                        });
                }

                // Add audit interceptor if audit services are available
                var auditSubject = provider.GetService<IAuditSubject>();
                var auditContext = provider.GetService<EDR.Domain.Services.IAuditContext>();
                
                if (auditSubject != null && auditContext != null)
                {
                    options.AddInterceptors(new EDR.Domain.Interceptors.AuditSaveChangesInterceptor(auditSubject, auditContext));
                }
            });


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

        public static DbContextOptionsBuilder UseConfiguredDatabase(
            this DbContextOptionsBuilder builder,
            IConfiguration configuration,
            string connectionString)
        {
            var dbType = configuration[Constants.DbType];
            return dbType switch
            {
                Constants.DbServerType => builder.UseNpgsql(connectionString, b => b.MigrationsAssembly("EDR.Domain")),
                _ => builder.UseSqlServer(connectionString, b => b.MigrationsAssembly("EDR.Domain"))
            };
        }
    }
}


