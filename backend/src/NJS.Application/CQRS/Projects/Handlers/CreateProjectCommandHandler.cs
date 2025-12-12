﻿using MediatR;
using Microsoft.EntityFrameworkCore; // Added for DbUpdateException
using Microsoft.Extensions.Logging; // Added for ILogger
using NJS.Application.CQRS.Projects.Commands;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Handlers
{
    public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Project>
    {
        private readonly IProjectRepository _repository;
        private readonly ILogger<CreateProjectCommandHandler> _logger; // Added logger field

        public CreateProjectCommandHandler(IProjectRepository repository, ILogger<CreateProjectCommandHandler> logger) // Added logger to constructor
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger)); // Initialize logger
        }

        public async Task<Project> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
        {
            if (request?.ProjectDto == null)
                throw new ArgumentNullException(nameof(request));

            var dto = request.ProjectDto;

            // Set user IDs to null if they are "string" to allow project creation
            var projectManagerId = dto.ProjectManagerId == "string" ? null : dto.ProjectManagerId;
            var seniorProjectManagerId = dto.SeniorProjectManagerId == "string" ? null : dto.SeniorProjectManagerId;
            var regionalManagerId = dto.RegionalManagerId == "string" ? null : dto.RegionalManagerId;

            var project = new Project
            {
                TenantId = dto.TenantId ?? 0, // Set to 0 to let database context handle it
                Name = dto.Name,
                ClientName = dto.ClientName,
                ProjectNo = dto.ProjectNo,
                TypeOfClient = dto.TypeOfClient,
				ProjectManagerId = projectManagerId,
				SeniorProjectManagerId = seniorProjectManagerId,
				RegionalManagerId = regionalManagerId,
                Office = dto.Office,
				Region = dto.Region,
                TypeOfJob = dto.TypeOfJob,
				Sector = dto.Sector ?? string.Empty, // Assign empty string if Sector is null in DTO, as Entity's Sector is non-nullable
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
                CreatedBy = projectManagerId, // Using Project Manager as creator
                LastModifiedBy = projectManagerId,
                LetterOfAcceptance = dto.LetterOfAcceptance,
                OpportunityTrackingId = dto.OpportunityTrackingId == 0 ? null : dto.OpportunityTrackingId,
                ProgramId = dto.ProgramId == 0 ? null : dto.ProgramId
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
                return project;
            }
            catch (DbUpdateException ex) // Catch specific DB update exception
            {
                // Log the inner exception for detailed debugging
                _logger.LogError(ex, "Database error creating project for tenant {TenantId}. Inner Exception: {InnerExceptionMessage}", dto.TenantId, ex.InnerException?.Message ?? ex.Message);
                // Throw a more informative exception to the caller
                throw new ApplicationException($"Error creating project. Database error: {ex.InnerException?.Message ?? ex.Message}", ex.InnerException ?? ex);
            }
            catch (Exception ex) // Catch any other unexpected exceptions
            {
                _logger.LogError(ex, "Unexpected error creating project for tenant {TenantId}", dto.TenantId);
                throw new ApplicationException("An unexpected error occurred while creating the project.", ex);
            }
        }

    }
}
