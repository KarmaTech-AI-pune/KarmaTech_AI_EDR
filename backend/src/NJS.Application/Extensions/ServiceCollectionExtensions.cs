using Microsoft.Extensions.DependencyInjection;
using NJS.Application.Services;
using NJS.Application.Services.IContract;
using NJS.Repositories.Interfaces;
using NJS.Repositories.Repositories;

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
            services.AddScoped<IAuthService,AuthService>();
            services.AddScoped<IProjectManagementService,ProjectManagementService>();
            return services;
        }
    }
}
