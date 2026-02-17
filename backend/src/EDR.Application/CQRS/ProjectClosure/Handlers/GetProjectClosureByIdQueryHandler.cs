using MediatR;
using EDR.Application.CQRS.ProjectClosure.Queries;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.ProjectClosure.Handlers
{
    public class GetProjectClosureByIdQueryHandler : IRequestHandler<GetProjectClosureByIdQuery, ProjectClosureDto>
    {
        private readonly IProjectClosureRepository _projectClosureRepository;

        public GetProjectClosureByIdQueryHandler(IProjectClosureRepository projectClosureRepository)
        {
            _projectClosureRepository = projectClosureRepository ?? throw new ArgumentNullException(nameof(projectClosureRepository));
        }

        public async Task<ProjectClosureDto> Handle(GetProjectClosureByIdQuery request, CancellationToken cancellationToken)
        {
            var projectClosure = await _projectClosureRepository.GetById(request.Id);
            if (projectClosure == null)
                return null!;

            var dto = new ProjectClosureDto
            {
                Id = projectClosure.Id,
                ProjectId = projectClosure.ProjectId,
                ClientFeedback = projectClosure.ClientFeedback ?? "",
                SuccessCriteria = projectClosure.SuccessCriteria ?? "",
                ClientExpectations = projectClosure.ClientExpectations ?? "",
                OtherStakeholders = projectClosure.OtherStakeholders ?? "",
                EnvIssues = projectClosure.EnvIssues ?? "",
                EnvManagement = projectClosure.EnvManagement ?? "",
                ThirdPartyIssues = projectClosure.ThirdPartyIssues ?? "",
                ThirdPartyManagement = projectClosure.ThirdPartyManagement ?? "",
                RiskIssues = projectClosure.RiskIssues ?? "",
                RiskManagement = projectClosure.RiskManagement ?? "",
                KnowledgeGoals = projectClosure.KnowledgeGoals ?? "",
                BaselineComparison = projectClosure.BaselineComparison ?? "",
                DelayedDeliverables = projectClosure.DelayedDeliverables ?? "",
                UnforeseeableDelays = projectClosure.UnforeseeableDelays ?? "",
                BudgetEstimate = projectClosure.BudgetEstimate ?? "",
                ProfitTarget = projectClosure.ProfitTarget ?? "",
                ChangeOrders = projectClosure.ChangeOrders ?? "",
                CloseOutBudget = projectClosure.CloseOutBudget ?? "",
                ResourceAvailability = projectClosure.ResourceAvailability ?? "",
                VendorFeedback = projectClosure.VendorFeedback ?? "",
                ProjectTeamFeedback = projectClosure.ProjectTeamFeedback ?? "",
                DesignOutputs = projectClosure.DesignOutputs ?? "",
                ProjectReviewMeetings = projectClosure.ProjectReviewMeetings ?? "",
                ClientDesignReviews = projectClosure.ClientDesignReviews ?? "",
                InternalReporting = projectClosure.InternalReporting ?? "",
                ClientReporting = projectClosure.ClientReporting ?? "",
                InternalMeetings = projectClosure.InternalMeetings ?? "",
                ClientMeetings = projectClosure.ClientMeetings ?? "",
                ExternalMeetings = projectClosure.ExternalMeetings ?? "",
                PlanUpToDate = projectClosure.PlanUpToDate ?? "",
                PlanUseful = projectClosure.PlanUseful ?? "",
                Hindrances = projectClosure.Hindrances ?? "",
                ClientPayment = projectClosure.ClientPayment ?? "",
                PlanningIssues = projectClosure.PlanningIssues ?? "",
                PlanningLessons = projectClosure.PlanningLessons ?? "",
                BriefAims = projectClosure.BriefAims ?? "",
                DesignReviewOutputs = projectClosure.DesignReviewOutputs ?? "",
                ConstructabilityReview = projectClosure.ConstructabilityReview ?? "",
                DesignReview = projectClosure.DesignReview ?? "",
                TechnicalRequirements = projectClosure.TechnicalRequirements ?? "",
                InnovativeIdeas = projectClosure.InnovativeIdeas ?? "",
                SuitableOptions = projectClosure.SuitableOptions ?? "",
                AdditionalInformation = projectClosure.AdditionalInformation ?? "",
                DeliverableExpectations = projectClosure.DeliverableExpectations ?? "",
                StakeholderInvolvement = projectClosure.StakeholderInvolvement ?? "",
                KnowledgeGoalsAchieved = projectClosure.KnowledgeGoalsAchieved ?? "",
                TechnicalToolsDissemination = projectClosure.TechnicalToolsDissemination ?? "",
                SpecialistKnowledgeValue = projectClosure.SpecialistKnowledgeValue ?? "",
                OtherComments = projectClosure.OtherComments ?? "",
                TargetCostAccuracyValue = projectClosure.TargetCostAccuracyValue,
                TargetCostAccuracy = projectClosure.TargetCostAccuracy ?? "",
                ChangeControlReviewValue = projectClosure.ChangeControlReviewValue,
                ChangeControlReview = projectClosure.ChangeControlReview ?? "",
                CompensationEventsValue = projectClosure.CompensationEventsValue,
                CompensationEvents = projectClosure.CompensationEvents ?? "",
                ExpenditureProfileValue = projectClosure.ExpenditureProfileValue,
                ExpenditureProfile = projectClosure.ExpenditureProfile ?? "",
                HealthSafetyConcernsValue = projectClosure.HealthSafetyConcernsValue,
                HealthSafetyConcerns = projectClosure.HealthSafetyConcerns ?? "",
                ProgrammeRealisticValue = projectClosure.ProgrammeRealisticValue,
                ProgrammeRealistic = projectClosure.ProgrammeRealistic ?? "",
                ProgrammeUpdatesValue = projectClosure.ProgrammeUpdatesValue,
                ProgrammeUpdates = projectClosure.ProgrammeUpdates ?? "",
                RequiredQualityValue = projectClosure.RequiredQualityValue,
                RequiredQuality = projectClosure.RequiredQuality ?? "",
                OperationalRequirementsValue = projectClosure.OperationalRequirementsValue,
                OperationalRequirements = projectClosure.OperationalRequirements ?? "",
                ConstructionInvolvementValue = projectClosure.ConstructionInvolvementValue,
                ConstructionInvolvement = projectClosure.ConstructionInvolvement ?? "",
                EfficienciesValue = projectClosure.EfficienciesValue,
                Efficiencies = projectClosure.Efficiencies ?? "",
                MaintenanceAgreementsValue = projectClosure.MaintenanceAgreementsValue,
                MaintenanceAgreements = projectClosure.MaintenanceAgreements ?? "",
                AsBuiltManualsValue = projectClosure.AsBuiltManualsValue,
                AsBuiltManuals = projectClosure.AsBuiltManuals ?? "",
                HsFileForwardedValue = projectClosure.HsFileForwardedValue,
                HsFileForwarded = projectClosure.HsFileForwarded ?? "",
                Variations = projectClosure.Variations ?? "",
                TechnoLegalIssues = projectClosure.TechnoLegalIssues ?? "",
                ConstructionOther = projectClosure.ConstructionOther ?? "",
                Positives = projectClosure.Positives ?? "",
                LessonsLearned = projectClosure.LessonsLearned ?? "",
                CreatedAt = projectClosure.CreatedAt,
                CreatedBy = projectClosure.CreatedBy ?? "",
                UpdatedAt = projectClosure.UpdatedAt,
                UpdatedBy = projectClosure.UpdatedBy ?? "",
                WorkflowHistory = projectClosure.WorkflowHistories.OrderByDescending(x => x.ActionDate).Select(wh => new ProjectClosureWorkflowHistoryDto
                {
                    Id = wh.Id,
                    ProjectClosureId = wh.ProjectClosureId,
                    StatusId = wh.StatusId,
                    ActionBy = wh.ActionBy,
                    ActionDate = wh.ActionDate,
                    Comments = wh.Comments,
                    Action = wh.Action,
                    AssignedToId = wh.AssignedToId,                   
                }).FirstOrDefault()
                               
            };

            return dto;
        }
    }
}

