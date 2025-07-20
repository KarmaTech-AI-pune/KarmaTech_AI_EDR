using MediatR;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class GetWBSVersionQueryHandler : IRequestHandler<GetWBSVersionQuery, WBSVersionDetailsDto>
    {
        private readonly IWBSVersionRepository _wbsVersionRepository;
        private readonly ILogger<GetWBSVersionQueryHandler> _logger;

        public GetWBSVersionQueryHandler(
            IWBSVersionRepository wbsVersionRepository,
            ILogger<GetWBSVersionQueryHandler> logger)
        {
            _wbsVersionRepository = wbsVersionRepository;
            _logger = logger;
        }

        public async Task<WBSVersionDetailsDto> Handle(GetWBSVersionQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var version = await _wbsVersionRepository.GetByVersionAsync(request.ProjectId, request.Version);

                if (version == null)
                {
                    _logger.LogWarning($"WBS version {request.Version} not found for project {request.ProjectId}");
                    return null;
                }

                var taskVersions = await _wbsVersionRepository.GetTaskVersionsAsync(version.Id);
                var workflowHistory = await _wbsVersionRepository.GetWorkflowHistoryAsync(version.Id);

                var versionDto = new WBSVersionDetailsDto
                {
                    Id = version.Id,
                    WorkBreakdownStructureId = version.WorkBreakdownStructureId,
                    Version = version.Version,
                    Comments = version.Comments,
                    CreatedAt = version.CreatedAt,
                    CreatedBy = version.CreatedBy,
                    CreatedByName = version.CreatedByUser?.UserName ?? version.CreatedBy,
                    StatusId = version.StatusId,
                    Status = version.Status?.Status ?? "Unknown",
                    IsActive = version.IsActive,
                    IsLatest = version.IsLatest,
                    ApprovedAt = version.ApprovedAt,
                    ApprovedBy = version.ApprovedBy,
                    ApprovedByName = version.ApprovedByUser?.UserName ?? version.ApprovedBy,
                    Tasks = taskVersions.Select(t => MapTaskVersionToDto(t)).ToList(),
                    WorkflowHistory = workflowHistory.Select(h => new WBSVersionWorkflowHistoryDto
                    {
                        Id = h.Id,
                        WBSVersionHistoryId = h.WBSVersionHistoryId,
                        StatusId = h.StatusId,
                        Status = h.Status?.Status ?? "Unknown",
                        Action = h.Action,
                        Comments = h.Comments,
                        ActionDate = h.ActionDate,
                        ActionBy = h.ActionBy,
                        ActionByName = h.ActionUser?.UserName ?? h.ActionBy,
                        AssignedToId = h.AssignedToId,
                        AssignedToName = h.AssignedTo?.UserName ?? h.AssignedToId
                    }).ToList()
                };

                _logger.LogInformation($"Retrieved WBS version {request.Version} for project {request.ProjectId}");

                return versionDto;
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving WBS version {request.Version} for project {request.ProjectId}");
                throw;
            }
        }

        private WBSTaskVersionDto MapTaskVersionToDto(WBSTaskVersionHistory taskVersion)
        {
            var totalHours = taskVersion.PlannedHours?.Sum(ph => ph.PlannedHours) ?? 0;
            // Note: Cost calculation would need to be implemented based on business logic
            var totalCost = 0m; // Placeholder - would need cost rate from elsewhere

            return new WBSTaskVersionDto
            {
                Id = taskVersion.Id,
                WBSVersionHistoryId = taskVersion.WBSVersionHistoryId,
                OriginalTaskId = taskVersion.OriginalTaskId,
                ParentId = taskVersion.ParentId,
                Level = taskVersion.Level,
                Title = taskVersion.Title,
                Description = taskVersion.Description,
                DisplayOrder = taskVersion.DisplayOrder,
                EstimatedBudget = taskVersion.EstimatedBudget,
                StartDate = taskVersion.StartDate,
                EndDate = taskVersion.EndDate,
                TaskType = taskVersion.TaskType,
                AssignedUserId = taskVersion.UserAssignments?.FirstOrDefault()?.UserId,
                AssignedUserName = taskVersion.UserAssignments?.FirstOrDefault()?.User?.UserName,
                CostRate = 0, // Placeholder - would need to get from user assignment or other source
                ResourceName = null, // Not available in version history
                ResourceUnit = null, // Not available in version history
                ResourceRoleId = taskVersion.UserAssignments?.FirstOrDefault()?.ResourceRoleId,
                ResourceRoleName = taskVersion.UserAssignments?.FirstOrDefault()?.ResourceRole?.Name,
                PlannedHours = taskVersion.PlannedHours?.Select(ph => new PlannedHourDto
                {
                    Year = int.Parse(ph.Year),
                    Month = ph.Month,
                    PlannedHours = ph.PlannedHours
                }).ToList() ?? new System.Collections.Generic.List<PlannedHourDto>(),
                TotalHours = totalHours,
                TotalCost = totalCost,
                Children = new System.Collections.Generic.List<WBSTaskVersionDto>() // Will be populated by parent handler
            };
        }
    }
} 