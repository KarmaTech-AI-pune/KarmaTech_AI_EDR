using MediatR;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Projects.Handlers
{
    public class UpdateProjectBudgetCommandHandler : IRequestHandler<UpdateProjectBudgetCommand, ProjectBudgetUpdateResultDto>
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectBudgetChangeHistoryRepository _historyRepository;

        public UpdateProjectBudgetCommandHandler(
            IProjectRepository projectRepository,
            IProjectBudgetChangeHistoryRepository historyRepository)
        {
            _projectRepository = projectRepository ?? throw new ArgumentNullException(nameof(projectRepository));
            _historyRepository = historyRepository ?? throw new ArgumentNullException(nameof(historyRepository));
        }

        public async Task<ProjectBudgetUpdateResultDto> Handle(UpdateProjectBudgetCommand request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            // Validate that at least one budget field is provided
            if (!request.EstimatedProjectCost.HasValue && !request.EstimatedProjectFee.HasValue)
            {
                return new ProjectBudgetUpdateResultDto
                {
                    Success = false,
                    Message = "At least one budget field (EstimatedProjectCost or EstimatedProjectFee) must be provided"
                };
            }

            // Get the existing project
            var existingProject = _projectRepository.GetById(request.ProjectId);
            if (existingProject == null)
            {
                return new ProjectBudgetUpdateResultDto
                {
                    Success = false,
                    Message = $"Project with ID {request.ProjectId} not found"
                };
            }

            var historyRecords = new List<ProjectBudgetChangeHistoryDto>();
            var changesMade = false;

            // Handle EstimatedProjectCost change
            if (request.EstimatedProjectCost.HasValue && request.EstimatedProjectCost.Value != existingProject.EstimatedProjectCost)
            {
                var costHistory = await CreateBudgetChangeHistory(
                    request.ProjectId,
                    "EstimatedProjectCost",
                    existingProject.EstimatedProjectCost,
                    request.EstimatedProjectCost.Value,
                    existingProject.Currency,
                    request.ChangedBy,
                    request.Reason);

                await _historyRepository.Add(costHistory);
                historyRecords.Add(MapToDto(costHistory));

                // Update the project
                existingProject.EstimatedProjectCost = request.EstimatedProjectCost.Value;
                changesMade = true;
            }

            // Handle EstimatedProjectFee change
            if (request.EstimatedProjectFee.HasValue && request.EstimatedProjectFee.Value != existingProject.EstimatedProjectFee)
            {
                var feeHistory = await CreateBudgetChangeHistory(
                    request.ProjectId,
                    "EstimatedProjectFee",
                    existingProject.EstimatedProjectFee,
                    request.EstimatedProjectFee.Value,
                    existingProject.Currency,
                    request.ChangedBy,
                    request.Reason);

                await _historyRepository.Add(feeHistory);
                historyRecords.Add(MapToDto(feeHistory));

                // Update the project
                existingProject.EstimatedProjectFee = request.EstimatedProjectFee.Value;
                changesMade = true;
            }

            if (!changesMade)
            {
                return new ProjectBudgetUpdateResultDto
                {
                    Success = false,
                    Message = "No changes detected. New values must be different from current values."
                };
            }

            // Update audit fields
            existingProject.LastModifiedAt = DateTime.UtcNow;
            existingProject.LastModifiedBy = request.ChangedBy;

            // Save project changes
            _projectRepository.Update(existingProject);

            return new ProjectBudgetUpdateResultDto
            {
                Success = true,
                Message = $"Successfully updated project budget. {historyRecords.Count} change(s) recorded.",
                CreatedHistoryRecords = historyRecords
            };
        }

        private async Task<ProjectBudgetChangeHistory> CreateBudgetChangeHistory(
            int projectId,
            string fieldName,
            decimal oldValue,
            decimal newValue,
            string currency,
            string changedBy,
            string? reason)
        {
            var variance = newValue - oldValue;
            var percentageVariance = oldValue != 0 ? (variance / oldValue) * 100 : 0;

            return new ProjectBudgetChangeHistory
            {
                ProjectId = projectId,
                FieldName = fieldName,
                OldValue = oldValue,
                NewValue = newValue,
                Variance = variance,
                PercentageVariance = percentageVariance,
                Currency = currency,
                ChangedBy = changedBy,
                ChangedDate = DateTime.UtcNow,
                Reason = reason,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = changedBy
            };
        }

        private ProjectBudgetChangeHistoryDto MapToDto(ProjectBudgetChangeHistory history)
        {
            return new ProjectBudgetChangeHistoryDto
            {
                Id = history.Id,
                ProjectId = history.ProjectId,
                FieldName = history.FieldName,
                OldValue = history.OldValue,
                NewValue = history.NewValue,
                Variance = history.Variance,
                PercentageVariance = history.PercentageVariance,
                Currency = history.Currency,
                ChangedBy = history.ChangedBy,
                ChangedByUser = history.ChangedByUser != null ? new UserDto
                {
                    Id = history.ChangedByUser.Id,
                    Name = history.ChangedByUser.Name,
                    Email = history.ChangedByUser.Email ?? string.Empty,
                    UserName = history.ChangedByUser.UserName ?? string.Empty
                } : null,
                ChangedDate = history.ChangedDate,
                Reason = history.Reason
            };
        }
    }
}