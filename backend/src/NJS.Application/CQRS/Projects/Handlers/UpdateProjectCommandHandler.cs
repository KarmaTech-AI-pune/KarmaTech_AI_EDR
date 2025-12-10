using MediatR;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Handlers
{
    public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, Unit>
    {
        private readonly IProjectRepository _repository;
        private readonly IMediator _mediator;

        public UpdateProjectCommandHandler(IProjectRepository repository, IMediator mediator)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        public async Task<Unit> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
        {
            if (request?.ProjectDto == null)
                throw new ArgumentNullException(nameof(request));

            var existingProject = _repository.GetById(request.Id);
            if (existingProject == null)
                throw new ArgumentException($"Project with ID {request.Id} not found");

            var dto = request.ProjectDto;

            // Log the incoming data for the problematic fields
            Console.WriteLine($"Updating project {request.Id} with the following data:");
            Console.WriteLine($"Office: '{dto.Office}'");
            Console.WriteLine($"TypeOfJob: '{dto.TypeOfJob}'");
            Console.WriteLine($"EstimatedProjectFee: {dto.EstimatedProjectFee}");
            Console.WriteLine($"Priority: '{dto.Priority}'");

            // Update project properties
            existingProject.Name = dto.Name;
            existingProject.ClientName = dto.ClientName;
            existingProject.TypeOfClient = dto.TypeOfClient;
            existingProject.Sector = dto.Sector;
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

            // Explicitly set the problematic fields with direct assignment
            existingProject.Office = !string.IsNullOrWhiteSpace(dto.Office) ? dto.Office : existingProject.Office;
            existingProject.Region = !string.IsNullOrWhiteSpace(dto.Region) ? dto.Region : existingProject.Region;
            existingProject.TypeOfJob = !string.IsNullOrWhiteSpace(dto.TypeOfJob) ? dto.TypeOfJob : existingProject.TypeOfJob;
            existingProject.FeeType = !string.IsNullOrWhiteSpace(dto.FeeType) ? dto.FeeType : existingProject.FeeType;
            existingProject.EstimatedProjectFee = dto.EstimatedProjectFee;
            existingProject.Percentage = dto.Percentage;
            existingProject.Details = dto.Details;
            existingProject.Priority = !string.IsNullOrWhiteSpace(dto.Priority) ? dto.Priority : existingProject.Priority;

            existingProject.Status = dto.Status;
            existingProject.Progress = dto.Progress;
            existingProject.LetterOfAcceptance = dto.LetterOfAcceptance;

            // Update audit fields
            existingProject.LastModifiedAt = DateTime.UtcNow;
            existingProject.LastModifiedBy = dto.ProjectManagerId;
            // Remove UpdatedAt and UpdatedBy as they don't exist in the Project entity

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
                    Console.WriteLine($"Error tracking budget change: {ex.Message}");
                    // Continue with project update even if budget tracking fails
                }
            }

            try
            {
                // Log the project state before update
                Console.WriteLine($"Project state before update:");
                Console.WriteLine($"Office: '{existingProject.Office}'");
                Console.WriteLine($"TypeOfJob: '{existingProject.TypeOfJob}'");
                Console.WriteLine($"EstimatedProjectFee: {existingProject.EstimatedProjectFee}");
                Console.WriteLine($"Priority: '{existingProject.Priority}'");

                _repository.Update(existingProject);

                // Log the project state after update
                var updatedProject = _repository.GetById(request.Id);
                Console.WriteLine($"Project state after update:");
                Console.WriteLine($"Office: '{updatedProject.Office}'");
                Console.WriteLine($"TypeOfJob: '{updatedProject.TypeOfJob}'");
                Console.WriteLine($"EstimatedProjectFee: {updatedProject.EstimatedProjectFee}");
                Console.WriteLine($"Priority: '{updatedProject.Priority}'");

                return Unit.Value;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating project: {ex.Message}");
                throw new ApplicationException("Error updating project", ex);
            }
        }
    }
}
