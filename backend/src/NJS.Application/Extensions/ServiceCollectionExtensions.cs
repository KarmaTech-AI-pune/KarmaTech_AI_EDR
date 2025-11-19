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
using NJS.Application.Services;
using NJS.Application.Services.IContract;
using NJS.Repositories.Repositories;
using NJS.Repositories.Interfaces;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;


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
                cfg.RegisterServicesFromAssembly(typeof(IMonthlyProgressRepository).Assembly); // Register repository assembly
            });

            services.AddScoped<IProjectRepository, ProjectRepository>();
            services.AddScoped<IMonthlyProgressRepository, MonthlyProgressRepository>(); // Added for Monthly Progress module
            services.AddScoped<IScoringDescriptionRepository, ScoringDescriptionRepository>();
            services.AddScoped<IScoringDescriptionService, ScoringDescriptionService>();

            services.AddScoped<IWorkBreakdownStructureRepository, WorkBreakdownStructureRepository>();
            services.AddScoped<IWBSTaskRepository, WBSTaskRepository>(); // Add this line
            services.AddScoped<IWBSVersionRepository, WBSVersionRepository>(); // Add WBS version repository
            services.AddScoped<IWBSOptionRepository, WBSOptionRepository>();
            services.AddScoped<IJobStartFormRepository, JobStartFormRepository>();
            services.AddScoped<IGoNoGoDecisionRepository, GoNoGoDecisionRepository>();
            services.AddScoped<IOpportunityTrackingRepository, OpportunityTrackingRepository>();
            services.AddScoped<IPermissionRepository, PermissionRepository>();
            services.AddScoped<IOpportunityHistoryRepository, OpportunityHistoryRepository>();
            services.AddScoped<IProjectHistoryRepository, ProjectHistoryRepository>();
            services.AddScoped<IBidPreparationRepository, BidPreparationRepository>();
            services.AddScoped<ISettingsRepository, SettingsRepository>();
            services.AddScoped<IInputRegisterRepository, InputRegisterRepository>();
            services.AddScoped<ICorrespondenceInwardRepository, CorrespondenceInwardRepository>();
            services.AddScoped<ICorrespondenceOutwardRepository, CorrespondenceOutwardRepository>();
            services.AddScoped<ICheckReviewRepository, CheckReviewRepository>();
            services.AddScoped<IChangeControlRepository, ChangeControlRepository>();
            services.AddScoped<IProjectClosureRepository, ProjectClosureRepository>();
            services.AddScoped<ITenantRepository, TenantRepository>();
            services.AddScoped<IProgramRepository, ProgramRepository>();

            services.AddScoped<ICreateAccountRepository, CreateAccountRepository>();
            services.AddScoped<ICashflowRepository, CashflowRepository>();
            services.AddScoped<IMeasurementUnitRepository, MeasurementUnitRepository>();

           // services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IAuthService, EnhancedAuthService>();
            services.AddScoped<IProjectManagementService, ProjectManagementService>();
            services.AddScoped<IOpportunityHistoryService, OpportunityHistoryService>();
            services.AddScoped<IProjectHistoryService, ProjectHistoryService>();
            services.AddScoped<IGoNoGoDecisionService, GoNoGoDecisionService>();
            services.AddScoped<IUserContext, UserContext>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<ISubscriptionService, SubscriptionService>();
            services.AddScoped<IDatabaseManagementService, DatabaseManagementService>();

           

            // Register DNS Management Service based on environment
           

            //Define Strategy pattern
            services.AddScoped<IEntityWorkflowStrategy, ChangeControlWorkflowStrategy>();
            services.AddScoped<IEntityWorkflowStrategy, ProjectClosureWorkflowStrategy>();
            services.AddScoped<IEntityWorkflowStrategy, WBSWorkflowStrategy>();
            services.AddScoped<IEntityWorkflowStrategy, WBSVersionWorkflowStrategy>(); // Add WBS version workflow strategy
            services.AddScoped<IEntityWorkflowStrategy, JobStartFormWorkflowStrategy>();
            services.AddScoped<IEntityWorkflowStrategySelector,EntityWorkflowStrategySelector>();
            services.AddScoped<IFeatureRepository, FeatureRepository>();
            services.AddScoped<ITwoFactorService, TwoFactorService>();
            services.AddScoped<IEmailTemplateService, EmailTemplateService>();

            return services;
        }
        
    }
}
