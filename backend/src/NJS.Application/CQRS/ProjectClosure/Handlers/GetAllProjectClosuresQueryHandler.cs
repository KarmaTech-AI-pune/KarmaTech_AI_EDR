using MediatR;
using NJS.Application.CQRS.ProjectClosure.Queries;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.ProjectClosure.Handlers
{
    public class GetAllProjectClosuresQueryHandler : IRequestHandler<GetAllProjectClosuresQuery, IEnumerable<ProjectClosureDto>>
    {
        private readonly IProjectClosureRepository _projectClosureRepository;

        public GetAllProjectClosuresQueryHandler(IProjectClosureRepository projectClosureRepository)
        {
            _projectClosureRepository = projectClosureRepository ?? throw new ArgumentNullException(nameof(projectClosureRepository));
        }

        public async Task<IEnumerable<ProjectClosureDto>> Handle(GetAllProjectClosuresQuery request, CancellationToken cancellationToken)
        {
            var projectClosures = await _projectClosureRepository.GetAll();

            return projectClosures.Select(pc => new ProjectClosureDto
            {
                Id = pc.Id,
                ProjectId = pc.ProjectId,
                ClientFeedback = pc.ClientFeedback ?? "",
                SuccessCriteria = pc.SuccessCriteria ?? "",
                ClientExpectations = pc.ClientExpectations ?? "",
                OtherStakeholders = pc.OtherStakeholders ?? "",
                EnvIssues = pc.EnvIssues ?? "",
                EnvManagement = pc.EnvManagement ?? "",
                ThirdPartyIssues = pc.ThirdPartyIssues ?? "",
                ThirdPartyManagement = pc.ThirdPartyManagement ?? "",
                RiskIssues = pc.RiskIssues ?? "",
                RiskManagement = pc.RiskManagement ?? "",
                KnowledgeGoals = pc.KnowledgeGoals ?? "",
                BaselineComparison = pc.BaselineComparison ?? "",
                DelayedDeliverables = pc.DelayedDeliverables ?? "",
                UnforeseeableDelays = pc.UnforeseeableDelays ?? "",
                BudgetEstimate = pc.BudgetEstimate ?? "",
                ProfitTarget = pc.ProfitTarget ?? "",
                ChangeOrders = pc.ChangeOrders ?? "",
                CloseOutBudget = pc.CloseOutBudget ?? "",
                ResourceAvailability = pc.ResourceAvailability ?? "",
                VendorFeedback = pc.VendorFeedback ?? "",
                ProjectTeamFeedback = pc.ProjectTeamFeedback ?? "",
                DesignOutputs = pc.DesignOutputs ?? "",
                ProjectReviewMeetings = pc.ProjectReviewMeetings ?? "",
                ClientDesignReviews = pc.ClientDesignReviews ?? "",
                InternalReporting = pc.InternalReporting ?? "",
                ClientReporting = pc.ClientReporting ?? "",
                InternalMeetings = pc.InternalMeetings ?? "",
                ClientMeetings = pc.ClientMeetings ?? "",
                ExternalMeetings = pc.ExternalMeetings ?? "",
                PlanUpToDate = pc.PlanUpToDate ?? "",
                PlanUseful = pc.PlanUseful ?? "",
                Hindrances = pc.Hindrances ?? "",
                ClientPayment = pc.ClientPayment ?? "",
                PlanningIssues = pc.PlanningIssues ?? "",
                PlanningLessons = pc.PlanningLessons ?? "",
                BriefAims = pc.BriefAims ?? "",
                DesignReviewOutputs = pc.DesignReviewOutputs ?? "",
                ConstructabilityReview = pc.ConstructabilityReview ?? "",
                DesignReview = pc.DesignReview ?? "",
                TechnicalRequirements = pc.TechnicalRequirements ?? "",
                InnovativeIdeas = pc.InnovativeIdeas ?? "",
                SuitableOptions = pc.SuitableOptions ?? "",
                AdditionalInformation = pc.AdditionalInformation ?? "",
                DeliverableExpectations = pc.DeliverableExpectations ?? "",
                StakeholderInvolvement = pc.StakeholderInvolvement ?? "",
                KnowledgeGoalsAchieved = pc.KnowledgeGoalsAchieved ?? "",
                TechnicalToolsDissemination = pc.TechnicalToolsDissemination ?? "",
                SpecialistKnowledgeValue = pc.SpecialistKnowledgeValue ?? "",
                OtherComments = pc.OtherComments ?? "",
                TargetCostAccuracyValue = pc.TargetCostAccuracyValue,
                TargetCostAccuracy = pc.TargetCostAccuracy ?? "",
                ChangeControlReviewValue = pc.ChangeControlReviewValue,
                ChangeControlReview = pc.ChangeControlReview ?? "",
                CompensationEventsValue = pc.CompensationEventsValue,
                CompensationEvents = pc.CompensationEvents ?? "",
                ExpenditureProfileValue = pc.ExpenditureProfileValue,
                ExpenditureProfile = pc.ExpenditureProfile ?? "",
                HealthSafetyConcernsValue = pc.HealthSafetyConcernsValue,
                HealthSafetyConcerns = pc.HealthSafetyConcerns ?? "",
                ProgrammeRealisticValue = pc.ProgrammeRealisticValue,
                ProgrammeRealistic = pc.ProgrammeRealistic ?? "",
                ProgrammeUpdatesValue = pc.ProgrammeUpdatesValue,
                ProgrammeUpdates = pc.ProgrammeUpdates ?? "",
                RequiredQualityValue = pc.RequiredQualityValue,
                RequiredQuality = pc.RequiredQuality ?? "",
                OperationalRequirementsValue = pc.OperationalRequirementsValue,
                OperationalRequirements = pc.OperationalRequirements ?? "",
                ConstructionInvolvementValue = pc.ConstructionInvolvementValue,
                ConstructionInvolvement = pc.ConstructionInvolvement ?? "",
                EfficienciesValue = pc.EfficienciesValue,
                Efficiencies = pc.Efficiencies ?? "",
                MaintenanceAgreementsValue = pc.MaintenanceAgreementsValue,
                MaintenanceAgreements = pc.MaintenanceAgreements ?? "",
                AsBuiltManualsValue = pc.AsBuiltManualsValue,
                AsBuiltManuals = pc.AsBuiltManuals ?? "",
                HsFileForwardedValue = pc.HsFileForwardedValue,
                HsFileForwarded = pc.HsFileForwarded ?? "",
                Variations = pc.Variations ?? "",
                TechnoLegalIssues = pc.TechnoLegalIssues ?? "",
                ConstructionOther = pc.ConstructionOther ?? "",
                Positives = pc.Positives ?? "",
                LessonsLearned = pc.LessonsLearned ?? "",
                CreatedAt = pc.CreatedAt,
                CreatedBy = pc.CreatedBy ?? "",
                UpdatedAt = pc.UpdatedAt,
                UpdatedBy = pc.UpdatedBy ?? "",

                // Removed comments mapping to fix build issues
                /*
                ProjectClosureComments = pc.Comments?.Select(c => new ProjectClosureCommentDto
                {
                    Id = c.Id,
                    ProjectClosureId = c.ProjectClosureId,
                    Type = c.Type,
                    Comment = c.Comment,
                    CreatedAt = c.CreatedAt,
                    CreatedBy = c.CreatedBy,
                    UpdatedAt = c.UpdatedAt,
                    UpdatedBy = c.UpdatedBy
                }).ToList() ?? new List<ProjectClosureCommentDto>()
                */
            }).ToList();
        }
    }
}
