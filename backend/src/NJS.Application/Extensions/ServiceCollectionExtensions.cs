using Microsoft.Extensions.DependencyInjection;
using NJS.Application.Services;
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
            services.AddSingleton<AuthService>();
            services.AddScoped<ProjectManagementService>();
            return services;
        }
    }
}
