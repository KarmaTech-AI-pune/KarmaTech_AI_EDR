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
    public class GetWBSVersionWorkflowHistoryQueryHandler : IRequestHandler<GetWBSVersionWorkflowHistoryQuery, List<WBSVersionWorkflowHistoryDto>>
    {
        private readonly IWBSVersionRepository _wbsVersionRepository;
        private readonly ILogger<GetWBSVersionWorkflowHistoryQueryHandler> _logger;

        public GetWBSVersionWorkflowHistoryQueryHandler(
            IWBSVersionRepository wbsVersionRepository,
            ILogger<GetWBSVersionWorkflowHistoryQueryHandler> logger)
        {
            _wbsVersionRepository = wbsVersionRepository;
            _logger = logger;
        }

        public async Task<List<WBSVersionWorkflowHistoryDto>> Handle(GetWBSVersionWorkflowHistoryQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var workflowHistory = await _wbsVersionRepository.GetWorkflowHistoryAsync(request.WBSVersionHistoryId);

                var workflowHistoryDtos = workflowHistory.Select(h => new WBSVersionWorkflowHistoryDto
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
                }).ToList();

                _logger.LogInformation($"Retrieved {workflowHistoryDtos.Count} workflow history entries for WBS version {request.WBSVersionHistoryId}");

                return workflowHistoryDtos;
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving workflow history for WBS version {request.WBSVersionHistoryId}");
                throw;
            }
        }
    }
} 