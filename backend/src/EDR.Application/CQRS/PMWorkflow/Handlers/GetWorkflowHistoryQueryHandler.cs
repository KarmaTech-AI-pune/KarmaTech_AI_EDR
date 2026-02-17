using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.PMWorkflow.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.PMWorkflow.Handlers
{
    public class GetWorkflowHistoryQueryHandler : IRequestHandler<GetWorkflowHistoryQuery, PMWorkflowHistoryDto>
    {
        private readonly ProjectManagementContext _context;

        public GetWorkflowHistoryQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<PMWorkflowHistoryDto> Handle(GetWorkflowHistoryQuery request, CancellationToken cancellationToken)
        {
            if (request.EntityType == "ChangeControl")
            {
                var changeControl = await _context.ChangeControls
                    .Include(c => c.WorkflowStatus)
                    .FirstOrDefaultAsync(c => c.Id == request.EntityId, cancellationToken);
                
                if (changeControl == null)
                    throw new Exception($"Change Control with ID {request.EntityId} not found");
                
                var history = await _context.ChangeControlWorkflowHistories
                    .Where(h => h.ChangeControlId == request.EntityId)
                    .Include(h => h.Status)
                    .Include(h => h.ActionUser)
                    .Include(h => h.AssignedTo)
                    .OrderByDescending(h => h.ActionDate)
                    .ToListAsync(cancellationToken);
                
                var result = new PMWorkflowHistoryDto
                {
                    EntityId = request.EntityId,
                    EntityType = "ChangeControl",
                    CurrentStatusId = changeControl.WorkflowStatusId,
                    CurrentStatus = changeControl.WorkflowStatus?.Status ?? "Unknown",
                    History = history.Select(h => new PMWorkflowDto
                    {
                        Id = h.Id,
                        EntityId = h.ChangeControlId,
                        EntityType = "ChangeControl",
                        StatusId = h.StatusId,
                        Status = h.Status?.Status ?? "Unknown",
                        Action = h.Action,
                        Comments = h.Comments,
                        ActionDate = h.ActionDate,
                        ActionBy = h.ActionBy,
                        ActionByName = h.ActionUser?.UserName ?? "Unknown",
                        AssignedToId = h.AssignedToId,
                        AssignedToName = h.AssignedTo?.UserName ?? "None"
                    }).ToList()
                };
                
                return result;
            }
            else if (request.EntityType == "ProjectClosure")
            {
                var projectClosure = await _context.ProjectClosures
                    .Include(p => p.WorkflowStatus)
                    .FirstOrDefaultAsync(p => p.Id == request.EntityId, cancellationToken);
                
                if (projectClosure == null)
                    throw new Exception($"Project Closure with ID {request.EntityId} not found");
                
                var history = await _context.ProjectClosureWorkflowHistories
                    .Where(h => h.ProjectClosureId == request.EntityId)
                    .Include(h => h.Status)
                    .Include(h => h.ActionUser)
                    .Include(h => h.AssignedTo)
                    .OrderByDescending(h => h.ActionDate)
                    .ToListAsync(cancellationToken);
                
                var result = new PMWorkflowHistoryDto
                {
                    EntityId = request.EntityId,
                    EntityType = "ProjectClosure",
                    CurrentStatusId = projectClosure.WorkflowStatusId,
                    CurrentStatus = projectClosure.WorkflowStatus?.Status ?? "Unknown",
                    History = history.Select(h => new PMWorkflowDto
                    {
                        Id = h.Id,
                        EntityId = h.ProjectClosureId,
                        EntityType = "ProjectClosure",
                        StatusId = h.StatusId,
                        Status = h.Status?.Status ?? "Unknown",
                        Action = h.Action,
                        Comments = h.Comments,
                        ActionDate = h.ActionDate,
                        ActionBy = h.ActionBy,
                        ActionByName = h.ActionUser?.UserName ?? "Unknown",
                        AssignedToId = h.AssignedToId,
                        AssignedToName = h.AssignedTo?.UserName ?? "None"
                    }).ToList()
                };
                
                return result;
            }
            
            throw new ArgumentException("Invalid entity type");
        }
    }
}

