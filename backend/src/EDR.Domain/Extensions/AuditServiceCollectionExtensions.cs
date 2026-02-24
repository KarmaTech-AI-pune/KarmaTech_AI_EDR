using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using EDR.Domain.Database;
using EDR.Domain.Events;
using EDR.Domain.Services;

namespace EDR.Domain.Extensions
{
    public static class AuditServiceCollectionExtensions
    {
        public static IServiceCollection AddAuditServices(this IServiceCollection services)
        {
            // Register audit subject (singleton to maintain observers across requests)
            services.AddSingleton<IAuditSubject, AuditSubject>();

            // Register audit context (scoped to HTTP request)
            services.AddScoped<EDR.Domain.Services.IAuditContext, EDR.Domain.Services.AuditContext>();

            // Register audit service as singleton to avoid disposed context issues
            services.AddSingleton<IAuditService, AuditService>();

            // Register audit observers as singleton to avoid disposed context issues
            services.AddSingleton<IAuditObserver, AuditService>(); // Database logging
            services.AddSingleton<IAuditObserver, EDR.Domain.Services.AuditNotificationObserver>(); // Notifications
            services.AddSingleton<IAuditObserver, EDR.Domain.Services.AuditLoggingObserver>(); // Console logging

            return services;
        }

        public static IServiceCollection ConfigureAuditObservers(this IServiceCollection services)
        {
            // This method will be called after all services are registered
            // to attach observers to the audit subject
            services.AddHostedService<AuditObserverInitializer>();

            return services;
        }
    }    
}

