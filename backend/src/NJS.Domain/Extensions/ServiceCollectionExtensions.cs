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
        public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ProjectManagementContext>((provider, options) =>
            {
                options.UseSqlServer(configuration.GetConnectionString("AppDbConnection"),
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
            return services;
        }       
    }
}
