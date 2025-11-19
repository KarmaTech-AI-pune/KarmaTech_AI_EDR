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
    public class GetLatestWBSVersionQueryHandler : IRequestHandler<GetLatestWBSVersionQuery, WBSVersionDto>
    {
        private readonly IWBSVersionRepository _wbsVersionRepository;
        private readonly ILogger<GetLatestWBSVersionQueryHandler> _logger;

        public GetLatestWBSVersionQueryHandler(
            IWBSVersionRepository wbsVersionRepository,
            ILogger<GetLatestWBSVersionQueryHandler> logger)
        {
            _wbsVersionRepository = wbsVersionRepository;
            _logger = logger;
        }

        public async Task<WBSVersionDto> Handle(GetLatestWBSVersionQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var version = await _wbsVersionRepository.GetLatestVersionAsync(request.ProjectId);

                if (version == null)
                {
                    _logger.LogWarning($"No latest WBS version found for project {request.ProjectId}");
                    return null;
                }

                var taskVersions = await _wbsVersionRepository.GetTaskVersionsAsync(version.Id);
                var workflowHistory = await _wbsVersionRepository.GetWorkflowHistoryAsync(version.Id);

                var versionDto = new WBSVersionDto
                {
                    Id = version.Id,
                    WBSHeaderId = version.WBSHeaderId,
                    Version = version.Version,
                    Comments = version.Comments,
                    CreatedAt = version.CreatedAt,
                    CreatedBy = version.CreatedBy,
                    CreatedByName = version.CreatedByUser?.UserName ?? version.CreatedBy, // Now in WBSVersionDto
                    StatusId = version.StatusId,
                    Status = version.Status?.Status ?? "Unknown", // Now in WBSVersionDto
                    IsActive = version.IsActive,
                    IsLatest = version.IsLatest,
                    ApprovedAt = version.ApprovedAt,
                    ApprovedBy = version.ApprovedBy,
                    ApprovedByName = version.ApprovedByUser?.UserName ?? version.ApprovedBy, // Now in WBSVersionDto
                    TaskVersions = taskVersions.Select(t => MapTaskVersionToDto(t)).ToList(),
                    WorkflowHistory = workflowHistory.Select(h => new WBSVersionWorkflowHistoryDto // Use WorkflowHistory (singular)
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

                _logger.LogInformation($"Retrieved latest WBS version {version.Version} for project {request.ProjectId}");

                return versionDto;
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving latest WBS version for project {request.ProjectId}");
                throw;
            }
        }

        private WBSTaskVersionHistoryDto MapTaskVersionToDto(WBSTaskVersionHistory taskVersion)
        {
            var totalHours = taskVersion.PlannedHours?.Sum(ph => ph.PlannedHours) ?? 0;
            var totalCost = 0m;

            return new WBSTaskVersionHistoryDto
            {
                Id = taskVersion.Id,
                WBSVersionHistoryId = taskVersion.WBSVersionHistoryId,
                OriginalTaskId = taskVersion.OriginalTaskId,
                Level = taskVersion.Level,
                Title = taskVersion.Title,
                Description = taskVersion.Description,
                DisplayOrder = taskVersion.DisplayOrder,
                EstimatedBudget = taskVersion.EstimatedBudget,
                StartDate = taskVersion.StartDate ?? DateTime.MinValue, // Explicit cast
                EndDate = taskVersion.EndDate ?? DateTime.MinValue, // Explicit cast
                TaskType = taskVersion.TaskType,
                AssignedUserId = taskVersion.UserAssignments?.FirstOrDefault()?.UserId,
                AssignedUserName = taskVersion.UserAssignments?.FirstOrDefault()?.User?.UserName,
                CostRate = 0,
                ResourceName = null,
                ResourceUnit = null,
                ResourceRoleId = taskVersion.UserAssignments?.FirstOrDefault()?.ResourceRoleId,
                ResourceRoleName = taskVersion.UserAssignments?.FirstOrDefault()?.ResourceRole?.Name,
                PlannedHours = taskVersion.PlannedHours?.Select(ph => new PlannedHourDto
                {
                    Year = int.Parse(ph.Year),
                    Month = ph.Month,
                    PlannedHours = ph.PlannedHours
                }).ToList() ?? new System.Collections.Generic.List<PlannedHourDto>(),
                TotalHours = (decimal)totalHours,
                TotalCost = (decimal)totalCost
            };
        }
    }
}
