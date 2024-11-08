using Microsoft.Extensions.DependencyInjection;
using NJS.Application.Interfaces;
using NJS.Application.Repositories;
using NJS.Application.Services;

namespace NJS.Application.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IProjectRepository, ProjectRepository>();
            services.AddScoped<IFeasibilityStudyRepository, FeasibilityStudyRepository>();
            services.AddScoped<IWorkBreakdownStructureRepository, WorkBreakdownStructureRepository>();
            services.AddScoped<IGoNoGoDecisionRepository, GoNoGoDecisionRepository>();
            services.AddScoped<IOpportunityTrackingRepository, OpportunityTrackingRepository>();
            services.AddSingleton<AuthService>();
            services.AddScoped<ProjectManagementService>();
            return services;
        }
    }
}
