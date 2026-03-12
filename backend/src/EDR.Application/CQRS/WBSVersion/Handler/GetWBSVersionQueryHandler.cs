using MediatR;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Handlers
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
                    WBSHeaderId = version.WBSHeaderId, // Use WBSHeaderId
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
                    Tasks = taskVersions
                        .GroupBy(t => t.OriginalTaskId)
                        .Select(g => g.OrderByDescending(t => t.PlannedHours?.Count ?? 0).First())
                        .Select(t => MapTaskVersionToDto(t))
                        .ToList(),
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
            var assignment = taskVersion.UserAssignments?.FirstOrDefault();
            var totalHours = (decimal)(assignment?.TotalHours ?? 0);
            var totalCost = assignment?.TotalCost ?? 0m;
            var costRate = assignment?.CostRate ?? 0m;

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
                WBSOptionId = taskVersion.WBSOptionId,
                StartDate = taskVersion.StartDate ?? DateTime.MinValue,
                EndDate = taskVersion.EndDate ?? DateTime.MinValue,
                TaskType = taskVersion.TaskType,
                AssignedUserId = assignment?.UserId,
                AssignedUserName = assignment?.User?.UserName,
                CostRate = costRate,
                ResourceName = assignment?.Name, 
                ResourceUnit = assignment?.Unit, 
                ResourceRoleId = assignment?.ResourceRoleId,
                ResourceRoleName = assignment?.ResourceRole?.Name,
                PlannedHours = taskVersion.PlannedHours?.Select(ph => new PlannedHourDto
                {
                    Year = int.Parse(ph.Year),
                    Month = ph.Month,
                    PlannedHours = ph.PlannedHours
                }).ToList() ?? new System.Collections.Generic.List<PlannedHourDto>(),
                TotalHours = totalHours,
                TotalCost = totalCost
            };
        }
    }
}

