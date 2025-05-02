using MediatR;
using NJS.Application.CQRS.ProjectClosure.Commands;
using NJS.Domain.Entities;
using NJS.Domain.UnitWork;
using NJS.Repositories.Interfaces;
using NJS.Repositories.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.ProjectClosure.Handlers
{
    public class CreateProjectClosureCommandHandler : IRequestHandler<CreateProjectClosureCommand, int>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProjectClosureRepository _projectClosureRepository;
        // Removed ProjectClosureCommentRepository to fix build issues
        //private readonly IProjectClosureCommentRepository _projectClosureCommentRepository;

        public CreateProjectClosureCommandHandler(
            IUnitOfWork unitOfWork,
            IProjectClosureRepository projectClosureRepository)
            //IProjectClosureCommentRepository projectClosureCommentRepository)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _projectClosureRepository = projectClosureRepository ?? throw new ArgumentNullException(nameof(projectClosureRepository));
            //_projectClosureCommentRepository = projectClosureCommentRepository ?? throw new ArgumentNullException(nameof(projectClosureCommentRepository));
        }

        public async Task<int> Handle(CreateProjectClosureCommand request, CancellationToken cancellationToken)
        {
            try
            {
                if (request.ProjectClosureDto == null)
                    throw new ArgumentNullException(nameof(request.ProjectClosureDto), "Project Closure data cannot be null");

                // Validate required fields
                if (request.ProjectClosureDto.ProjectId <= 0)
                    throw new ArgumentException("Invalid ProjectId", nameof(request.ProjectClosureDto.ProjectId));

                // Check if the project exists
                if (!await _projectClosureRepository.ProjectExists(request.ProjectClosureDto.ProjectId))
                {
                    throw new InvalidOperationException($"Project with ID {request.ProjectClosureDto.ProjectId} does not exist");
                }

                // Ensure CreatedBy is not null or empty
                if (string.IsNullOrEmpty(request.ProjectClosureDto.CreatedBy))
                    request.ProjectClosureDto.CreatedBy = "System";

                // We're allowing multiple project closures per project, so we don't need to check if one already exists
                Console.WriteLine($"Creating a new project closure entry for project ID {request.ProjectClosureDto.ProjectId}");

                // Create new project closure entity
                var projectClosure = new Domain.Entities.ProjectClosure
                {
                    // Explicitly set ID to 0 to ensure the database generates a new ID
                    Id = 0,
                    ProjectId = request.ProjectClosureDto.ProjectId,

                    // Map all properties from DTO, preserving null values
                    ClientFeedback = request.ProjectClosureDto.ClientFeedback,
                    SuccessCriteria = request.ProjectClosureDto.SuccessCriteria,
                    ClientExpectations = request.ProjectClosureDto.ClientExpectations,
                    OtherStakeholders = request.ProjectClosureDto.OtherStakeholders,
                    EnvIssues = request.ProjectClosureDto.EnvIssues,
                    EnvManagement = request.ProjectClosureDto.EnvManagement,
                    ThirdPartyIssues = request.ProjectClosureDto.ThirdPartyIssues,
                    ThirdPartyManagement = request.ProjectClosureDto.ThirdPartyManagement,
                    RiskIssues = request.ProjectClosureDto.RiskIssues,
                    RiskManagement = request.ProjectClosureDto.RiskManagement,
                    KnowledgeGoals = request.ProjectClosureDto.KnowledgeGoals,
                    BaselineComparison = request.ProjectClosureDto.BaselineComparison,
                    DelayedDeliverables = request.ProjectClosureDto.DelayedDeliverables,
                    UnforeseeableDelays = request.ProjectClosureDto.UnforeseeableDelays,
                    BudgetEstimate = request.ProjectClosureDto.BudgetEstimate,
                    ProfitTarget = request.ProjectClosureDto.ProfitTarget,
                    ChangeOrders = request.ProjectClosureDto.ChangeOrders,
                    CloseOutBudget = request.ProjectClosureDto.CloseOutBudget,
                    ResourceAvailability = request.ProjectClosureDto.ResourceAvailability,
                    VendorFeedback = request.ProjectClosureDto.VendorFeedback,
                    ProjectTeamFeedback = request.ProjectClosureDto.ProjectTeamFeedback,
                    DesignOutputs = request.ProjectClosureDto.DesignOutputs,
                    ProjectReviewMeetings = request.ProjectClosureDto.ProjectReviewMeetings,
                    ClientDesignReviews = request.ProjectClosureDto.ClientDesignReviews,
                    InternalReporting = request.ProjectClosureDto.InternalReporting,
                    ClientReporting = request.ProjectClosureDto.ClientReporting,
                    InternalMeetings = request.ProjectClosureDto.InternalMeetings,
                    ClientMeetings = request.ProjectClosureDto.ClientMeetings,
                    ExternalMeetings = request.ProjectClosureDto.ExternalMeetings,
                    PlanUpToDate = request.ProjectClosureDto.PlanUpToDate,
                    PlanningIssues = request.ProjectClosureDto.PlanningIssues,
                    PlanningLessons = request.ProjectClosureDto.PlanningLessons,
                    DesignReview = request.ProjectClosureDto.DesignReview,
                    TechnicalRequirements = request.ProjectClosureDto.TechnicalRequirements,
                    InnovativeIdeas = request.ProjectClosureDto.InnovativeIdeas,
                    SuitableOptions = request.ProjectClosureDto.SuitableOptions,
                    AdditionalInformation = request.ProjectClosureDto.AdditionalInformation,
                    DeliverableExpectations = request.ProjectClosureDto.DeliverableExpectations,
                    StakeholderInvolvement = request.ProjectClosureDto.StakeholderInvolvement,
                    KnowledgeGoalsAchieved = request.ProjectClosureDto.KnowledgeGoalsAchieved,
                    TechnicalToolsDissemination = request.ProjectClosureDto.TechnicalToolsDissemination,
                    SpecialistKnowledgeValue = request.ProjectClosureDto.SpecialistKnowledgeValue,
                    OtherComments = request.ProjectClosureDto.OtherComments,
                    TargetCostAccuracyValue = request.ProjectClosureDto.TargetCostAccuracyValue,
                    TargetCostAccuracy = request.ProjectClosureDto.TargetCostAccuracy,
                    ChangeControlReviewValue = request.ProjectClosureDto.ChangeControlReviewValue,
                    ChangeControlReview = request.ProjectClosureDto.ChangeControlReview,
                    CompensationEventsValue = request.ProjectClosureDto.CompensationEventsValue,
                    CompensationEvents = request.ProjectClosureDto.CompensationEvents,
                    ExpenditureProfileValue = request.ProjectClosureDto.ExpenditureProfileValue,
                    ExpenditureProfile = request.ProjectClosureDto.ExpenditureProfile,
                    HealthSafetyConcernsValue = request.ProjectClosureDto.HealthSafetyConcernsValue,
                    HealthSafetyConcerns = request.ProjectClosureDto.HealthSafetyConcerns,
                    ProgrammeRealisticValue = request.ProjectClosureDto.ProgrammeRealisticValue,
                    ProgrammeRealistic = request.ProjectClosureDto.ProgrammeRealistic,
                    ProgrammeUpdatesValue = request.ProjectClosureDto.ProgrammeUpdatesValue,
                    ProgrammeUpdates = request.ProjectClosureDto.ProgrammeUpdates,
                    RequiredQualityValue = request.ProjectClosureDto.RequiredQualityValue,
                    RequiredQuality = request.ProjectClosureDto.RequiredQuality,
                    OperationalRequirementsValue = request.ProjectClosureDto.OperationalRequirementsValue,
                    OperationalRequirements = request.ProjectClosureDto.OperationalRequirements,
                    ConstructionInvolvementValue = request.ProjectClosureDto.ConstructionInvolvementValue,
                    ConstructionInvolvement = request.ProjectClosureDto.ConstructionInvolvement,
                    EfficienciesValue = request.ProjectClosureDto.EfficienciesValue,
                    Efficiencies = request.ProjectClosureDto.Efficiencies,
                    MaintenanceAgreementsValue = request.ProjectClosureDto.MaintenanceAgreementsValue,
                    MaintenanceAgreements = request.ProjectClosureDto.MaintenanceAgreements,
                    AsBuiltManualsValue = request.ProjectClosureDto.AsBuiltManualsValue,
                    AsBuiltManuals = request.ProjectClosureDto.AsBuiltManuals,
                    HsFileForwardedValue = request.ProjectClosureDto.HsFileForwardedValue,
                    HsFileForwarded = request.ProjectClosureDto.HsFileForwarded,
                    Variations = request.ProjectClosureDto.Variations,
                    TechnoLegalIssues = request.ProjectClosureDto.TechnoLegalIssues,
                    ConstructionOther = request.ProjectClosureDto.ConstructionOther,
                    PlanUseful = request.ProjectClosureDto.PlanUseful,
                    Hindrances = request.ProjectClosureDto.Hindrances,
                    ClientPayment = request.ProjectClosureDto.ClientPayment,
                    BriefAims = request.ProjectClosureDto.BriefAims,
                    DesignReviewOutputs = request.ProjectClosureDto.DesignReviewOutputs,
                    ConstructabilityReview = request.ProjectClosureDto.ConstructabilityReview,
                    Positives = request.ProjectClosureDto.Positives,
                    LessonsLearned = request.ProjectClosureDto.LessonsLearned,

                    // Removed workflow fields

                    // Audit fields
                    CreatedAt = request.ProjectClosureDto.CreatedAt != default ? request.ProjectClosureDto.CreatedAt : DateTime.UtcNow,
                    CreatedBy = request.ProjectClosureDto.CreatedBy ?? "System",
                    UpdatedAt = request.ProjectClosureDto.UpdatedAt,
                    UpdatedBy = request.ProjectClosureDto.UpdatedBy
                };

                Console.WriteLine($"Creating new project closure for project ID {projectClosure.ProjectId}");
                await _projectClosureRepository.Add(projectClosure);
                Console.WriteLine($"Successfully created project closure with ID {projectClosure.Id}");

                // Removed comments processing to fix build issues
                /*
                // Process comments if any
                if (request.ProjectClosureDto.ProjectClosureComments != null && request.ProjectClosureDto.ProjectClosureComments.Any())
                {
                    Console.WriteLine($"Processing {request.ProjectClosureDto.ProjectClosureComments.Count} comments for project closure ID {projectClosure.Id}");

                    foreach (var commentDto in request.ProjectClosureDto.ProjectClosureComments)
                    {
                        var comment = new ProjectClosureComment
                        {
                            ProjectClosureId = projectClosure.Id,
                            Type = commentDto.Type,
                            Comment = commentDto.Comment,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = request.ProjectClosureDto.CreatedBy ?? "System"
                        };

                        await _projectClosureCommentRepository.Add(comment);
                        Console.WriteLine($"Added comment of type {comment.Type} to project closure ID {projectClosure.Id}");
                    }
                }
                */

                return projectClosure.Id;
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"Validation error in CreateProjectClosureCommandHandler: {ex.Message}");
                throw; // Re-throw the exception to be caught by the controller
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"Invalid argument in CreateProjectClosureCommandHandler: {ex.Message}");
                throw; // Re-throw the exception to be caught by the controller
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error in CreateProjectClosureCommandHandler: {ex.ToString()}");

                // Check if it's a database-related exception
                if (ex.InnerException != null && ex.InnerException.Message.Contains("FK_ProjectClosures_Projects_ProjectId"))
                {
                    // Convert database constraint error to a more user-friendly message
                    throw new InvalidOperationException($"Project with ID {request.ProjectClosureDto.ProjectId} does not exist", ex);
                }

                throw; // Re-throw the exception to be caught by the controller
            }
        }
    }
}
