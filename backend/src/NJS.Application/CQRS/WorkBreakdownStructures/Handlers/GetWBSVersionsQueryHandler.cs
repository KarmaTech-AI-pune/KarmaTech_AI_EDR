using MediatR;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class GetWBSVersionsQueryHandler : IRequestHandler<GetWBSVersionsQuery, List<WBSVersionDto>>
    {
        private readonly IWBSVersionRepository _wbsVersionRepository;
        private readonly ILogger<GetWBSVersionsQueryHandler> _logger;

        public GetWBSVersionsQueryHandler(
            IWBSVersionRepository wbsVersionRepository,
            ILogger<GetWBSVersionsQueryHandler> logger)
        {
            _wbsVersionRepository = wbsVersionRepository;
            _logger = logger;
        }

        public async Task<List<WBSVersionDto>> Handle(GetWBSVersionsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var versions = await _wbsVersionRepository.GetByProjectIdAsync(request.ProjectId);

                var versionDtos = versions.Select(v => new WBSVersionDto
                {
                    Id = v.Id,
                    WorkBreakdownStructureId = v.WorkBreakdownStructureId,
                    Version = v.Version,
                    Comments = v.Comments,
                    CreatedAt = v.CreatedAt,
                    CreatedBy = v.CreatedBy,
                    CreatedByName = v.CreatedByUser?.UserName ?? v.CreatedBy,
                    StatusId = v.StatusId,
                    Status = v.Status?.Status ?? "Unknown",
                    IsActive = v.IsActive,
                    IsLatest = v.IsLatest,
                    ApprovedAt = v.ApprovedAt,
                    ApprovedBy = v.ApprovedBy,
                    ApprovedByName = v.ApprovedByUser?.UserName ?? v.ApprovedBy,
                    TaskCount = v.TaskVersions?.Count ?? 0,
                    WorkflowHistory = v.WorkflowHistories?.Select(h => new WBSVersionWorkflowHistoryDto
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
                    }).ToList() ?? new List<WBSVersionWorkflowHistoryDto>()
                }).ToList();

                _logger.LogInformation($"Retrieved {versionDtos.Count} WBS versions for project {request.ProjectId}");

                return versionDtos;
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving WBS versions for project {request.ProjectId}");
                throw;
            }
        }
    }
} 