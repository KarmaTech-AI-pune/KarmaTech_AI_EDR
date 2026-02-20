using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MediatR;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Events;
using EDR.Domain.GenericRepository;
using EDR.Domain.Models;
using EDR.Domain.Services;
using EDR.Domain.UnitWork;
using EDR.Application.Services;
using EDR.Application.Services.IContract;
using EDR.Repositories.Repositories;
using EDR.Repositories.Interfaces;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using EDR.Application.CQRS.SprintTasks.Commands; // Added for SprintTask commands
using EDR.Application.CQRS.SprintTasks.Queries; // Added for SprintTask queries
using EDR.Application.CQRS.SprintSubtasks.Commands; // Added for SprintSubtask commands
using EDR.Application.CQRS.SprintSubtasks.Queries; // Added for SprintSubtask queries
using FluentValidation;
using EDR.Application.Behaviors;

namespace EDR.Application.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddAutoMapper(Assembly.GetExecutingAssembly());
            
            // Add FluentValidation
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
            
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(typeof(ServiceCollectionExtensions).Assembly); // EDR.Application assembly
                cfg.RegisterServicesFromAssembly(typeof(ProjectManagementContext).Assembly); // EDR.Domain assembly
                cfg.RegisterServicesFromAssembly(typeof(ProjectRepository).Assembly); // EDR.Repositories assembly                
                // Add validation behavior to MediatR pipeline
                cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            });

            services.AddScoped<IProjectRepository, ProjectRepository>();
            services.AddScoped<IProjectBudgetChangeHistoryRepository, ProjectBudgetChangeHistoryRepository>();
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
            services.AddScoped<IProjectScheduleRepository, ProjectScheduleRepository>();

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
            services.AddScoped<IEntityWorkflowStrategySelector, EntityWorkflowStrategySelector>();
            services.AddScoped<IFeatureRepository, FeatureRepository>();
            services.AddScoped<ITwoFactorService, TwoFactorService>();
            services.AddScoped<IEmailTemplateService, EmailTemplateService>();
            services.AddScoped<IDeploymentLogService, DeploymentLogService>();
            services.AddScoped<IReleaseNotesGeneratorService, ReleaseNotesGeneratorService>();
            services.AddScoped<IGitHubService, GitHubService>();
            services.AddScoped<IReleaseNotesRepository, ReleaseNotesRepository>();
            
            // Feature Authorization Service
            services.AddScoped<IFeatureAuthorizationService, FeatureAuthorizationService>();

            return services;
        }

    }
}


