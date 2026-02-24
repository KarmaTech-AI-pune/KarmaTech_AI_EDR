using MediatR;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Projects.Commands;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Projects.Handlers
{
    public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, Unit>
    {
        private readonly IProjectRepository _repository;
        private readonly IProgramRepository _programRepository;
        private readonly IMediator _mediator;
        private readonly ILogger<UpdateProjectCommandHandler> _logger;

        public UpdateProjectCommandHandler(
            IProjectRepository repository, 
            IProgramRepository programRepository,
            IMediator mediator,
            ILogger<UpdateProjectCommandHandler> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _programRepository = programRepository ?? throw new ArgumentNullException(nameof(programRepository));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Unit> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
        {
            if (request?.ProjectDto == null)
                throw new ArgumentNullException(nameof(request));

            var existingProject = _repository.GetById(request.Id);
            if (existingProject == null)
                throw new ArgumentException($"Project with ID {request.Id} not found");

            var dto = request.ProjectDto;

            // Validate ProgramId if it's being changed
            if (dto.ProgramId != existingProject.ProgramId)
            {
                if (dto.ProgramId <= 0)
                {
                    _logger.LogWarning("Project update failed: ProgramId is required and must be greater than 0");
                    throw new ArgumentException("ProgramId is required. A project must belong to a program.", nameof(dto.ProgramId));
                }

                // Validate that the new Program exists
                var program = await _programRepository.GetByIdAsync(dto.ProgramId, cancellationToken);
                if (program == null)
                {
                    _logger.LogWarning("Project update failed: Program with ID {ProgramId} not found", dto.ProgramId);
                    throw new ArgumentException($"Program with ID {dto.ProgramId} does not exist. Please provide a valid ProgramId.", nameof(dto.ProgramId));
                }

                // Validate tenant match (if multi-tenant)
                if (existingProject.TenantId > 0 && program.TenantId != existingProject.TenantId)
                {
                    _logger.LogWarning("Project update failed: Program {ProgramId} belongs to different tenant", dto.ProgramId);
                    throw new ArgumentException($"Program with ID {dto.ProgramId} does not belong to the same tenant as the project.", nameof(dto.ProgramId));
                }

                _logger.LogInformation("Project {ProjectId} program changed from {OldProgramId} to {NewProgramId}", 
                    request.Id, existingProject.ProgramId, dto.ProgramId);
            }

            // Update project properties
            existingProject.Name = dto.Name;
            existingProject.ClientName = dto.ClientName;
            existingProject.TypeOfClient = dto.TypeOfClient;
            existingProject.Sector = dto.Sector ?? string.Empty; // Handle null value
            existingProject.EstimatedProjectCost = dto.EstimatedProjectCost;
            existingProject.CapitalValue = dto.CapitalValue;
            existingProject.StartDate = dto.StartDate;
            existingProject.EndDate = dto.EndDate;
            existingProject.DurationInMonths = dto.DurationInMonths;
            existingProject.FundingStream = dto.FundingStream;
            existingProject.ContractType = dto.ContractType;
            existingProject.Currency = dto.Currency;
            existingProject.ProjectManagerId = dto.ProjectManagerId;
            existingProject.RegionalManagerId = dto.RegionalManagerId;
            existingProject.SeniorProjectManagerId = dto.SeniorProjectManagerId;
            existingProject.ProjectNo = dto.ProjectNo;

            // Update fields that were previously non-nullable in DTO but are now nullable, or have specific handling
            existingProject.Office = dto.Office;
            existingProject.Region = dto.Region;
            existingProject.TypeOfJob = dto.TypeOfJob;
            existingProject.FeeType = dto.FeeType;
            existingProject.EstimatedProjectFee = dto.EstimatedProjectFee;
            existingProject.Percentage = dto.Percentage;
            existingProject.Details = dto.Details;
            existingProject.Priority = dto.Priority;
            existingProject.ProgramId = dto.ProgramId; // Validated ProgramId

            existingProject.Status = dto.Status;
            existingProject.Progress = dto.Progress;
            existingProject.LetterOfAcceptance = dto.LetterOfAcceptance;

            // Update audit fields
            existingProject.LastModifiedAt = DateTime.UtcNow;
            existingProject.LastModifiedBy = dto.ProjectManagerId;

            // Calculate duration in months if not provided and dates are available
            if (!dto.DurationInMonths.HasValue && dto.StartDate.HasValue && dto.EndDate.HasValue)
            {
                int months = ((dto.EndDate.Value.Year - dto.StartDate.Value.Year) * 12) +
                           dto.EndDate.Value.Month - dto.StartDate.Value.Month;
                existingProject.DurationInMonths = months;
            }

            // Track budget changes if budget values have changed
            var budgetChanged = existingProject.EstimatedProjectCost != dto.EstimatedProjectCost ||
                               existingProject.EstimatedProjectFee != dto.EstimatedProjectFee;

            if (budgetChanged)
            {
                try
                {
                    var budgetCommand = new UpdateProjectBudgetCommand
                    {
                        ProjectId = request.Id,
                        EstimatedProjectCost = dto.EstimatedProjectCost,
                        EstimatedProjectFee = dto.EstimatedProjectFee,
                        Reason = dto.BudgetReason,
                        ChangedBy = dto.ProjectManagerId ?? dto.LastModifiedBy
                    };

                    await _mediator.Send(budgetCommand, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error tracking budget change for project {ProjectId}", request.Id);
                    // Continue with project update even if budget tracking fails
                }
            }

            try
            {
                _repository.Update(existingProject);
                _logger.LogInformation("Project {ProjectId} updated successfully under Program {ProgramId}", 
                    existingProject.Id, existingProject.ProgramId);
                return Unit.Value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating project {ProjectId}", request.Id);
                throw new ApplicationException("Error updating project", ex);
            }
        }
    }
}
