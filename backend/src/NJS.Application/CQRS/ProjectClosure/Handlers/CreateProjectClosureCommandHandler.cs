using MediatR;
using NJS.Application.CQRS.ProjectClosure.Commands;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
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
        private readonly IProjectRepository _projectRepository;
        private readonly ICurrentUserService _currentUserService;

        public CreateProjectClosureCommandHandler(
            IUnitOfWork unitOfWork,
            IProjectClosureRepository projectClosureRepository,
            IProjectRepository projectRepository,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _projectClosureRepository = projectClosureRepository ?? throw new ArgumentNullException(nameof(projectClosureRepository));
            _projectRepository = projectRepository ?? throw new ArgumentNullException(nameof(projectRepository));
            _currentUserService = currentUserService ?? throw new ArgumentNullException(nameof(currentUserService));
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

                // Check if a project closure already exists for this project
                var existingClosure = await _projectClosureRepository.GetByProjectId(request.ProjectClosureDto.ProjectId);

                Console.WriteLine(existingClosure != null
                    ? $"Found existing project closure with ID {existingClosure.Id} for project ID {request.ProjectClosureDto.ProjectId}"
                    : $"Creating a new project closure entry for project ID {request.ProjectClosureDto.ProjectId}");

                // Create new project closure entity or update existing
                Domain.Entities.ProjectClosure projectClosure;
                bool isNewEntry = false;

                if (existingClosure == null)
                {
                    isNewEntry = true;
                    projectClosure = new Domain.Entities.ProjectClosure();
                }
                else
                {
                    projectClosure = existingClosure;
                }

                // Map all properties from DTO to the entity
                projectClosure.ProjectId = request.ProjectClosureDto.ProjectId;
                projectClosure.ClientFeedback = request.ProjectClosureDto.ClientFeedback;
                projectClosure.SuccessCriteria = request.ProjectClosureDto.SuccessCriteria;
                projectClosure.ClientExpectations = request.ProjectClosureDto.ClientExpectations;
                projectClosure.OtherStakeholders = request.ProjectClosureDto.OtherStakeholders;
                projectClosure.EnvIssues = request.ProjectClosureDto.EnvIssues;
                projectClosure.EnvManagement = request.ProjectClosureDto.EnvManagement;
                projectClosure.ThirdPartyIssues = request.ProjectClosureDto.ThirdPartyIssues;
                projectClosure.ThirdPartyManagement = request.ProjectClosureDto.ThirdPartyManagement;
                projectClosure.RiskIssues = request.ProjectClosureDto.RiskIssues;
                projectClosure.RiskManagement = request.ProjectClosureDto.RiskManagement;
                projectClosure.KnowledgeGoals = request.ProjectClosureDto.KnowledgeGoals;
                projectClosure.BaselineComparison = request.ProjectClosureDto.BaselineComparison;
                projectClosure.DelayedDeliverables = request.ProjectClosureDto.DelayedDeliverables;
                projectClosure.UnforeseeableDelays = request.ProjectClosureDto.UnforeseeableDelays;
                projectClosure.BudgetEstimate = request.ProjectClosureDto.BudgetEstimate;
                projectClosure.ProfitTarget = request.ProjectClosureDto.ProfitTarget;
                projectClosure.ChangeOrders = request.ProjectClosureDto.ChangeOrders;
                projectClosure.CloseOutBudget = request.ProjectClosureDto.CloseOutBudget;
                projectClosure.ResourceAvailability = request.ProjectClosureDto.ResourceAvailability;
                projectClosure.VendorFeedback = request.ProjectClosureDto.VendorFeedback;
                projectClosure.ProjectTeamFeedback = request.ProjectClosureDto.ProjectTeamFeedback;
                projectClosure.DesignOutputs = request.ProjectClosureDto.DesignOutputs;
                projectClosure.ProjectReviewMeetings = request.ProjectClosureDto.ProjectReviewMeetings;
                projectClosure.ClientDesignReviews = request.ProjectClosureDto.ClientDesignReviews;
                projectClosure.InternalReporting = request.ProjectClosureDto.InternalReporting;
                projectClosure.ClientReporting = request.ProjectClosureDto.ClientReporting;
                projectClosure.InternalMeetings = request.ProjectClosureDto.InternalMeetings;
                projectClosure.ClientMeetings = request.ProjectClosureDto.ClientMeetings;
                projectClosure.ExternalMeetings = request.ProjectClosureDto.ExternalMeetings;
                projectClosure.PlanUpToDate = request.ProjectClosureDto.PlanUpToDate;
                projectClosure.PlanningIssues = request.ProjectClosureDto.PlanningIssues;
                projectClosure.PlanningLessons = request.ProjectClosureDto.PlanningLessons;
                projectClosure.DesignReview = request.ProjectClosureDto.DesignReview;
                projectClosure.TechnicalRequirements = request.ProjectClosureDto.TechnicalRequirements;
                projectClosure.InnovativeIdeas = request.ProjectClosureDto.InnovativeIdeas;
                projectClosure.SuitableOptions = request.ProjectClosureDto.SuitableOptions;
                projectClosure.AdditionalInformation = request.ProjectClosureDto.AdditionalInformation;
                projectClosure.DeliverableExpectations = request.ProjectClosureDto.DeliverableExpectations;
                projectClosure.StakeholderInvolvement = request.ProjectClosureDto.StakeholderInvolvement;
                projectClosure.KnowledgeGoalsAchieved = request.ProjectClosureDto.KnowledgeGoalsAchieved;
                projectClosure.TechnicalToolsDissemination = request.ProjectClosureDto.TechnicalToolsDissemination;
                projectClosure.SpecialistKnowledgeValue = request.ProjectClosureDto.SpecialistKnowledgeValue;
                projectClosure.OtherComments = request.ProjectClosureDto.OtherComments;
                projectClosure.TargetCostAccuracyValue = request.ProjectClosureDto.TargetCostAccuracyValue;
                projectClosure.TargetCostAccuracy = request.ProjectClosureDto.TargetCostAccuracy;
                projectClosure.ChangeControlReviewValue = request.ProjectClosureDto.ChangeControlReviewValue;
                projectClosure.ChangeControlReview = request.ProjectClosureDto.ChangeControlReview;
                projectClosure.CompensationEventsValue = request.ProjectClosureDto.CompensationEventsValue;
                projectClosure.CompensationEvents = request.ProjectClosureDto.CompensationEvents;
                projectClosure.ExpenditureProfileValue = request.ProjectClosureDto.ExpenditureProfileValue;
                projectClosure.ExpenditureProfile = request.ProjectClosureDto.ExpenditureProfile;
                projectClosure.HealthSafetyConcernsValue = request.ProjectClosureDto.HealthSafetyConcernsValue;
                projectClosure.HealthSafetyConcerns = request.ProjectClosureDto.HealthSafetyConcerns;
                projectClosure.ProgrammeRealisticValue = request.ProjectClosureDto.ProgrammeRealisticValue;
                projectClosure.ProgrammeRealistic = request.ProjectClosureDto.ProgrammeRealistic;
                projectClosure.ProgrammeUpdatesValue = request.ProjectClosureDto.ProgrammeUpdatesValue;
                projectClosure.ProgrammeUpdates = request.ProjectClosureDto.ProgrammeUpdates;
                projectClosure.RequiredQualityValue = request.ProjectClosureDto.RequiredQualityValue;
                projectClosure.RequiredQuality = request.ProjectClosureDto.RequiredQuality;
                projectClosure.OperationalRequirementsValue = request.ProjectClosureDto.OperationalRequirementsValue;
                projectClosure.OperationalRequirements = request.ProjectClosureDto.OperationalRequirements;
                projectClosure.ConstructionInvolvementValue = request.ProjectClosureDto.ConstructionInvolvementValue;
                projectClosure.ConstructionInvolvement = request.ProjectClosureDto.ConstructionInvolvement;
                projectClosure.EfficienciesValue = request.ProjectClosureDto.EfficienciesValue;
                projectClosure.Efficiencies = request.ProjectClosureDto.Efficiencies;
                projectClosure.MaintenanceAgreementsValue = request.ProjectClosureDto.MaintenanceAgreementsValue;
                projectClosure.MaintenanceAgreements = request.ProjectClosureDto.MaintenanceAgreements;
                projectClosure.AsBuiltManualsValue = request.ProjectClosureDto.AsBuiltManualsValue;
                projectClosure.AsBuiltManuals = request.ProjectClosureDto.AsBuiltManuals;
                projectClosure.HsFileForwardedValue = request.ProjectClosureDto.HsFileForwardedValue;
                projectClosure.HsFileForwarded = request.ProjectClosureDto.HsFileForwarded;
                projectClosure.Variations = request.ProjectClosureDto.Variations;
                projectClosure.TechnoLegalIssues = request.ProjectClosureDto.TechnoLegalIssues;
                projectClosure.ConstructionOther = request.ProjectClosureDto.ConstructionOther;
                projectClosure.PlanUseful = request.ProjectClosureDto.PlanUseful;
                projectClosure.Hindrances = request.ProjectClosureDto.Hindrances;
                projectClosure.ClientPayment = request.ProjectClosureDto.ClientPayment;
                projectClosure.BriefAims = request.ProjectClosureDto.BriefAims;
                projectClosure.DesignReviewOutputs = request.ProjectClosureDto.DesignReviewOutputs;
                projectClosure.ConstructabilityReview = request.ProjectClosureDto.ConstructabilityReview;
                projectClosure.Positives = request.ProjectClosureDto.Positives;
                projectClosure.LessonsLearned = request.ProjectClosureDto.LessonsLearned;

                // Audit fields
                if (isNewEntry)
                {
                    projectClosure.CreatedAt = request.ProjectClosureDto.CreatedAt != default ? request.ProjectClosureDto.CreatedAt : DateTime.UtcNow;
                    projectClosure.CreatedBy = request.ProjectClosureDto.CreatedBy ?? _currentUserService.UserId;
                }
                else
                {
                    projectClosure.UpdatedAt = request.ProjectClosureDto.UpdatedAt ?? DateTime.UtcNow;
                    projectClosure.UpdatedBy = request.ProjectClosureDto.UpdatedBy ?? _currentUserService.UserId;
                }

               

               // await _unitOfWork.SaveChangesAsync(); // Commit changes to the database and get the generated ID for new entities

                // After projectClosure entity is saved and its ID is available
                var project = _projectRepository.GetById(request.ProjectClosureDto.ProjectId); // Await this call
                var dateNow = DateTime.UtcNow;
                var histories = new List<Domain.Entities.ProjectClosureWorkflowHistory>();

                // Only add initial histories for new entries
                if (isNewEntry)
                {
                    if (project?.ProjectManagerId is not null)
                    {
                        histories.Add(new Domain.Entities.ProjectClosureWorkflowHistory()
                        {
                            Action = "Initial",
                            Comments = "Submitted",
                            StatusId = (int)PMWorkflowStatusEnum.Initial,
                            ActionDate = dateNow,
                            AssignedToId = project.ProjectManagerId,
                            ProjectClosureId = projectClosure.Id, // Now projectClosure.Id will have the correct value
                            ActionBy = _currentUserService.UserId
                        });
                    }

                    if (project?.SeniorProjectManagerId is not null)
                    {
                        histories.Add(new Domain.Entities.ProjectClosureWorkflowHistory()
                        {
                            Action = "Initial",
                            Comments = "Submitted",
                            StatusId = (int)PMWorkflowStatusEnum.Initial,
                            ActionDate = dateNow,
                            AssignedToId = project.SeniorProjectManagerId,
                            ProjectClosureId = projectClosure.Id, // Now projectClosure.Id will have the correct value
                            ActionBy = _currentUserService.UserId
                        });
                    }

                    if (project?.RegionalManagerId is not null)
                    {
                        histories.Add(new Domain.Entities.ProjectClosureWorkflowHistory()
                        {
                            Action = "Initial",
                            Comments = "Submitted",
                            StatusId = (int)PMWorkflowStatusEnum.Initial,
                            ActionDate = dateNow,
                            AssignedToId = project.RegionalManagerId,
                            ProjectClosureId = projectClosure.Id, // Now projectClosure.Id will have the correct value
                            ActionBy = _currentUserService.UserId
                        });
                    }

                    // Assign the histories to the navigation property of the projectClosure entity
                    // This assumes EF Core will cascade save these when projectClosure is saved/updated
                    projectClosure.WorkflowHistories = histories;
                    if (isNewEntry)
                    {
                        await _projectClosureRepository.Add(projectClosure);
                    }
                    else
                    {
                        _projectClosureRepository.Update(projectClosure);
                    }
                    //_projectClosureRepository.Update(projectClosure); // Mark projectClosure as updated to save histories
                    await _unitOfWork.SaveChangesAsync(); // Save histories
                }

                return projectClosure.Id; // Return the ID of the created/updated Project Closure
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
