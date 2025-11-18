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

        public UpdateProjectCommandHandler(IProjectRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
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
