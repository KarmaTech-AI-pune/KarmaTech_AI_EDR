﻿using MediatR;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Handlers
{
    public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, int>
    {
        private readonly IProjectRepository _repository;

        public CreateProjectCommandHandler(IProjectRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<int> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
        {
            if (request?.ProjectDto == null)
                throw new ArgumentNullException(nameof(request));

            var dto = request.ProjectDto;
            var project = new Project
            {
                Name = dto.Name,
                ClientName = dto.ClientName,
                ProjectNo = dto.ProjectNo,
                TypeOfClient = dto.TypeOfClient,
				ProjectManagerId = dto.ProjectManagerId,
				SeniorProjectManagerId = dto.SeniorProjectManagerId,
				RegionalManagerId = dto.RegionalManagerId,
                Office=dto.Office,
				Region = dto.Region,
                TypeOfJob = dto.TypeOfJob,
				Sector = dto.Sector,
                FeeType = dto.FeeType,
                EstimatedProjectCost = dto.EstimatedProjectCost,
                EstimatedProjectFee = dto.EstimatedProjectFee,
                Percentage = dto.Percentage,
                Details = dto.Details,
                CapitalValue = dto.CapitalValue,
                Priority = dto.Priority,
				Currency = dto.Currency,
				StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = ProjectStatus.Opportunity, // Default status for new projects
                Progress = 0, // Initial progress
                DurationInMonths = dto.DurationInMonths,
                FundingStream = dto.FundingStream,
                ContractType = dto.ContractType,               
                CreatedAt = DateTime.UtcNow,
                LastModifiedAt = DateTime.UtcNow,
                CreatedBy = dto.ProjectManagerId, // Using Project Manager as creator
                LastModifiedBy = dto.ProjectManagerId,
                LetterOfAcceptance = dto.LetterOfAcceptance,
                OpportunityTrackingId = dto.OpportunityTrackingId == 0 ? null : dto.OpportunityTrackingId,
            };

            // Calculate duration in months if not provided and dates are available
            if (!dto.DurationInMonths.HasValue && dto.StartDate.HasValue && dto.EndDate.HasValue)
            {
                int months = ((dto.EndDate.Value.Year - dto.StartDate.Value.Year) * 12) +
                           dto.EndDate.Value.Month - dto.StartDate.Value.Month;
                project.DurationInMonths = months;
            }

            try
            {
                await _repository.Add(project);
                return project.Id;
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error creating project", ex);
            }
        }
    }
}
