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

            // Update project properties
            existingProject.Name = dto.Name;
            existingProject.ClientName = dto.ClientName;
            existingProject.ClientSector = dto.ClientSector;
            existingProject.Sector = dto.Sector;
            existingProject.EstimatedCost = dto.EstimatedCost;
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

            try
            {
                _repository.Update(existingProject);
                return Unit.Value;
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error updating project", ex);
            }
        }
    }
}
