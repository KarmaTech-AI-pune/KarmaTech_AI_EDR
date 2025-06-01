using MediatR;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.ProjectClosure.Commands;
using NJS.Repositories.Interfaces;

namespace NJS.Application.CQRS.ProjectClosure.Handlers
{
    public class UpdateProjectClosureCommandHandler : IRequestHandler<UpdateProjectClosureCommand, bool>
    {
        private readonly IProjectClosureRepository _projectClosureRepository;
        private readonly ILogger<UpdateProjectClosureCommandHandler> _logger;

        public UpdateProjectClosureCommandHandler(
            IProjectClosureRepository projectClosureRepository, ILogger<UpdateProjectClosureCommandHandler> logger)
        {
            _projectClosureRepository = projectClosureRepository ?? throw new ArgumentNullException(nameof(projectClosureRepository));
            _logger = logger;
        }

        public async Task<bool> Handle(UpdateProjectClosureCommand request, CancellationToken cancellationToken)
        {
            if (request.ProjectClosureDto == null)
                throw new ArgumentNullException(nameof(request.ProjectClosureDto), "Project Closure data cannot be null");

            if (request.ProjectClosureDto.Id <= 0)
                throw new ArgumentException("Invalid Id", nameof(request.ProjectClosureDto.Id));

            try
            {
                var existingClosure = await _projectClosureRepository.GetById(request.ProjectClosureDto.Id);
                if (existingClosure == null)
                    throw new InvalidOperationException($"Project closure with ID {request.ProjectClosureDto.Id} not found");

                _logger.LogInformation($"Found existing project closure with ID {existingClosure} for update", existingClosure.Id);

                var updatedClosure = new Domain.Entities.ProjectClosure
                {
                    Id = existingClosure.Id, 
                    ProjectId = request.ProjectClosureDto.ProjectId,
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

                    CreatedAt = existingClosure.CreatedAt,
                    CreatedBy = existingClosure.CreatedBy,

                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = request.ProjectClosureDto.UpdatedBy ?? "System"
                };

                _projectClosureRepository.Update(updatedClosure);

                _logger.LogInformation($"Successfully updated project closure with ID {updatedClosure.Id}");
                return true; 
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating project closure: {ex.Message}");
                if (ex.InnerException != null)
                {
                    _logger.LogError($"Inner exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }
    }
}
