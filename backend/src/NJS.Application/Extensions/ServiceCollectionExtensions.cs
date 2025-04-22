﻿using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using NJS.Application.Services;
using NJS.Application.Services.IContract;
using NJS.Repositories.Interfaces;
using NJS.Repositories.Repositories; // Already here, but good to confirm
using System.Reflection;
using NJS.Repositories.Repositories; // Ensure this namespace is included

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
            services.AddScoped<IScoringDescriptionRepository, ScoringDescriptionRepository>();
            services.AddScoped<IScoringDescriptionService, ScoringDescriptionService>();
            services.AddScoped<IFeasibilityStudyRepository, FeasibilityStudyRepository>();
            services.AddScoped<IWorkBreakdownStructureRepository, WorkBreakdownStructureRepository>();
            services.AddScoped<IWBSTaskRepository, WBSTaskRepository>(); // Add this line
            services.AddScoped<IWBSOptionRepository, WBSOptionRepository>();
            services.AddScoped<IJobStartFormRepository, JobStartFormRepository>();
            services.AddScoped<IGoNoGoDecisionRepository, GoNoGoDecisionRepository>();
            services.AddScoped<IOpportunityTrackingRepository, OpportunityTrackingRepository>();
            services.AddScoped<IPermissionRepository, PermissionRepository>();
            services.AddScoped<IOpportunityHistoryRepository, OpportunityHistoryRepository>();
            services.AddScoped<IBidPreparationRepository, BidPreparationRepository>();
            services.AddScoped<ISettingsRepository, SettingsRepository>();
            services.AddScoped<IInputRegisterRepository, InputRegisterRepository>();
            services.AddScoped<ICorrespondenceInwardRepository, CorrespondenceInwardRepository>();
            services.AddScoped<ICorrespondenceOutwardRepository, CorrespondenceOutwardRepository>();
            services.AddScoped<ICheckReviewRepository, CheckReviewRepository>();

            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IProjectManagementService, ProjectManagementService>();
            services.AddScoped<IOpportunityHistoryService, OpportunityHistoryService>();
            services.AddScoped<IGoNoGoDecisionService, GoNoGoDecisionService>();
            services.AddScoped<IUserContext, UserContext>();
            services.AddScoped<IEmailService, EmailService>();


            return services;
        }
    }
}
