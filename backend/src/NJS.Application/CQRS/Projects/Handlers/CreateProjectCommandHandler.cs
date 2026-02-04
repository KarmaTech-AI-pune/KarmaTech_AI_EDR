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
        private readonly IProgramRepository _programRepository;
        private readonly ILogger<CreateProjectCommandHandler> _logger;

        public CreateProjectCommandHandler(
            IProjectRepository repository, 
            IProgramRepository programRepository,
            ILogger<CreateProjectCommandHandler> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _programRepository = programRepository ?? throw new ArgumentNullException(nameof(programRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Project> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
        {
            if (request?.ProjectDto == null)
                throw new ArgumentNullException(nameof(request));

            var dto = request.ProjectDto;

            // Validate ProgramId is provided
            if (dto.ProgramId <= 0)
            {
                _logger.LogWarning("Project creation failed: ProgramId is required and must be greater than 0");
                throw new ArgumentException("ProgramId is required. A project must belong to a program.", nameof(dto.ProgramId));
            }

            // Validate that the Program exists
            var program = await _programRepository.GetByIdAsync(dto.ProgramId, cancellationToken);
            if (program == null)
            {
                _logger.LogWarning("Project creation failed: Program with ID {ProgramId} not found", dto.ProgramId);
                throw new ArgumentException($"Program with ID {dto.ProgramId} does not exist. Please provide a valid ProgramId.", nameof(dto.ProgramId));
            }

            // Validate tenant match (if multi-tenant)
            if (dto.TenantId.HasValue && dto.TenantId.Value > 0 && program.TenantId != dto.TenantId.Value)
            {
                _logger.LogWarning("Project creation failed: Program {ProgramId} belongs to different tenant", dto.ProgramId);
                throw new ArgumentException($"Program with ID {dto.ProgramId} does not belong to the specified tenant.", nameof(dto.ProgramId));
            }

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
                ProgramId = dto.ProgramId // Validated ProgramId
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
                _logger.LogInformation("Project created successfully with ID {ProjectId} under Program {ProgramId}", project.Id, project.ProgramId);
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
