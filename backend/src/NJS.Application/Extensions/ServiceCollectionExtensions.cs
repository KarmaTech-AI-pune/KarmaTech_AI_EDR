﻿using AutoMapper;
using AutoMapper.Extensions.Microsoft.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using NJS.Application.Services;
using NJS.Application.Services.IContract;
using NJS.Repositories.Interfaces;
using NJS.Repositories.Repositories;
using System.Reflection;

namespace NJS.Application.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddAutoMapper(Assembly.GetExecutingAssembly());
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            });

            services.AddScoped<IProjectRepository, ProjectRepository>();
            services.AddScoped<IFeasibilityStudyRepository, FeasibilityStudyRepository>();
            services.AddScoped<IWorkBreakdownStructureRepository, WorkBreakdownStructureRepository>();
            services.AddScoped<IGoNoGoDecisionRepository, GoNoGoDecisionRepository>();
            services.AddScoped<IOpportunityTrackingRepository, OpportunityTrackingRepository>();
            services.AddScoped<IPermissionRepository, PermissionRepository>();
            services.AddScoped<IOpportunityHistoryRepository, OpportunityHistoryRepository>();

            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IProjectManagementService, ProjectManagementService>();
            services.AddScoped<IOpportunityHistoryService, OpportunityHistoryService>();
            services.AddScoped<IUserContext, UserContext>();
            
            return services;
        }
    }
}
